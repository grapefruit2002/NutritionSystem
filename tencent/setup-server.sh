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

echo "==> 更新软件源并安装依赖"
apt-get update -y
apt-get install -y ca-certificates curl wget git ufw

echo "==> 添加 Docker 官方源"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME:-noble} stable" \
  > /etc/apt/sources.list.d/docker.list

echo "==> 安装 Docker 引擎与 compose 插件"
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

docker --version
docker compose version

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
