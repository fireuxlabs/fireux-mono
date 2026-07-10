// @fireux-script
// last_used: 2026-07-10
// usage_note: guard worktree and staged files against credential material; Git history is out of scope.
// FILE: scripts/guards/secrets.mjs

import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const MAX_TEXT_FILE_BYTES = 2_000_000
const SAFE_SERVICE_ACCOUNT_EXAMPLE = /(^|\/)service-account\.example\.json$/i
const PRIVATE_KEY_MARKER = /-{5}BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-{5}/
const NON_EMPTY_JSON_PRIVATE_KEY = /"private_key"\s*:\s*"(?!")/
const NON_EMPTY_FIREBASE_SECRET_ENV =
  /^\s*(?:export\s+)?(?:[A-Z0-9_]+_)?(?:FIREBASE_PRIVATE_KEY|FIREBASE_SERVICE_ACCOUNT)\s*=\s*(?:"[^"]+"|'[^']+'|[^\s#][^\r\n]*)/m
const IGNORED_SCAN_DIRS = new Set([
  '.firebase',
  '.git',
  '.nuxt',
  '.output',
  '.pnpm-store',
  'coverage',
  'dist',
  'node_modules',
])

function commitVisibleFiles(repoRoot) {
  try {
    return execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    )
      .split('\0')
      .filter(Boolean)
  } catch {
    throw new Error('[guard] Unable to list commit-visible files for credential checks')
  }
}

function isForbiddenCredentialPath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/')
  if (SAFE_SERVICE_ACCOUNT_EXAMPLE.test(normalized)) return false

  const name = path.posix.basename(normalized).toLowerCase()
  return (
    name === 'service-account.json' ||
    name.endsWith('-service-account.json') ||
    /^service-account[._-].*\.json$/i.test(name)
  )
}

function repositoryFilesOnDisk(repoRoot) {
  const found = []
  const pending = [repoRoot]

  while (pending.length) {
    const current = pending.pop()
    let entries

    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        if (!IGNORED_SCAN_DIRS.has(entry.name)) {
          pending.push(path.join(current, entry.name))
        }
        continue
      }
      if (!entry.isFile()) continue

      found.push(path.relative(repoRoot, path.join(current, entry.name)))
    }
  }

  return found
}

function stagedChangedFiles(repoRoot) {
  try {
    return execFileSync(
      'git',
      ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    )
      .split('\0')
      .filter(Boolean)
  } catch {
    throw new Error('[guard] Unable to list staged files for credential checks')
  }
}

function inspectTextBuffer(buffer) {
  if (buffer.length > MAX_TEXT_FILE_BYTES || buffer.includes(0)) return []

  const source = buffer.toString('utf8')
  const findings = []
  if (PRIVATE_KEY_MARKER.test(source)) findings.push('private-key marker')
  if (NON_EMPTY_JSON_PRIVATE_KEY.test(source)) {
    findings.push('non-empty JSON private_key')
  }
  if (NON_EMPTY_FIREBASE_SECRET_ENV.test(source)) {
    findings.push('non-empty Firebase credential env value')
  }
  return findings
}

function inspectCommitVisibleTextFile(repoRoot, relativePath) {
  const absolutePath = path.join(repoRoot, relativePath)
  if (!existsSync(absolutePath)) return []

  let stat
  try {
    stat = lstatSync(absolutePath)
  } catch {
    return []
  }

  if (!stat.isFile() || stat.size > MAX_TEXT_FILE_BYTES) return []

  return inspectTextBuffer(readFileSync(absolutePath))
}

function inspectStagedTextFile(repoRoot, relativePath) {
  try {
    const buffer = execFileSync('git', ['show', `:${relativePath}`], {
      cwd: repoRoot,
      encoding: null,
      maxBuffer: MAX_TEXT_FILE_BYTES + 1,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return inspectTextBuffer(buffer)
  } catch (error) {
    if (error?.code === 'ENOBUFS') return []
    throw new Error(`[guard] Unable to inspect staged file: ${relativePath}`)
  }
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = new Set()

  for (const relativePath of repositoryFilesOnDisk(repoRoot)) {
    if (isForbiddenCredentialPath(relativePath)) {
      violations.add(`${relativePath} (credential file must live outside the repository)`)
      continue
    }

    for (const finding of inspectCommitVisibleTextFile(repoRoot, relativePath)) {
      violations.add(`${relativePath} (${finding})`)
    }
  }

  for (const relativePath of commitVisibleFiles(repoRoot)) {
    const absolutePath = path.join(repoRoot, relativePath)
    if (!existsSync(absolutePath)) continue

    if (isForbiddenCredentialPath(relativePath)) {
      violations.add(`${relativePath} (credential file path must not be committed)`)
      continue
    }

    for (const finding of inspectCommitVisibleTextFile(repoRoot, relativePath)) {
      violations.add(`${relativePath} (${finding})`)
    }
  }

  for (const relativePath of stagedChangedFiles(repoRoot)) {
    if (isForbiddenCredentialPath(relativePath)) {
      violations.add(`${relativePath} (staged credential file path is forbidden)`)
      continue
    }

    for (const finding of inspectStagedTextFile(repoRoot, relativePath)) {
      violations.add(`${relativePath} (staged ${finding})`)
    }
  }

  if (violations.size) {
    throw new Error(
      [
        '[guard] ❌ Repository credential material detected:',
        ...Array.from(violations)
          .sort((a, b) => a.localeCompare(b))
          .map((violation) => `  - ${violation}`),
        '',
        '[guard] Fix:',
        '- Revoke and rotate any exposed credential before removing it from Git history.',
        '- Track only service-account.example.json with an empty private_key.',
        '- Keep real credentials outside the repository and supply them through environment or application-default credentials.',
      ].join('\n')
    )
  }

  console.log(
    '[guard] ✅ worktree/index credential material absent (Git history not checked)'
  )
}
