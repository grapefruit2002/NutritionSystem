#!/usr/bin/env node
// 把 Worker 源码装配进前端产物，形成 Pages 可部署目录（advanced mode 的 _worker.js）。
// 用法：node scripts/build-pages.mjs [--skip-frontend]
// 产出：frontend/dist/_worker.js（由 src/index.js 与 src/data.js 合并）、frontend/dist/data.js

import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, '..', 'frontend', 'dist')
const srcDir = join(root, 'src')

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

if (!process.argv.includes('--skip-frontend')) {
  console.log('› 构建前端')
  const build = spawnSync('npm', ['run', 'build'], {
    cwd: join(root, '..', 'frontend'),
    stdio: 'inherit',
    shell: true,
  })
  if (build.status !== 0) fail('前端构建失败')
}

if (!existsSync(join(distDir, 'index.html'))) fail(`找不到前端产物：${distDir}`)

// Pages 的 advanced mode 只认 _worker.js 这一个入口，因此把 data.js 合并进去，
// 避免依赖 bundler 对相对导入的处理。源码可能是 CRLF，先统一成 LF 再处理。
const dataSource = readFileSync(join(srcDir, 'data.js'), 'utf8').replace(/\r\n/g, '\n')
const indexSource = readFileSync(join(srcDir, 'index.js'), 'utf8').replace(/\r\n/g, '\n')

const merged = indexSource
  .replace(/^import \{[\s\S]*?\} from '\.\/data\.js'\n/m, '')
  .replace(/\/\/ Cloudflare Worker 入口/, '// Cloudflare Pages 入口（由 scripts/build-pages.mjs 从 src/index.js 生成）')

if (merged.includes("from './data.js'")) fail('未能移除对 data.js 的导入，请检查 src/index.js 的 import 结构')

const banner = `// 自动生成，请勿编辑；源码见 cloudflare/src/index.js 与 cloudflare/src/data.js\n`
const output = `${banner}${dataSource}\n\n${merged}`

writeFileSync(join(distDir, '_worker.js'), output, 'utf8')
copyFileSync(join(srcDir, 'data.js'), join(distDir, 'data.js'))

console.log(`已生成 ${join(distDir, '_worker.js')}（${(output.length / 1024).toFixed(1)} KB）`)
