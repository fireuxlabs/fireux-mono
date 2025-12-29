#!/usr/bin/env node
// FILE: scripts/generate-cta-parent-trees.mjs
//
// Generates: temp/temp-cta.md
// Repo-truth snapshot (runtime only): CTA parent trees (full recursion).

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.nuxt',
  '.output',
  '.git',
  '.turbo',
  '.next',
  '.pnpm',
])

function isDirectory(p) {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

function isFile(p) {
  try {
    return statSync(p).isFile()
  } catch {
    return false
  }
}

function walkFiles(rootDir, predicate) {
  const out = []
  const stack = [rootDir]

  while (stack.length) {
    const current = stack.pop()
    if (!current) continue

    let entries = []
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      if (entry.name === '.DS_Store') continue

      const fullPath = path.join(current, entry.name)

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) stack.push(fullPath)
        continue
      }

      if (!entry.isFile()) continue
      if (predicate(fullPath)) out.push(fullPath)
    }
  }

  return out
}

function toRepoRelative(absPath) {
  return path.relative(repoRoot, absPath).replaceAll(path.sep, '/')
}

function readText(absPath) {
  try {
    return readFileSync(absPath, 'utf8')
  } catch {
    return ''
  }
}

function treeLines(rootDir) {
  // Full recursion tree rooted at '.'
  const lines = ['.']

  function listDir(dir) {
    let entries = []
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return []
    }

    const filtered = entries
      .filter((e) => e.name !== '.DS_Store')
      .filter((e) => !SKIP_DIRS.has(e.name))

    // directories first, then files; alpha within each
    filtered.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1
      if (!a.isDirectory() && b.isDirectory()) return 1
      return a.name.localeCompare(b.name)
    })

    return filtered
  }

  function walk(dir, prefix) {
    const entries = listDir(dir)

    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1
      const branch = isLast ? '└── ' : '├── '
      const nextPrefix = prefix + (isLast ? '    ' : '│   ')

      if (entry.isDirectory()) {
        lines.push(prefix + branch + entry.name + '/')
        walk(path.join(dir, entry.name), nextPrefix)
        return
      }

      lines.push(prefix + branch + entry.name)
    })
  }

  walk(rootDir, '')
  return lines
}

function parseEntityLabel(ctaLikeFile, parentDir) {
  // Prefer a clean label like “Profile: Chef” or “Object: Blog” or “User/App”.
  const parts = parentDir.split('/').filter(Boolean)
  const idx = parts.lastIndexOf('organisms')
  if (idx === -1) return path.basename(parentDir)

  const after = parts.slice(idx + 1)
  // organisms/profiles/<Domain>
  if (after[0] === 'profiles' && after[1]) return `Profile: ${after[1]}`
  // organisms/objects/<Object>
  if (after[0] === 'objects' && after[1]) return `Object: ${after[1]}`

  // organisms/<Entity>
  if (after[0]) return after[0]

  return path.basename(ctaLikeFile)
}

function groupKeyFor(absFile) {
  const rel = toRepoRelative(absFile)
  const parts = rel.split('/')

  // packages/<group>/<package>/...
  if (parts[0] === 'packages' && parts.length >= 3) {
    const group = parts[1]
    const pkg = parts[2]

    if (group === 'core') return { section: 'Core', sub: pkg }
    if (group === 'ecosystem') return { section: 'Ecosystem', sub: pkg }
    if (group === 'extensions') return { section: 'Extensions', sub: pkg }

    return { section: 'Packages', sub: `${group}/${pkg}` }
  }

  return { section: 'Other', sub: parts[0] ?? 'unknown' }
}

function findCtaLikeFiles() {
  const packagesRoot = path.join(repoRoot, 'packages')
  const projectsRoot = path.join(repoRoot, 'projects')

  const roots = [packagesRoot, projectsRoot].filter(isDirectory)

  // 1) All CTA.vue
  const ctaVueFiles = roots.flatMap((r) =>
    walkFiles(r, (p) => p.endsWith(`${path.sep}CTA.vue`))
  )

  // 2) Any runtime component using UPageCTA
  const runtimeComponents = roots.flatMap((r) =>
    walkFiles(r, (p) => p.includes(`${path.sep}src${path.sep}runtime${path.sep}components${path.sep}`) && p.endsWith('.vue'))
  )

  const uPageCtaFiles = runtimeComponents.filter((p) => {
    const raw = readText(p)
    return raw.includes('UPageCTA')
  })

  const all = new Set([...ctaVueFiles, ...uPageCtaFiles])
  return Array.from(all).sort((a, b) => toRepoRelative(a).localeCompare(toRepoRelative(b)))
}

function buildMarkdown(ctaLikeFiles) {
  const header = [
    '# CTA Parent Trees (Full)',
    '',
    'Repo-truth snapshot (runtime only). Auto-generated.',
    '',
    `- Included CTA-like files: ${ctaLikeFiles.length}`,
    '- Each tree is the parent folder of a CTA-like file.',
    '- Trees are shown with `.` as the folder root (full parent path is listed above each tree).',
    '',
  ]

  const grouped = new Map()

  for (const absFile of ctaLikeFiles) {
    const relFile = toRepoRelative(absFile)
    const parentDirAbs = path.dirname(absFile)
    const parentDirRel = toRepoRelative(parentDirAbs)

    const { section, sub } = groupKeyFor(absFile)
    const groupId = `${section}::${sub}`

    if (!grouped.has(groupId)) grouped.set(groupId, { section, sub, items: [] })

    grouped.get(groupId).items.push({
      relFile,
      parentDirRel,
      label: parseEntityLabel(relFile, parentDirRel),
      tree: treeLines(parentDirAbs).join('\n'),
    })
  }

  const groupsSorted = Array.from(grouped.values()).sort((a, b) => {
    const s = a.section.localeCompare(b.section)
    if (s !== 0) return s
    return a.sub.localeCompare(b.sub)
  })

  const sections = []

  const sectionOrder = ['Core', 'Ecosystem', 'Extensions', 'Packages', 'Projects', 'Other']
  groupsSorted.sort((a, b) => {
    const ai = sectionOrder.indexOf(a.section)
    const bi = sectionOrder.indexOf(b.section)
    const aRank = ai === -1 ? 999 : ai
    const bRank = bi === -1 ? 999 : bi
    if (aRank !== bRank) return aRank - bRank
    return a.sub.localeCompare(b.sub)
  })

  let lastSection = null

  for (const group of groupsSorted) {
    if (group.section !== lastSection) {
      sections.push(`## ${group.section}`)
      sections.push('')
      lastSection = group.section
    }

    sections.push(`### ${group.sub}`)
    sections.push('')

    for (const item of group.items) {
      sections.push(`#### ${item.label}`)
      sections.push('')
      sections.push(`Parent: \`${item.parentDirRel}\``)
      sections.push(`CTA-like: \`${item.relFile}\``)
      sections.push('')
      sections.push('```text')
      sections.push(item.tree)
      sections.push('```')
      sections.push('')
    }
  }

  return [...header, ...sections].join('\n')
}

function main() {
  const outDir = path.join(repoRoot, 'temp')
  const outFile = path.join(outDir, 'temp-cta.md')

  const ctaLikeFiles = findCtaLikeFiles()
  const md = buildMarkdown(ctaLikeFiles)

  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, md, 'utf8')

  console.log(`[gen:cta-trees] Wrote ${toRepoRelative(outFile)} (${ctaLikeFiles.length} CTA-like files)`)
}

main()
