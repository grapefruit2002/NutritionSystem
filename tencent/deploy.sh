#!/usr/bin/env bash
# 在项目根的 tencent/ 目录下执行：bash deploy.sh
# 负责：生成 .env、构建并启动容器、健康检查、失败时打印日志。
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${SCRIPT_DIR}"

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "未检测到 Docker / compose 插件，请先以 root 执行 setup-server.sh。" >&2
  exit 1
fi

ENV_FILE="${SCRIPT_DIR}/.env"
if [ ! -f "${ENV_FILE}" ]; then
  cp "${SCRIPT_DIR}/.env.example" "${ENV_FILE}"
  echo "已生成 .env（首次部署）。请把 SITE_ORIGIN 改成你的实际域名后重跑本脚本。"
fi

echo "==> 构建并启动容器"
docker compose up -d --build

echo "==> 等待服务就绪（最多 120 秒）"
for i in $(seq 1 40); do
  if curl -fsS http://127.0.0.1/health >/dev/null 2>&1; then
    echo
    echo "健康检查通过：http://127.0.0.1/health"
    echo
    docker compose ps
    echo
    echo "部署完成。浏览器打开 http://你的服务器IP 或域名 即可访问。"
    exit 0
  fi
  printf '.'
  sleep 3
done

echo
echo "健康检查超时，最近日志如下：" >&2
docker compose logs --tail=80 >&2
exit 1
