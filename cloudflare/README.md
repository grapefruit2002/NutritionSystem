# Cloudflare 部署

前端与 API 都跑在同一个 Cloudflare Worker 上：Worker 提供 `/api/*`、`/health`，其余请求交给前端构建产物（`frontend/dist`）；数据存在 D1。

## 为什么不是把现有后端直接搬上去

Cloudflare Workers 运行时只执行 JavaScript / WebAssembly，无法启动 ASP.NET Core 进程。因此这里把 `NutritionSystem.Api` 的 11 个端点按原有契约（路径、字段、排序、错误结构）等价实现在 `src/index.js` 与 `src/data.js` 里，前端代码一行未改。

替代方案与取舍：

| 方案 | 是否保留 C# 代码 | 代价 |
| --- | --- | --- |
| Worker + D1（本目录） | 否 | API 需按契约重写一次（已完成） |
| Cloudflare Containers | 是 | 需要 Workers 付费计划、Docker 构建；容器文件系统临时，SQLite 要改存 R2/D1，数据仍在别处 |
| Cloudflare Tunnel | 是 | 只做内网穿透，本机必须常开，不是真正的托管 |

## 目录结构

```
cloudflare/
├── src/index.js          # Worker 入口：路由、CORS、错误结构、静态资源
├── src/data.js           # D1 查询与 DTO 映射（对应 EF Core 查询逻辑）
├── db/schema.sql         # 表结构，与 EF Core 迁移一致
├── db/seed.sql           # 参考数据种子，由 data.db 导出，可重复执行
├── scripts/export-seed.py  # data.db → db/seed.sql
├── scripts/parity-check.py # .NET 与 Worker 响应逐字段对照
├── scripts/deploy.mjs    # 一条命令：建库 → 建表 → 灌数据 → 构建 → 部署
└── wrangler.jsonc        # Worker / 静态资源 / D1 绑定
```

## 首次发布

```powershell
cd cloudflare
npm install
npx wrangler login      # 浏览器授权，只需一次
npm run deploy
```

`npm run deploy` 会依次：登录检查 → 查/建 D1 库 `nutrition-system-db` → 把 database_id 写回 `wrangler.jsonc` → 构建前端 → 远端建表（已存在则跳过，保留线上饮食记录）→ 灌参考数据 → 部署 Worker。结束时打印的 Worker 域名就是站点地址，形如 `https://nutrition-system.<子域>.workers.dev`。

之后改代码只需再跑 `npm run deploy`。

### 地址结构：哪些部分可以改

地址由三段拼成：`https://<Worker 名>.<账号子域>.workers.dev`。三段都能改，代价不同。

| 组成 | 当前值 | 改法 | 影响范围 |
| --- | --- | --- | --- |
| 账号子域 | `nutrimap` | 控制台 Workers & Pages → Your subdomain 旁的 Change；或先 `DELETE` 再 `PUT /accounts/{id}/workers/subdomain`（接口只支持创建，已存在时 PUT 会报错） | 全账号所有 Worker 的 workers.dev 地址一起变（当前账号只有本应用一个 Worker） |
| Worker 名 | `nutrition-system` | 改 `wrangler.jsonc` 的 `name` 后 `npm run deploy` | 只影响本应用；改名等于部署一个新 Worker，旧 Worker 及其地址会继续存在，需 `npx wrangler delete <旧名>` 清理 |
| 自定义域名 | 无 | 域名必须先作为 zone 接入同一账号，再在 Settings → Domains & Routes 绑定，或配置 `routes: [{ "pattern": "nutrition.example.com", "custom_domain": true }]` | 完全自定义，可同时 `"workers_dev": false` 关掉 workers.dev 地址 |

约束与事实：- 账号子域全局唯一（跨所有 Cloudflare 账号），被占用只能换一个；改名不会保留旧地址，新域名 DNS 生效约需 1–3 分钟，期间 workers.dev 短暂不可用。
- 旧子域一旦释放，理论上可能被其他账号注册，因此旧链接不要在对外材料里继续使用。
- Worker 名只能包含字母、数字和短横线，不能以短横线开头或结尾，最长 63 字符（它要当 DNS 标签）。
- 账号子域是在本机首次部署时由脚本注册的（取自邮箱前缀），不是随机分配；想换成更贴切的名字随时可以改。
- 前端调用的是同源 `/api`，代码与构建产物里没有任何写死的部署地址，因此换域名、换 Worker 名都不需要改前端代码。
- `workers.dev` 是 Cloudflare 的共享免费域名，官方定位是个人/非关键业务，并强制启用 Browser Integrity Check：部分默认 User-Agent（如 Python urllib 默认 UA）会被 1010 拦截，自动化调用需带自定义 UA 或改用自定义域名。
- 若之后接入自有域名，建议 `"workers_dev": false`，让 workers.dev 地址失效，只保留自定义域名，避免两个入口各自被搜索引擎收录。

