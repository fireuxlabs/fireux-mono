// @fireux-script
// last_used: 2026-08-04
// usage_note: guards living-context metadata, explicit local references, and the concept-map graph.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const CONTEXT_DIRECTORY = 'docs/ai'
const CONCEPT_DIRECTORY = 'docs/concepts'
const CONCEPT_ROOTS = new Set([
  'docs/concepts/documentation.md',
  'docs/concepts/fireux-mono.md',
  'docs/concepts/spine.md',
])
const REPOSITORY_PREFIXES = [
  '.github/',
  '.vscode/',
  'docs/',
  'packages/',
  'projects/',
  'scripts/',
  'templates/',
  'tools/',
  'types/',
]
const REPOSITORY_FILES = new Set([
  'AGENTS.md',
  'README.md',
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  'tsconfig.json',
])

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(directory, entry.name))
    .sort()
}

function recursiveMarkdownFiles(directory, result = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) recursiveMarkdownFiles(target, result)
    if (entry.isFile() && entry.name.endsWith('.md')) result.push(target)
  }
  return result
}

function repoRelative(repoRoot, target) {
  return path.relative(repoRoot, target).split(path.sep).join('/')
}

function metadataValues(source, label) {
  return source
    .split(/\r?\n/)
    .map((line, index) => ({ line, number: index + 1 }))
    .slice(0, 12)
    .filter(({ line }) => line.startsWith(`${label}:`))
}

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  )
}

function gitRefStatus(repoRoot, ref) {
  const exists = spawnSync('git', ['cat-file', '-e', `${ref}^{commit}`], {
    cwd: repoRoot,
    stdio: 'ignore',
  })
  if (exists.status !== 0) return 'does not resolve to a commit'

  const ancestor = spawnSync(
    'git',
    ['merge-base', '--is-ancestor', ref, 'HEAD'],
    {
      cwd: repoRoot,
      stdio: 'ignore',
    }
  )
  if (ancestor.status !== 0) return 'is not an ancestor of the current checkout'
  return null
}

function inspectMetadata(
  repoRoot,
  relativePath,
  expectedRole,
  requireScope,
  refStatusCache
) {
  const source = readFileSync(path.join(repoRoot, relativePath), 'utf8')
  const violations = []
  const lines = source.split(/\r?\n/)

  if (!/^#\s+\S/.test(lines[0] || '')) {
    violations.push(`${relativePath}:1 must contain one document title.`)
  }

  for (const label of ['Updated', 'Ref', 'Role']) {
    const values = metadataValues(source, label)
    if (values.length !== 1) {
      violations.push(
        `${relativePath} must declare exactly one ${label} field.`
      )
      continue
    }
  }

  const updated = metadataValues(source, 'Updated')[0]
    ?.line.slice('Updated:'.length)
    .trim()
  if (updated && !validIsoDate(updated)) {
    violations.push(`${relativePath} has invalid Updated date "${updated}".`)
  }

  const ref = metadataValues(source, 'Ref')[0]?.line.slice('Ref:'.length).trim()
  if (ref) {
    if (!/^[0-9a-f]{7,12}$/.test(ref)) {
      violations.push(
        `${relativePath} Ref must be a short hexadecimal Git commit.`
      )
    } else {
      if (!refStatusCache.has(ref)) {
        refStatusCache.set(ref, gitRefStatus(repoRoot, ref))
      }
      const status = refStatusCache.get(ref)
      if (status) violations.push(`${relativePath} Ref ${ref} ${status}.`)
    }
  }

  const role = metadataValues(source, 'Role')[0]
    ?.line.slice('Role:'.length)
    .trim()
  if (role && role !== expectedRole) {
    violations.push(`${relativePath} Role must be "${expectedRole}".`)
  }

  if (requireScope) {
    const scopes = metadataValues(source, 'Scope')
    if (scopes.length !== 1 || !scopes[0].line.slice('Scope:'.length).trim()) {
      violations.push(
        `${relativePath} must declare exactly one non-empty Scope field.`
      )
    }
  }

  return violations
}

