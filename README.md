# 营养地图

以营养素和食物为核心的饮食营养查询系统。提供营养素百科、食物营养成分、膳食参考摄入量、食物搭配与吸收、饮食计算器与用餐记录等功能。

## 功能特性

- **营养素百科**：16+ 种常见营养素的科普介绍、推荐摄入量、食物来源。
- **食物营养库**：按生、熟、加工状态区分的食物成分数据，每 100g 营养含量。
- **膳食参考摄入量**：按年龄组与性别拆分的 RNI / AI / UL / AMDR 参考值。
- **食物搭配与吸收**：营养素之间的协同 / 拮抗作用及适用条件。
- **饮食计算器**：根据目标摄入量计算所需食物份量。
- **用餐记录**：记录每日饮食并汇总营养摄入。
- **离线回退**：前端在 API 不可用时回退到内置数据，保证基本可用。

## 技术组成

- **前端**：Vue 2.7、Vue Router 3、Vue CLI 5、lucide-vue 图标。
- **后端**：ASP.NET Core Web API、.NET 10、EF Core（SQLite）。
- **数据库**：项目根目录的 `data.db`，后端启动时通过 EF Core 迁移自动建库与更新结构。
- **部署**：Cloudflare Workers + D1（`cloudflare/`），本地仍可用 .NET 后端，两条链路共用同一套前端。

## 项目结构

```
NutritionSystem/
├── backend/
│   ├── NutritionSystem.Api/              # Web API 入口（控制器、Program.cs）
│   ├── NutritionSystem.Application/      # 应用层：DTO 与服务接口
│   ├── NutritionSystem.Domain/           # 领域层：实体、枚举
│   ├── NutritionSystem.Infrastructure/   # 基础设施：EF Core、数据播种、服务实现
│   └── dotnet-tools.json                 # EF Core 工具清单
├── frontend/
│   ├── src/
│   │   ├── views/                        # 页面：首页、营养素详情、工具
│   │   ├── components/                   # 组件：食物库、计算器、用餐记录等
│   │   ├── services/nutritionApi.js      # API 调用封装
│   │   ├── data/nutritionData.js         # 离线内置数据
│   │   └── main.js                       # 应用入口与路由
│   └── vue.config.js                     # 开发代理配置
└── NutritionSystem.slnx                  # 解决方案
```

## 本地启动

需要 .NET 10 SDK、Node.js 16 和 npm 8。分别在两个终端运行：

**后端**（http://localhost:5106）：

```powershell
dotnet run --project backend/NutritionSystem.Api
```

**前端**（http://localhost:8080）：

```powershell
cd frontend
npm install
npm run serve
```

Vue CLI 将 `/api` 与 `/health` 请求代理到 `http://localhost:5106`。

- API 健康状态：`http://localhost:5106/health`
- 开发环境 OpenAPI 文档：`http://localhost:5106/openapi/v1.json`
- Swagger UI：`http://localhost:5106/swagger`

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/nutrients` | 营养素列表 |
| GET | `/api/nutrients/{slug}` | 营养素详情（含食物来源、参考摄入量、吸收资料） |
| GET | `/api/foods` | 食物列表 |
| GET | `/api/foods/overview` | 食物成分概览 |
| GET | `/api/foods/{slug}` | 食物详情 |
| GET | `/api/reference/populations` | 人群分组 |
| GET | `/api/reference/intakes` | 膳食参考摄入量 |
| GET | `/api/meal-logs` | 用餐记录列表 |
| POST | `/api/meal-logs` | 新增用餐记录 |
| DELETE | `/api/meal-logs/{id}` | 删除用餐记录 |

## 数据说明

后端启动时会通过 `NutritionDataSeeder` 幂等同步参考数据（按自然键更新，可重复执行）：

- 人群：4–6 岁至 80 岁及以上，按年龄组与性别拆分的 14 组。
- 营养素：16 种常见营养素，含科普正文与资料来源。
- 参考摄入量：蛋白质、钙、铁、锌、维生素 A/C/D 的 RNI，以及成年人群的 UL，共 146 条。
- 食物：14 条按生、熟、加工状态分开的记录，含 60 条每 100 克成分数据。
- 吸收资料：10 条带作用方向、适用条件与出处的证据。

资料来源：营养素正文参考百度百科对应条目与中国居民膳食指南（2022）公开建议；参考摄入量标注 DRIs 2023；食物成分标注中国食物成分表；吸收资料引用 NIH Office of Dietary Supplements。当前数值用于结构演示，**正式上线前需按官方标准逐条核对**，不能直接作为临床或个体化建议。

修改后端数据代码后需重启 API 才会重新同步；前端在 API 不可用时会回退到 `frontend/src/data/nutritionData.js` 的内置数据。

EF 工具清单位于 `backend/dotnet-tools.json`。需要手动新增迁移时：

```powershell
cd backend
dotnet tool restore
dotnet dotnet-ef migrations add MigrationName --project NutritionSystem.Infrastructure --startup-project NutritionSystem.Api --output-dir Persistence/Migrations
```

## 生产构建

```powershell
cd frontend
npm run build
```

构建结果输出到 `frontend/dist`。部署静态站点时需将详情路由回退到 `index.html`（前端用 hash 路由，实际不依赖该回退）。

## 部署到 Cloudflare

`cloudflare/` 目录是一套可直接发布的 Cloudflare 版本：前端与 API 跑在同一个 Worker 上，数据存在 D1。Cloudflare Workers 无法运行 ASP.NET Core 进程，因此 API 按原契约等价迁移为 JavaScript，接口路径、字段与排序均与 .NET 版一致（17 个 GET 端点已逐字段对照通过）。

```powershell
cd cloudflare
npm install
npx wrangler login
npm run deploy
```

命令会建库、建表、灌数据、构建前端并部署，详见 [cloudflare/README.md](cloudflare/README.md)。本地的 .NET 后端与 `data.db` 不受影响，两条链路可以共存。

线上地址：<https://nutrition-system.nutrimap.workers.dev>（主域名，国内需代理）与 <https://nutrition-system.pages.dev>（同一份代码的 Pages 版本，国内可直连，共用同一个 D1 库）。仓库已配置 GitHub Actions（`.github/workflows/deploy-cloudflare.yml`），配好 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID` 两个 secret 后，推送 `master` 即自动部署两处。

## 配置项

`appsettings.json` 中的主要配置：

- `Nutrition:DatabasePath`：SQLite 数据库路径（相对或绝对）。
- `Cors:AllowedOrigins`：允许跨域访问的来源列表。
