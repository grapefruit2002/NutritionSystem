module.exports = {
  // 相对路径：构建产物可直接用 file:// 双击打开，也可部署到任意子目录。
  publicPath: './',
  outputDir: 'dist',
  devServer: {
    port: 8080,
    proxy: {
      '/api': { target: 'http://localhost:5106', changeOrigin: true },
      '/health': { target: 'http://localhost:5106', changeOrigin: true },
    },
  },
}
