#!/usr/bin/env bash
# 营养地图 · 腾讯云一键部署脚本
#
# 用法（在项目根目录或 tencent/ 目录下均可）：
#   sudo bash tencent/one-click.sh
#
# 脚本幂等：Docker 已装则跳过安装，容器已存在则重建；重复执行安全。
# 覆盖：装 Docker（国内源自动回退）→ 配镜像加速 → 授予 docker 权限
#       → 构建镜像 → 启动容器 → 健康检查。
set -euo pipefail

# ---------- 定位项目根 ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "${SCRIPT_DIR}/docker-compose.yml" ]; then
  TENANT_DIR="${SCRIPT_DIR}"           # 脚本位于 tencent/
elif [ -f "${SCRIPT_DIR}/tencent/docker-compose.yml" ]; then
  TENANT_DIR="${SCRIPT_DIR}/tencent"   # 脚本位于项目根
else
  echo "找不到 tencent/docker-compose.yml，请把脚本放在项目根或 tencent 目录下运行。" >&2
  exit 1
fi
PROJECT_ROOT="$(cd "${TENANT_DIR}/.." && pwd)"

if [ "$(id -u)" -ne 0 ]; then
  echo "请以 root 执行：sudo bash $0" >&2
  exit 1
fi

echo "==============================================="
echo " 营养地图 · 一键部署"
echo " 项目根：${PROJECT_ROOT}"
echo "==============================================="

# ---------- 1. 系统与依赖 ----------
. /etc/os-release
if [ "${ID:-}" != "ubuntu" ] && [ "${ID:-}" != "debian" ]; then
  echo "本脚本面向 Ubuntu/Debian；检测到 ${ID:-未知}，后续步骤可能需手工调整。" >&2
fi

echo
echo "[1/6] 清理残留 Docker 源并安装基础依赖"
rm -f /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y ca-certificates curl wget git ufw python3

# ---------- 2. swap（低内存防编译 OOM） ----------
echo
echo "[2/6] 检查内存"
MEM_GB=$(awk '/MemTotal/ {printf "%d", $2/1024/1024}' /proc/meminfo)
SWAP_KB=$(awk '/SwapTotal/ {print $2}' /proc/meminfo)
if [ "${MEM_GB:-0}" -lt 4 ] && [ "${SWAP_KB:-0}" -lt 1048576 ]; then
  if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
    chmod 600 /swapfile
    mkswap /swapfile >/dev/null
  fi
  swapon /swapfile 2>/dev/null || true
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "  已启用 2 GB swap（内存 ${MEM_GB} GB）"
else
  echo "  内存 ${MEM_GB} GB、swap ${SWAP_KB} KB，无需补充"
fi

# ---------- 3. Docker ----------
echo
echo "[3/6] 安装 Docker"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "  已安装：$(docker --version)"
  echo "  compose：$(docker compose version --short 2>/dev/null || echo 已就绪)"
else
  install -m 0755 -d /etc/apt/keyrings
  CODENAME="${UBUNTU_CODENAME:-${VERSION_CODENAME:-noble}}"
  DOCKER_SOURCES=(
    "阿里云|https://mirrors.aliyun.com/docker-ce/linux/ubuntu"
    "清华|https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu"
    "中科大|https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu"
    "Docker官方|https://download.docker.com/linux/ubuntu"
  )
  DOCKER_OK=0
  for entry in "${DOCKER_SOURCES[@]}"; do
    src_name="${entry%%|*}"
    src_url="${entry##*|}"
    echo "  尝试 ${src_name} 源…"
    if curl -fsSL --max-time 20 "${src_url}/gpg" -o /etc/apt/keyrings/docker.asc 2>/dev/null; then
      chmod a+r /etc/apt/keyrings/docker.asc
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] ${src_url} ${CODENAME} stable" \
        > /etc/apt/sources.list.d/docker.list
      if apt-get update -y \
          -o Dir::Etc::sourcelist=/etc/apt/sources.list.d/docker.list \
          -o Dir::Etc::sourceparts=- >/dev/null 2>&1; then
        DOCKER_OK=1
        echo "  使用 ${src_name} 源"
        break
      fi
    fi
    echo "  ${src_name} 源不可用，换下一个"
  done
  if [ "${DOCKER_OK}" -ne 1 ]; then
    echo "所有 Docker 源均不可用，请检查网络。" >&2
    exit 1
  fi
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  echo "  安装完成：$(docker --version)"
fi

