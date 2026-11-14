// 零依赖本地预览服务：托管 dist，并对前端路由做 SPA 回退。
// 用法：node scripts/preview-server.js [port]
const http = require('http')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..', 'dist')
const port = Number(process.argv[2] || process.env.PORT || 4173)

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

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  const filePath = path.join(root, safePath)

  if (filePath.startsWith(root) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath)
    return
  }

  // 纯静态预览不提供后端接口，明确返回 404，前端会回退到内置数据集。
  if (urlPath.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: 'preview server has no backend API' }))
    return
  }

  // 前端路由回退到 index.html
  sendFile(res, path.join(root, 'index.html'))
})

server.listen(port, '127.0.0.1', () => {
  console.log('营养地图预览：http://localhost:' + port)
})