function cleanReferenceToken(raw) {
  let token = raw.trim().replace(/^<|>$/g, '')
  token = token.replace(/^['"]|['"]$/g, '')
  token = token.replace(/[),;:]$/g, '')
  return token.split('#')[0]
}

function qualifiesAsLocalReference(token) {
  if (!token || token.startsWith('#') || token.startsWith('/')) return false
  if (/^(?:https?:|mailto:|tel:|data:)/.test(token)) return false
  if (token.includes('*') || /[<>{}]/.test(token)) return false
  if (token.startsWith('./') || token.startsWith('../')) return true
  if (REPOSITORY_FILES.has(token)) return true
  if (REPOSITORY_PREFIXES.some((prefix) => token.startsWith(prefix)))
    return true
  return /^[A-Za-z0-9_.-]+\.md$/.test(token)
}

function referenceTarget(repoRoot, sourcePath, token) {
  if (
    REPOSITORY_FILES.has(token) ||
    REPOSITORY_PREFIXES.some((prefix) => token.startsWith(prefix))
  ) {
    return path.resolve(repoRoot, token)
  }
  return path.resolve(path.dirname(path.join(repoRoot, sourcePath)), token)
}

function explicitReferences(repoRoot, sourcePath, source) {
  const references = []
  const add = (raw, line) => {
    const token = cleanReferenceToken(raw)
    if (!qualifiesAsLocalReference(token)) return
    references.push({
      line,
      token,
      target: referenceTarget(repoRoot, sourcePath, token),
    })
  }

  for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    add(
      match[1].split(/\s+["']/)[0],
      source.slice(0, match.index).split('\n').length
    )
  }

  for (const match of source.matchAll(/`([^`\n]+)`/g)) {
    const line = source.slice(0, match.index).split('\n').length
    for (const token of match[1].split(/\s+/)) add(token, line)
  }

  source.split(/\r?\n/).forEach((line, index) => {
    const match = line.match(
      /^\s*-\s+(?:(?:Parent|Child|Family registry):\s+)?`?([^`\s]+\.md)`?\s*$/
    )
    if (match) add(match[1], index + 1)
  })

  return references
}

function inspectReferences(repoRoot, governedPaths) {
  const violations = []
  const incoming = new Map(
    governedPaths
      .filter((relativePath) =>
        relativePath.startsWith(`${CONCEPT_DIRECTORY}/`)
      )
      .map((relativePath) => [relativePath, new Set()])
  )
  const graphSources = ['AGENTS.md', ...governedPaths]

  for (const sourcePath of graphSources) {
    const source = readFileSync(path.join(repoRoot, sourcePath), 'utf8')
    for (const reference of explicitReferences(repoRoot, sourcePath, source)) {
      if (!existsSync(reference.target)) {
        violations.push(
          `${sourcePath}:${reference.line} references missing local path ${reference.token}.`
        )
        continue
      }

      const target = repoRelative(repoRoot, reference.target)
      if (incoming.has(target) && target !== sourcePath) {
        incoming.get(target).add(sourcePath)
      }
    }
  }

  for (const [conceptPath, sources] of incoming) {
    if (CONCEPT_ROOTS.has(conceptPath) || sources.size > 0) continue
    violations.push(
      `${conceptPath} is orphaned; link it from a current context or concept-map registry.`
    )
  }

  return violations
}

function inspectTimestampComments(repoRoot) {
  const violations = []
  for (const absolutePath of recursiveMarkdownFiles(
    path.join(repoRoot, 'docs')
  )) {
    const source = readFileSync(absolutePath, 'utf8')
    source.split(/\r?\n/).forEach((line, index) => {
      if (/<!--[^>]*Concurrent edit/i.test(line)) {
        violations.push(
          `${repoRelative(repoRoot, absolutePath)}:${index + 1} contains a retired Concurrent edit timestamp comment.`
        )
      }
    })
  }
  return violations
}

function inspectDocsViewerSource(repoRoot) {
  const relativePath = 'projects/fireux/fireux-app/content.config.ts'
  const absolutePath = path.join(repoRoot, relativePath)
  if (!existsSync(absolutePath)) {
    return [`${relativePath} is missing.`]
  }

  const source = readFileSync(absolutePath, 'utf8')
  if (
    !/cwd:\s*repoRoot,[\s\S]{0,320}include:\s*['"]AGENTS\.md\*['"]/.test(
      source
    )
  ) {
    return [
      `${relativePath} must watch AGENTS.md through the file-bounded AGENTS.md* source; a literal include with repoRoot makes Nuxt Content watch the entire checkout.`,
    ]
  }

  return []
}

export async function run({ repoRoot = process.cwd() } = {}) {
  const refStatusCache = new Map()
  const contextPaths = markdownFiles(
    path.join(repoRoot, CONTEXT_DIRECTORY)
  ).map((target) => repoRelative(repoRoot, target))
  const conceptPaths = markdownFiles(
    path.join(repoRoot, CONCEPT_DIRECTORY)
  ).map((target) => repoRelative(repoRoot, target))
  const violations = [
    ...contextPaths.flatMap((relativePath) =>
      inspectMetadata(
        repoRoot,
        relativePath,
        'living context',
        true,
        refStatusCache
      )
    ),
    ...conceptPaths.flatMap((relativePath) =>
      inspectMetadata(
        repoRoot,
        relativePath,
        'map, not canon',
        false,
        refStatusCache
      )
    ),
    ...inspectReferences(repoRoot, [...contextPaths, ...conceptPaths]),
    ...inspectTimestampComments(repoRoot),
    ...inspectDocsViewerSource(repoRoot),
  ]

  if (violations.length) {
    throw new Error(
      [
        'Documentation authority has drifted:',
        ...violations.map((violation) => `  - ${violation}`),
      ].join('\n')
    )
  }

  console.log(
    '[guard] ✅ Documentation metadata, references, and concept graph valid'
  )
}
