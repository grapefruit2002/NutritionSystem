# 营养地图前端

本项目使用 Vue 2.7、Vue Router 3 和 Vue CLI 5，兼容 Node.js 16。

## 开发

    npm install
    npm run serve

默认地址为 http://localhost:8080。开发服务器将 /api 和 /health 代理到 http://localhost:5106。

## 生产构建

    npm run build

构建结果输出到 dist。部署在 IIS、Nginx 等静态服务器时，需要将未匹配的路径回退到 index.html，以支持营养素详情页的 history 路由。