#!/usr/bin/env node
// 一条命令完成 Cloudflare 发布：建库 → 写结构 → 灌数据 → 构建前端 → 部署。
// 已登录过 wrangler 的机器只需 `npm run deploy`，重复执行不会清空饮食记录。

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dbName = 'nutrition-system-db'
const wranglerBin = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js')

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

function log(message) {
  console.log(`\n› ${message}`)
}

// 统一调用本地 wrangler，避免依赖全局安装与 npx 解析
function wrangler(args, options = {}) {
  const result = spawnSync(process.execPath, [wranglerBin, ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: options.inherit ? 'inherit' : 'pipe',
  })

  if (options.inherit) {
    if (result.status !== 0) fail(`wrangler ${args.join(' ')} 执行失败`)
    return { stdout: '', stderr: '' }
  }

  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}

// 从混合日志里捞出 JSON 段
function extractJson(text) {
  const trimmed = text.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      /* 继续尝试截取 */
    }
  }

  const start = trimmed.search(/[[{]/)
  if (start === -1) return null
  const slice = trimmed.slice(start)
  const end = Math.max(slice.lastIndexOf(']'), slice.lastIndexOf('}'))
  if (end === -1) return null
  try {
    return JSON.parse(slice.slice(0, end + 1))
  } catch {
    return null
  }
}

// SQL 文件执行；部分 wrangler 版本不支持 --yes，失败时退回无该参数重试
function applySql(file, scope) {
  const base = ['d1', 'execute', dbName, scope, `--file=${file}`]
  let result = wrangler([...base, '--yes'])
  if (result.status !== 0 && /unknown argument|unexpected argument/i.test(result.stderr)) {
    result = wrangler(base)
  }
  if (result.status !== 0) {
    fail(`写入 ${file} 失败：\n${result.stderr || result.stdout}`)
  }
}

function ensureDependencies() {
  if (!existsSync(wranglerBin)) {
    fail('缺少 wrangler，请先在 cloudflare 目录运行：npm install')
  }
}

function ensureLogin() {
  const result = wrangler(['whoami'])
  if (result.status !== 0 || /not authenticated|not logged in/i.test(result.stdout + result.stderr)) {
    fail(
      '尚未登录 Cloudflare。先运行 `npx wrangler login`，浏览器授权完成后重新执行 `npm run deploy`。',
    )
  }
  const account = result.stdout.match(/[0-9a-f]{32}/)
  console.log(`  已登录${account ? `，账号 ID：${account[0]}` : ''}`)
}

function ensureDatabase() {
  log('检查 D1 数据库')
  const list = wrangler(['d1', 'list', '--json'])
  const databases = list.status === 0 ? extractJson(list.stdout) : null
  const existing = Array.isArray(databases) ? databases.find((item) => item.name === dbName) : null

  let databaseId = existing?.uuid ?? existing?.database_id ?? null

  if (!databaseId) {
    console.log(`  未找到 ${dbName}，正在创建…`)
    const created = wrangler(['d1', 'create', dbName])
    const payload = extractJson(created.stdout)
    databaseId =
      payload?.d1_databases?.[0]?.database_id ??
      payload?.uuid ??
      created.stdout.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)?.[0]

    if (!databaseId) {
      fail(`创建数据库失败，wrangler 输出：\n${created.stdout}\n${created.stderr}`)
    }
  }

  console.log(`  数据库 ID：${databaseId}`)

  const configPath = join(root, 'wrangler.jsonc')
  const config = readFileSync(configPath, 'utf8')
  const next = config.replace(/("database_id"\s*:\s*")[^"]*(")/, `$1${databaseId}$2`)
  if (next !== config) {
    writeFileSync(configPath, next, 'utf8')
    console.log('  已把 database_id 写入 wrangler.jsonc')
  }
}

function ensureSchema() {
  log('检查远端表结构')
  const check = wrangler([
    'd1',
    'execute',
    dbName,
    '--remote',
    '--json',
    '--command',
    "SELECT count(*) AS c FROM sqlite_master WHERE type='table' AND name='Nutrients'",
  ])

  const payload = extractJson(check.stdout)
  const count = payload?.[0]?.results?.[0]?.c ?? payload?.results?.[0]?.c ?? null

  if (count === 0 || count === '0') {
    console.log('  表结构不存在，写入 db/schema.sql')
    applySql('db/schema.sql', '--remote')
  } else if (count === null) {
    // 无法读取时按“需要建表”处理，schema.sql 本身可重复执行
    console.log('  无法确认表结构，按首次部署处理')
    applySql('db/schema.sql', '--remote')
  } else {
    console.log('  表结构已存在，跳过建表（保留线上饮食记录）')
  }

  log('同步参考数据')
  applySql('db/seed.sql', '--remote')
}

function buildFrontend() {
  log('构建前端')
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: join(root, '..', 'frontend'),
    stdio: 'inherit',
    shell: true,
  })
  if (result.status !== 0) fail('前端构建失败')
}

function deploy() {
  log('部署 Worker 与静态资源')
  const result = wrangler(['deploy'], { inherit: true })
  return result
}

ensureDependencies()
ensureLogin()
ensureDatabase()
buildFrontend()
ensureSchema()
deploy()

console.log('\n✓ 发布完成。上面的 Worker 域名即为站点地址，/api 与 /health 已由同一个 Worker 提供。\n')
