// @fireux-script
// last_used: 2026-07-21
// usage_note: shared runtime contract check; update when run or imported for runtime enforcement.
// Concurrent edit — 2026-07-21 16:06 CEST — Misebox dev stability pass: reject stale and split workspace installations before startup.

import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
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

const IDENTITY_SENSITIVE_PACKAGES = [
  { dependency: 'firebase-admin', specifier: 'firebase-admin/firestore' },
  { dependency: 'h3', specifier: 'h3' },
]

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

function isPathInside(root, candidate) {
  const relative = path.relative(root, candidate)
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== '..' &&
      !path.isAbsolute(relative))
  )
}

function declaresDependency(pkg, dependency) {
  return [
    pkg.dependencies,
    pkg.devDependencies,
    pkg.peerDependencies,
    pkg.optionalDependencies,
  ].some(group => Object.hasOwn(group || {}, dependency))
}

function isOptionalDependency(pkg, dependency) {
  return (
    Object.hasOwn(pkg.optionalDependencies || {}, dependency) ||
    pkg.peerDependenciesMeta?.[dependency]?.optional === true
  )
}

function resolveInstalledSpecifier(manifestPath, specifier) {
  return realpathSync(createRequire(manifestPath).resolve(specifier))
}

export function checkInstalledPackageIdentity(options) {
  const repoRoot = realpathSync(options.repoRoot)
  const manifests = options.manifests || []
  const resolveSpecifier = options.resolveSpecifier || resolveInstalledSpecifier
  const issues = []

  for (const probe of IDENTITY_SENSITIVE_PACKAGES) {
    const resolutions = new Map()

    for (const manifest of manifests) {
      if (!declaresDependency(manifest.pkg, probe.dependency)) continue

      let resolved
      try {
        resolved = resolveSpecifier(manifest.filePath, probe.specifier)
      } catch (error) {
        if (isOptionalDependency(manifest.pkg, probe.dependency)) continue
        addIssue(
          issues,
          `cannot resolve identity-sensitive ${probe.specifier}; run pnpm install in this checkout`,
          manifest.rel
        )
        continue
      }

      if (!isPathInside(repoRoot, resolved)) {
        addIssue(
          issues,
          `identity-sensitive ${probe.specifier} resolves outside this checkout (${resolved}); run pnpm install in this checkout`,
          manifest.rel
        )
        continue
      }

      const owners = resolutions.get(resolved) || []
      owners.push(manifest.rel)
      resolutions.set(resolved, owners)
    }

    if (resolutions.size > 1) {
      const detail = [...resolutions.entries()]
        .map(([resolved, owners]) => `${resolved} <- ${owners.join(', ')}`)
        .join('; ')
      addIssue(
        issues,
        `identity-sensitive ${probe.specifier} has multiple physical installations: ${detail}; run pnpm install in this checkout`
      )
    }
  }

  return issues
}

function checkInstalledWorkspace(repoRoot, manifests, issues) {
  const canonicalRepoRoot = realpathSync(repoRoot)
  const nodeModulesPath = path.join(repoRoot, 'node_modules')
  const modulesStatePath = path.join(nodeModulesPath, '.modules.yaml')

  if (!existsSync(nodeModulesPath) || !existsSync(modulesStatePath)) {
    addIssue(
      issues,
      'node_modules installation metadata is missing; run pnpm install in this checkout'
    )
    return
  }

  let canonicalNodeModules
  try {
    canonicalNodeModules = realpathSync(nodeModulesPath)
  } catch {
    addIssue(
      issues,
      'node_modules cannot be resolved; run pnpm install in this checkout'
    )
    return
  }

  if (!isPathInside(canonicalRepoRoot, canonicalNodeModules)) {
    addIssue(
      issues,
      `node_modules resolves outside this checkout (${canonicalNodeModules}); run pnpm install in this checkout`
    )
    return
  }

  let modulesState
  try {
    modulesState = readJson(modulesStatePath)
  } catch {
    addIssue(
      issues,
      'node_modules/.modules.yaml is unreadable; run pnpm install in this checkout'
    )
    return
  }

  const rawVirtualStoreDir = String(modulesState.virtualStoreDir || '').trim()
  if (!rawVirtualStoreDir) {
    addIssue(
      issues,
      'node_modules/.modules.yaml is missing virtualStoreDir; run pnpm install in this checkout'
    )
    return
  }

  const virtualStorePath = path.isAbsolute(rawVirtualStoreDir)
    ? path.resolve(rawVirtualStoreDir)
    : path.resolve(nodeModulesPath, rawVirtualStoreDir)
  const canonicalVirtualStore = existsSync(virtualStorePath)
    ? realpathSync(virtualStorePath)
    : virtualStorePath

  if (!isPathInside(canonicalRepoRoot, canonicalVirtualStore)) {
    addIssue(
      issues,
      `node_modules virtual store resolves outside this checkout (${canonicalVirtualStore}); run pnpm install in this checkout`
    )
  }

  issues.push(
    ...checkInstalledPackageIdentity({
      repoRoot: canonicalRepoRoot,
      manifests,
    })
  )
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
  const manifests = packageJsonFiles(repoRoot).map(filePath => ({
    filePath,
    pkg: readJson(filePath),
    rel: path.relative(repoRoot, filePath),
  }))

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

  for (const { pkg, rel } of manifests) {
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

    checkInstalledWorkspace(repoRoot, manifests, issues)
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
