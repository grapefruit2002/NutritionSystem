#!/usr/bin/env python3
"""对照测试：同时请求 .NET 版 API 与 Worker 版 API，逐字段比较响应是否一致。

用法（两个服务都在跑）：
    python scripts/parity-check.py --dotnet http://127.0.0.1:5199 --worker http://127.0.0.1:8787

只比较 GET 端点；饮食记录涉及写入，单独手工验证。
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request

ENDPOINTS = [
    "/health",
    "/api/nutrients",
    "/api/nutrients?group=vitamin",
    "/api/nutrients?group=mineral",
    "/api/nutrients?group=unknown",
    "/api/nutrients?keyword=vitaminD",
    "/api/nutrients?keyword=%E9%92%99",
    "/api/nutrients/vitamin-d",
    "/api/nutrients/vitamin-d?populationCode=adult",
    "/api/foods",
    "/api/foods?keyword=%E9%B1%BC",
    "/api/foods/overview",
    "/api/foods/salmon-cooked",
    "/api/reference/populations",
    "/api/reference/intakes?populationCode=child",
    "/api/reference/intakes",
    "/api/nutrients/not-exist",
]


def fetch(base: str, path: str) -> tuple[int, object]:
    request = urllib.request.Request(base + path, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
            if not body:
                return response.status, None
            try:
                return response.status, json.loads(body)
            except json.JSONDecodeError:
                return response.status, body
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8")
        try:
            return error.code, json.loads(body) if body else None
        except json.JSONDecodeError:
            return error.code, body


def diff(left: object, right: object, path: str = "$") -> list[str]:
    """返回结构与取值差异描述，最多保留 20 条。"""
    issues: list[str] = []

    def walk(a: object, b: object, where: str) -> None:
        if len(issues) >= 20:
            return
        if type(a) is not type(b) and not (isinstance(a, (int, float)) and isinstance(b, (int, float))):
            issues.append(f"{where}: 类型不同 .NET={type(a).__name__} worker={type(b).__name__}")
            return
        if isinstance(a, dict):
            keys_a, keys_b = set(a), set(b)
            for missing in sorted(keys_a - keys_b):
                issues.append(f"{where}.{missing}: 仅 .NET 有")
            for extra in sorted(keys_b - keys_a):
                issues.append(f"{where}.{extra}: 仅 worker 有")
            for key in sorted(keys_a & keys_b):
                # traceId 是每次请求生成的链路标识，只校验类型不校验取值
                if key == "traceId":
                    if not (isinstance(b[key], str) and b[key]):
                        issues.append(f"{where}.traceId: worker 未返回字符串")
                    continue
                walk(a[key], b[key], f"{where}.{key}")
            return
        if isinstance(a, list):
            if len(a) != len(b):
                issues.append(f"{where}: 长度不同 .NET={len(a)} worker={len(b)}")
            for index, (item_a, item_b) in enumerate(zip(a, b)):
                walk(item_a, item_b, f"{where}[{index}]")
            return
        if a != b:
            issues.append(f"{where}: .NET={a!r} worker={b!r}")

    walk(left, right, path)
    return issues


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dotnet", default="http://127.0.0.1:5199")
    parser.add_argument("--worker", default="http://127.0.0.1:8787")
    args = parser.parse_args()

    failures = 0
    for path in ENDPOINTS:
        status_dotnet, body_dotnet = fetch(args.dotnet, path)
        status_worker, body_worker = fetch(args.worker, path)

        problems: list[str] = []
        if status_dotnet != status_worker:
            problems.append(f"状态码不同 .NET={status_dotnet} worker={status_worker}")
        problems.extend(diff(body_dotnet, body_worker))

        if problems:
            failures += 1
            print(f"✗ {path}")
            for line in problems:
                print(f"    {line}")
        else:
            print(f"✓ {path}")

    print()
    if failures:
        print(f"{failures} 个端点不一致")
        return 1
    print(f"{len(ENDPOINTS)} 个端点全部一致")
    return 0


if __name__ == "__main__":
    sys.exit(main())
