#!/usr/bin/env bash
# 在一台全新的腾讯云 Ubuntu 24.04 服务器上以 root 执行：
#   bash setup-server.sh
# 作用：安装 Docker 引擎与 compose 插件，创建部署用户与目录，配置防火墙。
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "请以 root 执行：sudo bash setup-server.sh" >&2
  exit 1
fi

. /etc/os-release
if [ "${ID:-}" != "ubuntu" ]; then
  echo "本脚本面向 Ubuntu；检测到 ${ID:-未知系统}，Docker 安装部分请自行调整。" >&2
  exit 1
fi

echo "==> 清理可能残留的 Docker 源（避免旧源拖垮 apt-get update）"
rm -f /etc/apt/sources.list.d/docker.list

echo "==> 更新软件源并安装依赖"
apt-get update -y
apt-get install -y ca-certificates curl wget git ufw python3

echo "==> 检查内存，低于 4 GB 时补充 2 GB swap（编译 .NET/前端时防 OOM）"
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
  echo "已启用 2 GB swap。"
else
  echo "内存 ${MEM_GB} GB、swap ${SWAP_KB} KB，无需补充。"
fi

echo "==> 配置 Docker apt 源（国内镜像优先，自动回退）"
install -m 0755 -d /etc/apt/keyrings

CODENAME="${UBUNTU_CODENAME:-noble}"
# 依次尝试：阿里云 -> 清华 -> 中科大 -> Docker 官方（需代理）
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
  echo "  尝试 ${src_name}：${src_url}"
  if curl -fsSL --max-time 20 "${src_url}/gpg" -o /etc/apt/keyrings/docker.asc 2>/dev/null; then
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] ${src_url} ${CODENAME} stable" \
      > /etc/apt/sources.list.d/docker.list
    # 仅刷新该源，避免全量更新拖慢
    if apt-get update -y \
        -o Dir::Etc::sourcelist=/etc/apt/sources.list.d/docker.list \
        -o Dir::Etc::sourceparts=- >/dev/null 2>&1; then
      DOCKER_OK=1
      echo "  使用 ${src_name} 源成功"
      break
    fi
  fi
  echo "  ${src_name} 不可用，继续下一个"
done

if [ "${DOCKER_OK}" -ne 1 ]; then
  echo "所有 Docker apt 源均不可用，请检查服务器网络后重试。" >&2
  exit 1
fi

echo "==> 安装 Docker 引擎与 compose 插件"
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

docker --version
docker compose version

echo "==> 配置 Docker Hub 内网镜像加速（腾讯云轻量/CVM 均适用）"
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
print('已合并镜像加速到现有 daemon.json')
PY
else
  cat > /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
}
EOF
  echo "已创建 daemon.json 并配置镜像加速"
fi
python3 -m json.tool /etc/docker/daemon.json >/dev/null
systemctl daemon-reload
systemctl restart docker

echo "==> 配置系统防火墙：放行 SSH / HTTP / HTTPS"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status --verbose | head -20

echo
echo "服务器系统初始化完成。"
echo
echo "★ 重要（轻量应用服务器 Lighthouse）：还必须在腾讯云控制台放行端口！"
echo "  进入本实例 →『防火墙』标签 → 添加规则：TCP 80（以及后续 HTTPS 的 TCP 443），来源 0.0.0.0/0。"
echo "  控制台防火墙与系统内的 ufw 是两层，只开 ufw 而控制台未放行，浏览器仍无法访问。"
echo
echo "下一步：用普通用户把代码 clone 到服务器，然后执行 tencent/deploy.sh。"