改名有封装好的脚本，`--dry-run` 只打印将要发生的改动，不写文件也不部署：

```powershell
npm run rename -- nutrition-map                        # 只改 Worker 名
npm run rename -- --subdomain myname                   # 改账号子域（账号下全部 Worker 一起变）
npm run rename -- nutrition-map --subdomain myname     # 两者一起改
npm run rename -- nutrition-map --dry-run              # 演练
```

脚本会校验命名规则（小写字母/数字/短横线、≤63 字符、首尾非短横线）、改 `wrangler.jsonc`、执行部署并打印新地址；旧 Worker 不会自动删除，避免误删线上服务。

### 两个访问入口

同一份代码部署了两处，共用同一个 D1 库，数据完全一致：

| 入口 | 地址 | 国内网络 |
| --- | --- | --- |
| workers.dev（官方主域名） | https://nutrition-system.nutrimap.workers.dev | 不可直连，需要代理 |
| pages.dev（国内可用镜像） | https://nutrition-system.pages.dev | 可直连 |

原因是 `*.workers.dev` 的 DNS 在国内被污染：用 8.8.8.8 / 223.5.5.5 / 1.1.1.1 查询都会返回 Facebook 段地址（`31.13.x.x`、`face:b00c`），TCP 连不上，手机浏览器显示“网页无法连接”。而实测 `pages.dev` 未被污染：直连能拿到 Cloudflare 真实 IPv6（`2606:4700::...`），`/health`、`/api/nutrients`、首页以及饮食记录的增删都正常返回。

所以手机访问用 `https://nutrition-system.pages.dev` 即可，不需要 VPN。长期看仍建议接入自有域名作为唯一入口，再把 workers.dev 与 pages.dev 都关掉。

Pages 版本的实现方式：`scripts/build-pages.mjs` 把 `src/index.js` 与 `src/data.js` 合并成 `frontend/dist/_worker.js`（Pages 的 advanced mode 入口），`pages/wrangler.jsonc` 声明同一个 D1 绑定。Pages 只接受项目根目录下名为 `wrangler.jsonc` 的配置，因此它单独放在 `pages/` 子目录，不会与 Worker 的配置冲突。部署命令：

```
npm run deploy:pages    # 构建前端 + 装配 _worker.js + 推送
npm run build:pages     # 只装配，不部署
```

### 线上地址与访问说明

当前已发布：`https://nutrition-system.nutrimap.workers.dev`（D1 库 `nutrition-system-db`，账号 `86b6a024ae88dffb3c7315b3fcbef40e`）。

账号子域已从按邮箱前缀自动生成的 `shenjia260117` 改为中性名 `nutrimap`，旧地址 `nutrition-system.shenjia260117.workers.dev` 已失效。

**`*.workers.dev` 在部分网络下不可直接访问**：中国大陆多数线路对该域名返回污染结果（解析到 Facebook 段 IP），本机 `curl` 会直接连接失败，`wrangler dev --remote` 也依赖同一域名因此不可用。这是本地网络问题，不是部署失败——用 Cloudflare Browser Rendering 从其网络内实测，`/health` 返回 200 JSON、首页返回 200 HTML、`/api/nutrients?group=vitamin` 返回 11 条数据。

要稳定访问有两条路：

1. 把自有域名接入 Cloudflare，在 Worker → Settings → Domains & Routes 绑定自定义域名（该账号当前没有任何 zone，域名注册与付款只能由账号持有人完成）。
2. 保持 workers.dev 地址，通过代理访问。

## 自动部署（推送即上线）

仓库里已有 `.github/workflows/deploy-cloudflare.yml`：往 `master` 推送前端或 `cloudflare/` 的改动，GitHub Actions 会自动构建前端并部署 Worker。

