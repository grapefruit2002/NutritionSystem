#!/usr/bin/env node
// 修改线上地址：改 Worker 名（只影响本站）或账号子域（影响账号下所有 Worker）。
// 用法：
//   node scripts/rename.mjs nutrition-map --dry-run      只打印将要发生的改动
//   node scripts/rename.mjs nutrition-map                改 Worker 名并部署
//   node scripts/rename.mjs --subdomain shenjia          改账号子域并部署
//   node scripts/rename.mjs --subdomain shenjia --worker nutrition-map

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = join(root, 'wrangler.jsonc')
const wranglerBin = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const tokenPath = join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml')

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

// Cloudflare 要求 Worker 名能当 DNS 标签：字母数字与短横线，最长 63，首尾不能是短横线
function assertWorkerName(name) {
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])$/.test(name)) {
    fail(`Worker 名不合法：${name}。只能用小写字母、数字、短横线，最长 63 字符，首尾不能是短横线。`)
  }
}

function readCurrentConfig() {
  const text = readFileSync(configPath, 'utf8')
  const name = text.match(/"name"\s*:\s*"([^"]+)"/)?.[1]
  const databaseId = text.match(/"database_id"\s*:\s*"([^"]+)"/)?.[1]
  return { text, name, databaseId }
}

function readToken() {
  if (!existsSync(tokenPath)) return null
  return readFileSync(tokenPath, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)?.[1] ?? null
}

function api(token, method, path, body) {
  const url = 'https://api.cloudflare.com/client/v4' + path
  const args = ['-s', '-X', method, url, '-H', `Authorization: Bearer ${token}`]
  if (body) args.push('-H', 'Content-Type: application/json', '-d', JSON.stringify(body))
  const result = spawnSync('curl', args, { encoding: 'utf8' })
  if (result.status !== 0) fail(`调用 Cloudflare API 失败：${result.stderr || 'curl 无输出'}`)
  try {
    return JSON.parse(result.stdout)
  } catch {
    fail(`Cloudflare API 返回非 JSON：${result.stdout.slice(0, 200)}`)
  }
}

function accountId(token) {
  const who = api(token, 'GET', '/accounts?per_page=1')
  const id = who?.result?.[0]?.id
  if (!id) fail('无法读取账号 ID，先执行 npx wrangler login')
  return id
}

const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const flag = (name) => {
  const index = argv.indexOf(name)
  return index === -1 ? null : argv[index + 1] ?? null
}
const positional = argv.filter((item, index) => !item.startsWith('--') && !['--subdomain', '--worker'].includes(argv[index - 1]))

const nextWorker = flag('--worker') ?? positional[0] ?? null
const nextSubdomain = flag('--subdomain')

if (!nextWorker && !nextSubdomain) {
  fail('用法：node scripts/rename.mjs <新 Worker 名> [--subdomain 新子域] [--dry-run]')
}

const current = readCurrentConfig()
const token = readToken()

// 输出当前完整地址：子域需走接口读取，未登录时退化成占位符
let resolvedSubdomain = null
if (token) {
  try {
    const acct = accountId(token)
    resolvedSubdomain = api(token, 'GET', `/accounts/${acct}/workers/subdomain`)?.result?.subdomain ?? null
  } catch {
    resolvedSubdomain = null
  }
}
console.log(`当前地址：https://${current.name}.${resolvedSubdomain ?? '<账号子域>'}.workers.dev`)
console.log(`当前 Worker 名：${current.name}；D1 数据库 ID：${current.databaseId ?? '(未写入)'}`)

if (nextSubdomain) {
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])$/.test(nextSubdomain)) {
    fail(`账号子域不合法：${nextSubdomain}。规则与 Worker 名相同，且必须全局唯一。`)
  }
  if (!token) fail('修改账号子域需要登录凭据，先执行 npx wrangler login')

  const acct = accountId(token)
  const before = api(token, 'GET', `/accounts/${acct}/workers/subdomain`)
  const currentSubdomain = before?.result?.subdomain ?? null
  console.log(`账号子域：${currentSubdomain ?? '(无)'} → ${nextSubdomain}（该账号下所有 Worker 的地址一起变）`)

  if (currentSubdomain === nextSubdomain) {
    console.log('子域已经是目标值，跳过')
  } else if (dryRun) {
    console.log('（PUT 只能创建、不能改名，实际执行时会先 DELETE 再 PUT，期间 workers.dev 会有短暂不可用）')
  } else {
    // Cloudflare 的子域接口只支持创建：已存在时 PUT 会报 Account already has an associated subdomain，
    // 因此改名必须先删除再创建；失败时回滚到原名，避免账号没有 workers.dev 子域。
    if (currentSubdomain) {
      const removed = api(token, 'DELETE', `/accounts/${acct}/workers/subdomain`)
      if (removed?.success === false) {
        fail(`删除原账号子域失败：${(removed.errors ?? []).map((item) => item.message).join('；')}`)
      }
    }

    const resp = api(token, 'PUT', `/accounts/${acct}/workers/subdomain`, { subdomain: nextSubdomain })
    if (!resp?.success) {
      const reason = (resp?.errors ?? []).map((item) => item.message).join('；')
      if (currentSubdomain) {
        const rollback = api(token, 'PUT', `/accounts/${acct}/workers/subdomain`, { subdomain: currentSubdomain })
        if (rollback?.success) {
          fail(`子域改为 ${nextSubdomain} 失败（${reason}），已回滚为 ${currentSubdomain}`)
        }
        fail(`子域改为 ${nextSubdomain} 失败（${reason}），回滚也失败，需要手工在控制台重建子域`)
      }
      fail(`子域创建失败：${reason}`)
    }

    console.log(`账号子域已改为：${resp.result?.subdomain ?? nextSubdomain}（新 DNS 生效通常需要 1–3 分钟）`)
  }
}

let configDirty = false
if (nextWorker && nextWorker !== current.name) {
  assertWorkerName(nextWorker)
  const updated = current.text.replace(/("name"\s*:\s*")[^"]*(")/, `$1${nextWorker}$2`)
  if (dryRun) {
    console.log(`Worker 名：${current.name} → ${nextWorker}（只影响本站，会部署成一个新 Worker）`)
  } else {
    writeFileSync(configPath, updated, 'utf8')
    configDirty = true
    console.log(`已把 wrangler.jsonc 的 name 改为：${nextWorker}`)
  }
}

if (dryRun) {
  console.log('\n（dry-run，未写入文件、未调用部署）')
  process.exit(0)
}

const deploy = spawnSync(process.execPath, [wranglerBin, 'deploy'], { cwd: root, stdio: 'inherit' })
if (deploy.status !== 0) fail('部署失败，配置已修改但未生效')

console.log('\n新地址已生效。旧 Worker 若存在，其地址仍会响应旧代码，用以下命令清理：')
if (configDirty) console.log(`  npx wrangler delete ${current.name}`)
console.log(`  npx wrangler deployments list`)
