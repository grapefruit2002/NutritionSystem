#!/usr/bin/env node
// 部署 Pages 版本：装配 _worker.js 后推到 pages.dev。
// 与 Worker 版本共用同一份前端产物、同一份 API 代码、同一个 D1 库。
// 用法：node scripts/deploy-pages.mjs [--skip-frontend]

import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pagesDir = join(root, 'pages')
const wranglerBin = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js')

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

// 1) 装配 dist（含 _worker.js），可跳过重复的前端构建
const buildArgs = [join(root, 'scripts', 'build-pages.mjs')]
if (process.argv.includes('--skip-frontend')) buildArgs.push('--skip-frontend')
const build = spawnSync(process.execPath, buildArgs, { cwd: root, stdio: 'inherit' })
if (build.status !== 0) fail('装配 Pages 入口失败')

// 2) 在 pages 目录下部署，Pages 只读取该目录内的 wrangler.jsonc
console.log('\n› 部署到 Cloudflare Pages')
const deploy = spawnSync(process.execPath, [wranglerBin, 'pages', 'deploy'], {
  cwd: pagesDir,
  stdio: 'inherit',
})
if (deploy.status !== 0) fail('Pages 部署失败')

console.log('\n✓ Pages 地址：https://nutrition-system.pages.dev（国内网络可直连）')
