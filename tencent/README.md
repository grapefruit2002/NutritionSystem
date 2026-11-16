# 部署到腾讯云（Docker 版）

这套配置把系统作为**第二套独立实例**部署到腾讯云 CVM，与已上线的 Cloudflare 版本并存。两处域名不同互不影响，因为前端调用 API 一律走相对路径 `/api`，由 Nginx 反向代理到本机后端——换域名不用改一行代码。

## 与 Cloudflare 版的关系

| | Cloudflare | 腾讯云（本目录） |
|---|---|---|
| 后端 | Worker 里的 JS（等价重写） | 原生 ASP.NET Core .NET 10 |
| 数据库 | D1 | 容器卷里的 SQLite `data.db` |
| 域名 | `*.nutrimap.workers.dev` / `*.pages.dev` | 你自己的备案域名 |
| 数据 | 独立 | 独立，**不与 D1 自动同步** |

两侧的基础营养数据来自同一份种子（31 营养素 / 80 食物 / 886 成分 / 105 参考量 / 15 证据 / 3 人群），内容一致。但**饮食记录是各自独立的**：在腾讯云上新增的记录不会出现在 Cloudflare，反之亦然。如果你希望两侧饮食记录也一致，需要另外做数据迁移（见文末）。

## 架构

```
公网域名:80
    │
    ▼
nginx 容器 (web)  ── 静态前端 dist
    │ /api/*、/health
    ▼
.NET 10 API 容器 (api)  ── 卷 nutrition-data:/app/data/data.db
```

两个容器在独立网络 `nutrition-net` 内通信，只有 web 的 80 端口对外暴露；API 不直接对公网开放。

## 前置条件

- 一台腾讯云服务器，建议 **2 核 2 GB 及以上、Ubuntu 24.04 LTS 64 位**，已分配公网 IP。CVM 或轻量应用服务器（Lighthouse）均可，本方案已验证后者。
- 一个已完成 **ICP 备案** 的域名（中国大陆服务器对未备案域名会拦截 80/443 访问）。域名 A 记录指向该公网 IP。仅用 IP 访问可先跳过域名。
- 代码已 push 到 GitHub（本仓库）。服务器上用 git clone 拉取。

> 备案是硬性要求：腾讯云大陆地域的服务器，未备案域名无法通过 80/443 对外提供 Web 服务。备案通常要数个工作日至数周，建议尽早启动。

> 轻量应用服务器注意：除系统内 ufw 外，还必须在腾讯云控制台本实例的『防火墙』标签放行 TCP 80（HTTPS 再放行 443），来源 `0.0.0.0/0`。两层是独立的，控制台未放行时浏览器依然连不上。`setup-server.sh` 已在结尾给出提示。

> 2 GB 内存提示：`setup-server.sh` 会在内存低于 4 GB 且无 swap 时自动建立 2 GB 交换空间，无需手动处理。

## 部署步骤

### 1. 拉取代码并初始化服务器

用一个普通用户（例如 `ubuntu`）把代码拉下来：

```bash
cd ~ && git clone https://github.com/grapefruit2002/NutritionSystem.git
cd ~/NutritionSystem
```

再用 root 权限跑初始化脚本：

```bash
sudo bash tencent/setup-server.sh
```

脚本会：安装 Docker 引擎与 compose 插件、配置 Docker Hub 腾讯云内网镜像加速、在内存不足时加 swap、放行系统防火墙 22/80/443。

> 镜像来源：.NET 基础镜像默认走微软官方中国区端点 `mcr.azure.cn`（已验证 `.NET 10` 的 sdk/aspnet tag 可用）；Docker Hub 的 node/nginx 镜像走腾讯云内网加速 `mirror.ccs.tencentyun.com`（仅内网生效）。若服务器上 `mcr.azure.cn` 拉取失败，在 `.env` 里把 `DOTNET_REGISTRY` 改成 `mcr.microsoft.com`（全球站，需代理）后重跑 `deploy.sh`。

### 2. 配置域名

```bash
cd ~/NutritionSystem/tencent
cp .env.example .env
nano .env
```

把 `SITE_ORIGIN` 改成你的真实域名（含 `https://`）；仅用 IP 访问时保持默认即可。`VUE_APP_API_BASE_URL` 保持留空，`HTTP_PORT` 保持 80，`DOTNET_REGISTRY` 保持 `mcr.azure.cn`。

### 3. 一键部署

```bash
bash deploy.sh
```

脚本会构建两个镜像、启动容器、轮询 `/health`，通过后打印容器状态。首次构建需要下载 .NET SDK、Node 基础镜像和 npm 依赖，视网络需要几分钟。

### 4. 验证

```bash
curl -i http://127.0.0.1/health
curl -i http://127.0.0.1/api/nutrients
```

然后从外网用浏览器打开 `http://你的域名`。若暂时没备案或没域名，可先用 `http://公网IP` 访问（IP 直连不受备案限制，但部分浏览器会提示不安全）。

## HTTPS（可选，但强烈建议）

备案通过后，用腾讯云免费 SSL 证书或 Let's Encrypt 开启 HTTPS。推荐在 nginx 容器前加一层，或直接改 `nginx.conf` 增加 443 server 块并把 80 重定向到 443。证书文件通过卷挂载进 web 容器。开启后把 `.env` 里的 `SITE_ORIGIN` 更新为 `https://` 域名并重新 `bash deploy.sh`。

## 日常运维

```bash
cd ~/NutritionSystem/tencent

docker compose ps                 # 查看状态
docker compose logs -f api        # 跟踪后端日志
docker compose logs -f web        # 跟踪前端/Nginx 日志
docker compose restart            # 重启
bash deploy.sh                    # 改代码后重新构建部署
docker compose down               # 停止（数据卷保留）
docker compose down -v            # 停止并删除数据卷（会清空饮食记录，慎用）
```

### 更新代码

```bash
cd ~/NutritionSystem && git pull
cd tencent && bash deploy.sh
```

`nutrition-data` 卷独立于镜像，重新部署不会丢失饮食记录。

### 备份数据库

```bash
docker run --rm -v nutrition-data:/data -v "$PWD":/backup alpine \
  cp /data/data.db /backup/data.db.$(date +%F)
```

把导出的 `data.db.*` 下载到本地留存。

## 关于两个域名的数据同步

两侧数据默认独立。若要把 Cloudflare D1 的饮食记录迁到腾讯云，思路是：

1. 用 `wrangler d1 export nutrition-system-db --remote --output=d1-export.sql` 导出 D1。
2. 从导出文件里提取 `MealLogs` 表的 INSERT 语句。
3. 通过 `docker compose exec -T api sh -c '...'` 把 SQL 灌进容器内的 `data.db`（SQLite CLI 需先装入 api 镜像，或把库文件拷出来在本地处理后再拷回）。

这一步按需进行，日常双入口运行无需同步。