首次启用只需在 GitHub 网页上配两个 secret（仓库 → Settings → Secrets and variables → Actions → New repository secret）：

| Secret | 值 | 创建位置 |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | 一串 API Token | Cloudflare 控制台 → My Profile → API Tokens → Create Token，用 `Edit Cloudflare Workers` 模板，Account Resources 选本账号 |
| `CLOUDFLARE_ACCOUNT_ID` | `86b6a024ae88dffb3c7315b3fcbef40e` | 控制台右下角 Account ID，或上面这条已写明的值 |

没配 secret 时流水线不会报错，只做构建校验并输出一条提示，所以推代码不会被卡住。

需要顺便把 `cloudflare/db/seed.sql` 同步到线上 D1 时，在 Actions 页面手动运行该工作流并勾选 `sync_data`（只覆盖参考数据，不动饮食记录）。

## 常见问题

**要一直开着什么服务吗？** 不需要。Worker 跑在 Cloudflare 的服务器上，没有常驻进程要你启动或保活；本机的 `wrangler dev` 只是开发调试用，关掉不影响线上。数据库是 D1，也不在你的机器上。

**改了代码要重新发布吗？** 要。Worker 是版本化部署：`git push`（走上面的流水线）或本地 `npm run deploy`，几十秒完成，切换是秒级生效，旧版本可用 `npx wrangler rollback` 回滚。

**改了数据要重新发布吗？** 不用。数据在 D1 里，不在构建产物里，直接写库即可：

```powershell
npx wrangler d1 execute nutrition-system-db --remote --command "UPDATE Foods SET Name='三文鱼' WHERE Slug='salmon-cooked'"
```

或改 `data.db` 后重新导出种子，再用 `--file=db/seed.sql` 同步（会覆盖参考数据，不碰饮食记录）。

**能不能全自动而不手动点？** 可以，push 就是触发条件，配置好上面两个 secret 之后不需要再碰命令行。

## 本地开发

```powershell
cd cloudflare
npm run db:local   # 本地建表 + 灌数据（写入 .wrangler/state，可反复执行）
npm run dev        # http://127.0.0.1:8787，API 与前端同时可用
```

前端热更新：

```powershell
cd frontend
$env:VUE_APP_API_BASE_URL="http://127.0.0.1:8787"; npm run serve
```

## 数据同步

线上 D1 的参考数据来自仓库根目录的 `data.db`。改了 `NutritionDataSeeder` 或数据库内容后重新导出：

```powershell
cd cloudflare
python scripts/export-seed.py      # 重新生成 db/seed.sql
npx wrangler d1 execute nutrition-system-db --remote --file=db/seed.sql --yes
```

`seed.sql` 只覆盖参考数据（人群 / 营养素 / 食物 / 参考摄入量 / 吸收证据），不会动 `MealLogs`。`schema.sql` 是重建表结构用，会清空饮食记录，只在首次部署或结构变更时执行。

## 一致性校验

改完 Worker 后，同时启动两个 API 逐字段比对：

```powershell
# 终端 1：.NET 版
dotnet run --project backend/NutritionSystem.Api --urls http://127.0.0.1:5199

# 终端 2：Worker 版
cd cloudflare; npm run dev

# 终端 3：比对 17 个端点
python cloudflare/scripts/parity-check.py
```

当前状态：17 个 GET 端点响应完全一致，POST `/api/meal-logs` 的返回结构也一致（`traceId` 为每请求生成，只校验格式）。

## 运行限制与后续项

- **单用户**：`X-Owner-Key` 请求头缺省为 `local`，与 .NET 版一致；公开部署后所有人共用一份饮食记录。要多用户需接 Cloudflare Access 或自建登录，并把 `OwnerKey` 换成用户标识。
- **写接口无鉴权**：`POST` / `DELETE /api/meal-logs` 目前对公网开放，与本地版一致，上线前建议加一层访问控制。
- **免费额度**：Workers 每日 10 万请求、D1 每日 500 万行读 / 10 万行写，本站数据量（31 营养素 / 80 食物 / 886 成分）远低于上限。
- **缓存**：只读接口带 `Cache-Control: public, max-age=60`，饮食记录带 `no-store`。
- **回滚**：`npx wrangler rollback` 可退回上一个版本。
- **自定义域名**：在 Cloudflare 控制台 Worker → Settings → Domains & Routes 绑定，或在 `wrangler.jsonc` 加 `routes`。
