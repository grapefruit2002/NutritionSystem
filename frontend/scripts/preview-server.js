// 零依赖本地预览服务：托管 dist，前端路由做 SPA 回退；
// /api 与 /health 代理到本机 wrangler dev（默认 8787），代理不可用时返回明确说明而非裸 404。
const http = require('http')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..', 'dist')
const port = Number(process.argv[2] || process.env.PORT || 4173)
const apiTargetPort = Number(process.env.API_PORT || 8787)

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('读取文件失败：' + error.message)
      return
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream' })
    res.end(data)
  })
}

function proxyApi(req, res) {
  const upstream = http.request({
    host: '127.0.0.1',
    port: apiTargetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: '127.0.0.1:' + apiTargetPort },
  }, (up) => {
    res.writeHead(up.statusCode || 502, up.headers)
    up.pipe(res)
  })
  upstream.on('error', () => {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: `本地预览的 API 代理不可用：请先在 cloudflare/ 目录启动 npx wrangler dev（端口 ${apiTargetPort}），再刷新页面。线上部署环境不受影响。` }))
  })
  req.pipe(upstream)
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  if (urlPath === '/api' || urlPath.startsWith('/api/') || urlPath === '/health') {
    proxyApi(req, res)
    return
  }
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  const filePath = path.join(root, safePath)

  if (filePath.startsWith(root) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath)
    return
  }

  // 前端路由回退到 index.html
  sendFile(res, path.join(root, 'index.html'))
})

server.listen(port, '127.0.0.1', () => {
  console.log('营养地图预览：http://localhost:' + port)
})
