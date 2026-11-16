#!/usr/bin/env python3
"""把后端 SQLite 的参考数据导出为 D1 可执行的 seed.sql。

用法：
    python scripts/export-seed.py [--db ../data.db] [--out db/seed.sql]

只导出参考数据（人群 / 营养素 / 食物 / 参考摄入量 / 吸收证据），
不导出饮食记录，避免把本地个人记录带上线。
"""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

# 导出顺序遵循外键依赖，删除时反向执行
TABLES: list[tuple[str, list[str]]] = [
    ("PopulationGroups", [
        "Id", "Code", "DisplayName", "MinAgeMonths", "MaxAgeMonths", "Sex", "LifeStage", "Notes",
    ]),
    ("Nutrients", [
        "Id", "Slug", "Name", "EnglishName", "Group", "Subgroup", "CanonicalUnit",
        "Summary", "Description", "IsFatSoluble", "DisplayOrder", "IsPublished",
    ]),
    ("Foods", [
        "Id", "Slug", "Name", "Category", "Description", "IsPublished", "SourceName", "SourceUrl",
    ]),
    ("NutrientReferences", [
        "Id", "NutrientId", "PopulationGroupId", "Type", "Amount", "Unit", "SourceName",
        "SourceUrl", "StandardVersion", "Notes", "UpdatedAtUtc",
    ]),
    ("FoodNutrients", [
        "Id", "FoodId", "NutrientId", "AmountPer100g", "Unit", "PreparationState",
        "SourceName", "SourceUrl",
    ]),
    ("AbsorptionEvidence", [
        "Id", "NutrientId", "Title", "Summary", "Direction", "Applicability",
        "EvidenceLevel", "SourceName", "SourceUrl", "ReviewedAtUtc",
    ]),
]


def literal(value: object) -> str:
    """把 Python 值转成 SQL 字面量。"""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        text = repr(value)
        return text if text not in ("inf", "-inf", "nan") else "NULL"
    if isinstance(value, bytes):
        return "X'" + value.hex() + "'"
    return "'" + str(value).replace("'", "''") + "'"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", default=str(Path(__file__).resolve().parents[2] / "data.db"))
    parser.add_argument("--out", default=str(Path(__file__).resolve().parents[1] / "db" / "seed.sql"))
    args = parser.parse_args()

    source = Path(args.db).resolve()
    if not source.exists():
        raise SystemExit(f"找不到数据库：{source}")

    connection = sqlite3.connect(f"file:{source}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row

    lines = [
        "-- 由 scripts/export-seed.py 从 data.db 自动生成，请勿手工编辑。",
        "-- 重复执行会先清空参考数据再写入，饮食记录不受影响。",
        "-- 不使用 BEGIN/COMMIT：D1 的 d1 execute 自行管理事务，显式事务会与之冲突。",
        "-- 删除按子表到父表、写入按父表到子表，外键约束在过程中始终成立。",
    ]
    counts: list[str] = []

    for table, _columns in reversed(TABLES):
        lines.append(f'DELETE FROM "{table}";')

    for table, columns in TABLES:
        rows = connection.execute(
            f'SELECT {", ".join(chr(34) + c + chr(34) for c in columns)} FROM "{table}" ORDER BY "Id"'
        ).fetchall()
        counts.append(f"{table}={len(rows)}")
        if not rows:
            continue
        column_sql = ", ".join(f'"{column}"' for column in columns)
        for row in rows:
            values = ", ".join(literal(row[column]) for column in columns)
            lines.append(f'INSERT INTO "{table}" ({column_sql}) VALUES ({values});')

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    # 行分隔用 \n，避免 Windows 换行让 sqlite 解析出多余字符
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")

    connection.close()
    print(f"已写入 {out}（{out.stat().st_size} 字节）：" + "，".join(counts))


if __name__ == "__main__":
    main()