# ---------- 4. 镜像加速 + 权限 ----------
echo
echo "[4/6] 配置镜像加速与权限"
mkdir -p /etc/docker
if [ -s /etc/docker/daemon.json ]; then
  python3 - <<'PY'
import json
p = '/etc/docker/daemon.json'
cfg = json.load(open(p, encoding='utf-8'))
mirrors = cfg.setdefault('registry-mirrors', [])
url = 'https://mirror.ccs.tencentyun.com'
if url not in mirrors:
    mirrors.insert(0, url)
json.dump(cfg, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
PY
else
  cat > /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
}
EOF
fi
python3 -m json.tool /etc/docker/daemon.json >/dev/null
systemctl daemon-reload
systemctl restart docker

TARGET_USER="${SUDO_USER:-}"
if [ -n "${TARGET_USER}" ] && [ "${TARGET_USER}" != "root" ]; then
  groupadd -f docker
  usermod -aG docker "${TARGET_USER}" || true
  echo "  已将 ${TARGET_USER} 加入 docker 组（重新登录后生效）"
fi

# ---------- 5. 构建并启动 ----------
echo
echo "[5/6] 构建并启动容器（首次需下载基础镜像，约几分钟）"
cd "${TENANT_DIR}"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  已生成 .env（默认用 IP 访问即可）"
fi

# 端口预检：80 被占用是常见失败点
PORT=$(grep -E '^HTTP_PORT=' .env 2>/dev/null | head -1 | cut -d= -f2 | tr -d ' \r')
PORT="${PORT:-80}"

port_in_use() { ss -tlnH "sport = :$1" 2>/dev/null | grep -q .; }

if port_in_use "${PORT}"; then
  echo "  端口 ${PORT} 已被占用，先清理本项目残留容器…"
  docker rm -f nutrition-web nutrition-api >/dev/null 2>&1 || true
  sleep 2
fi

if port_in_use "${PORT}"; then
  echo "  端口 ${PORT} 仍被其他进程占用，占用者："
  ss -tlnp "sport = :${PORT}" 2>/dev/null | tail -n +2 | sed 's/^/    /'
  echo "  自动切换到 8080 端口继续部署。"
  PORT=8080
  if port_in_use "${PORT}"; then
    echo "  8080 也被占用，请手动改 .env 里的 HTTP_PORT 后重跑。" >&2
    exit 1
  fi
  sed -i "s/^HTTP_PORT=.*/HTTP_PORT=${PORT}/" .env
fi

docker compose up -d --build

# ---------- 6. 健康检查 ----------
echo
echo "[6/6] 等待服务就绪（端口 ${PORT}）"
for i in $(seq 1 50); do
  if curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
    echo
    echo "==============================================="
    echo " 部署成功"
    echo "==============================================="
    docker compose ps
    echo
    echo "访问：http://$(curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null || echo '服务器公网IP'):${PORT}"
    echo
    if [ "${PORT}" != "80" ]; then
      echo "★ 端口不是 80：请在腾讯云控制台『防火墙』放行 TCP ${PORT}。"
    else
      echo "★ 若浏览器打不开，请在腾讯云控制台本实例的『防火墙』标签放行 TCP 80。"
    fi
    exit 0
  fi
  printf '.'
  sleep 3
done

echo
echo "健康检查超时，最近日志：" >&2
docker compose logs --tail=80 >&2
exit 1
