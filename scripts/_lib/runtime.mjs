// @fireux-script
// last_used: 2026-06-28
// usage_note: shared runtime contract check; update when run or imported for runtime enforcement.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const SKIP_DIRS = new Set([
  '.git',
  '.nuxt',
  '.output',
  '.pnpm-store',
  'dist',
  'node_modules',
])

function readText(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, 'utf8').trim() : ''
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function parseVersion(raw) {
  const match = String(raw || '').trim().match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/)
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2] || 0),
    patch: Number(match[3] || 0),
  }
}

function compareVersions(leftRaw, rightRaw) {
  const left = parseVersion(leftRaw)
  const right = parseVersion(rightRaw)
  if (!left || !right) return Number.NaN

  for (const key of ['major', 'minor', 'patch']) {
    if (left[key] > right[key]) return 1
    if (left[key] < right[key]) return -1
  }

  return 0
}

function satisfiesComparator(version, comparator) {
  const match = comparator.match(/^(>=|>|<=|<|=)?\s*(\d+(?:\.\d+)?(?:\.\d+)?)$/)
  if (!match) return false

  const operator = match[1] || '='
  const expected = match[2]
  const comparison = compareVersions(version, expected)

  if (Number.isNaN(comparison)) return false
  if (operator === '>=') return comparison >= 0
  if (operator === '>') return comparison > 0
  if (operator === '<=') return comparison <= 0
  if (operator === '<') return comparison < 0
  return comparison === 0
}

function satisfiesRange(version, range) {
  const parts = String(range || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return false
  return parts.every((part) => satisfiesComparator(version, part))
}

function packageJsonFiles(root) {
  const out = []

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'package.json' && entry.isFile()) {
        out.push(path.join(dir, entry.name))
        continue
      }

      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue
      walk(path.join(dir, entry.name))
    }
  }

  for (const rel of ['package.json', 'packages', 'projects', 'tools']) {
    const target = path.join(root, rel)
    if (!existsSync(target)) continue
    if (rel === 'package.json') out.push(target)
    else walk(target)
  }

  return [...new Set(out)].sort((a, b) => a.localeCompare(b))
}

function readWorkspaceSetting(raw, key) {
  const match = raw.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  return match?.[1]?.trim() || ''
}

function readNpmrcSetting(raw, key) {
  const match = raw.match(new RegExp(`^${key}=([^\\n]+)$`, 'm'))
  return match?.[1]?.trim() || ''
}

function addIssue(issues, message, file) {
  issues.push(file ? `${file}: ${message}` : message)
}

export function checkFireuxRuntime(options = {}) {
  const repoRoot = options.repoRoot || process.cwd()
  const metadataOnly = Boolean(options.metadataOnly)
  const issues = []

  const rootPackagePath = path.join(repoRoot, 'package.json')
  const rootPackage = readJson(rootPackagePath)
  const nodeVersion = readText(path.join(repoRoot, '.node-version'))
  const nvmVersion = readText(path.join(repoRoot, '.nvmrc'))
  const workspaceRaw = readText(path.join(repoRoot, 'pnpm-workspace.yaml'))
  const npmrcRaw = readText(path.join(repoRoot, '.npmrc'))
  const packageManager = String(rootPackage.packageManager || '')
  const expectedPnpm = packageManager.match(/^pnpm@(.+)$/)?.[1] || ''
  const expectedNodeRange = String(rootPackage.engines?.node || '')

  if (!nodeVersion) addIssue(issues, 'missing .node-version')
  if (nvmVersion !== nodeVersion) {
    addIssue(issues, `.nvmrc (${nvmVersion || 'missing'}) must match .node-version (${nodeVersion})`)
  }

  if (!satisfiesRange(nodeVersion, expectedNodeRange)) {
    addIssue(issues, `.node-version ${nodeVersion} must satisfy package.json engines.node ${expectedNodeRange}`)
  }

  if (rootPackage.engines?.pnpm !== expectedPnpm) {
    addIssue(issues, `package.json engines.pnpm must be ${expectedPnpm}`)
  }

  if (readWorkspaceSetting(workspaceRaw, 'nodeVersion') !== nodeVersion) {
    addIssue(issues, `pnpm-workspace.yaml nodeVersion must be ${nodeVersion}`)
  }

  for (const key of ['engineStrict', 'packageManagerStrict', 'packageManagerStrictVersion']) {
    if (readWorkspaceSetting(workspaceRaw, key) !== 'true') {
      addIssue(issues, `pnpm-workspace.yaml ${key} must be true`)
    }
  }

  if (readWorkspaceSetting(workspaceRaw, 'verifyDepsBeforeRun') !== 'false') {
    addIssue(issues, 'pnpm-workspace.yaml verifyDepsBeforeRun must be false')
  }

  for (const key of ['engine-strict', 'package-manager-strict', 'package-manager-strict-version']) {
    if (readNpmrcSetting(npmrcRaw, key) !== 'true') {
      addIssue(issues, `.npmrc ${key} must be true`)
    }
  }

  for (const filePath of packageJsonFiles(repoRoot)) {
    const pkg = readJson(filePath)
    const rel = path.relative(repoRoot, filePath)
    if (pkg.engines?.node && pkg.engines.node !== expectedNodeRange) {
      addIssue(issues, `engines.node must be ${expectedNodeRange}`, rel)
    }
    if (pkg.engines?.pnpm && pkg.engines.pnpm !== expectedPnpm) {
      addIssue(issues, `engines.pnpm must be ${expectedPnpm}`, rel)
    }
  }

  if (!metadataOnly) {
    const runningNode = process.version.replace(/^v/, '')
    if (runningNode !== nodeVersion) {
      addIssue(issues, `running Node is ${runningNode}, expected ${nodeVersion}`)
    }

    const userAgent = String(process.env.npm_config_user_agent || '')
    const pnpmMatch = userAgent.match(/\bpnpm\/([^\s]+)/)
    if (pnpmMatch && pnpmMatch[1] !== expectedPnpm) {
      addIssue(issues, `running pnpm is ${pnpmMatch[1]}, expected ${expectedPnpm}`)
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    expected: {
      nodeVersion,
      nodeRange: expectedNodeRange,
      pnpmVersion: expectedPnpm,
    },
    running: {
      nodeVersion: process.version.replace(/^v/, ''),
      npmUserAgent: String(process.env.npm_config_user_agent || ''),
    },
  }
}

export function assertFireuxRuntime(options = {}) {
  const result = checkFireuxRuntime(options)
  if (result.ok) return result

  const label = options.label || 'runtime'
  throw new Error(
    [
      `[${label}] FireUX runtime mismatch`,
      ...result.issues.map((issue) => `- ${issue}`),
      '',
      `Expected Node ${result.expected.nodeVersion} (${result.expected.nodeRange}) and pnpm ${result.expected.pnpmVersion}.`,
    ].join('\n')
  )
}
