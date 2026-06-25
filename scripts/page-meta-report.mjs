#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const outputPath = path.join(repoRoot, 'page-meta-report.md')

const SKIP_DIRS = new Set([
  '.git',
  '.github',
  '.nuxt',
  '.output',
  '.vscode',
  'node_modules',
  'dist',
  'coverage',
  'tmp',
  'docs',
  'demo',
  'mirror',
  'temp',
])

const NUXT_CONFIG_NAMES = [
  'nuxt.config.ts',
  'nuxt.config.mjs',
  'nuxt.config.js',
  'nuxt.config.cjs',
]

function toPosix(p) {
  return p.split(path.sep).join('/')
}

function walkForPageVueFiles(rootDir) {
  const out = []
  const stack = [rootDir]

  while (stack.length) {
    const current = stack.pop()
    let entries = []

    try {
      entries = fs.readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }

    entries.sort((a, b) => a.name.localeCompare(b.name))

    for (const entry of entries) {
      const abs = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue
        stack.push(abs)
        continue
      }

      if (!entry.isFile()) continue
      if (!entry.name.endsWith('.vue')) continue

      const rel = toPosix(path.relative(repoRoot, abs))
      if (!rel.includes('/pages/')) continue
      out.push(abs)
    }
  }

  return out
}

function scopeLabelFromPath(relPath) {
  const parts = relPath.split('/')
  if (parts[0] === 'projects' && parts.length >= 3) {
    return parts.slice(0, 3).join('/')
  }
  if (parts[0] === 'packages' && parts.length >= 3) {
    return parts.slice(0, 3).join('/')
  }
  if (parts[0] === 'apps' && parts.length >= 2) {
    return parts.slice(0, 2).join('/')
  }
  const pagesIndex = parts.indexOf('pages')
  if (pagesIndex > 0) return parts.slice(0, pagesIndex).join('/')
  return parts[0] || '.'
}

function normalizeRouteSegment(segment) {
  if (!segment || segment === 'index') return ''
  if (/^\(.+\)$/.test(segment)) return ''

  let out = segment
  out = out.replace(/\[\[\.\.\.([^[\]]+)\]\]/g, ':$1(.*)?')
  out = out.replace(/\[\.\.\.([^[\]]+)\]/g, ':$1(.*)*')
  out = out.replace(/\[\[([^[\]]+)\]\]/g, ':$1?')
  out = out.replace(/\[([^[\]]+)\]/g, ':$1')

  return out
}

function inferRouteFromFile(relPath) {
  const parts = relPath.split('/')
  const pagesIndex = parts.indexOf('pages')
  if (pagesIndex < 0) return '/'

  const routeParts = parts.slice(pagesIndex + 1)
  if (!routeParts.length) return '/'

  routeParts[routeParts.length - 1] = routeParts[routeParts.length - 1].replace(
    /\.vue$/,
    ''
  )

  const normalized = routeParts
    .map((segment) => normalizeRouteSegment(segment))
    .filter(Boolean)

  const route = `/${normalized.join('/')}`.replace(/\/+/g, '/')
  return route === '/' ? route : route.replace(/\/$/, '')
}

function readFileSafe(absPath) {
  try {
    return { text: fs.readFileSync(absPath, 'utf8'), error: '' }
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

const nearestNuxtConfigCache = new Map()

function findNearestNuxtConfig(relPath) {
  const absPath = path.join(repoRoot, relPath)
  let cursor = path.dirname(absPath)

  if (nearestNuxtConfigCache.has(cursor)) {
    return nearestNuxtConfigCache.get(cursor)
  }

  const trail = []
  while (true) {
    trail.push(cursor)
    for (const name of NUXT_CONFIG_NAMES) {
      const candidate = path.join(cursor, name)
      if (!fs.existsSync(candidate)) continue

      const relConfig = toPosix(path.relative(repoRoot, candidate))
      const read = readFileSafe(candidate)
      const result = {
        path: relConfig,
        hasRouteRules: /\brouteRules\b/.test(read.text),
        readError: read.error,
      }
      for (const dir of trail) nearestNuxtConfigCache.set(dir, result)
      return result
    }

    const parent = path.dirname(cursor)
    if (parent === cursor || !toPosix(parent).startsWith(toPosix(repoRoot))) {
      for (const dir of trail) nearestNuxtConfigCache.set(dir, null)
      return null
    }
    cursor = parent
  }
}

function yesNo(value) {
  return value ? 'yes' : 'no'
}

function seoMetaType(hasUseSeoMeta, hasUseHead, hasDefinePageMeta, hasLegacyHead) {
  if (hasUseSeoMeta) return 'useSeoMeta'
  if (hasUseHead || hasLegacyHead) return 'useHead'
  if (hasDefinePageMeta) return 'definePageMeta'
  return 'none'
}

function detectTitle(text) {
  return /\btitleTemplate\s*:|\btitle\s*:/.test(text)
}

function detectDescription(text) {
  return /\bdescription\s*:|\bogDescription\s*:|\bmetaDescription\s*:/.test(text)
}

function detectCanonical(text) {
  return /\brel\s*:\s*['"]canonical['"]|\bcanonical(?:Url)?\s*:/.test(text)
}

function detectRobots(text) {
  return /\brobots\s*:|name\s*:\s*['"]robots['"]|x-robots-tag/i.test(text)
}

function detectPlaceholder(text) {
  return (
    />\s*(loading(?:\.\.\.)?|please wait|loading data|coming soon)\s*</i.test(text) ||
    /['"`]\s*(loading(?:\.\.\.)?|please wait|loading data|coming soon)\s*['"`]/i.test(
      text
    )
  )
}

function detectAuthOrClientGate(text) {
  return (
    /<ClientOnly\b/.test(text) ||
    /\b(useCurrentUser|useAuth|useRequireUser|onAuthStateChanged)\b/.test(text) ||
    /\bv-if\s*=\s*["'][^"']*(user|auth|currentUser|isAuthenticated|loggedIn|signedIn)[^"']*["']/i.test(
      text
    )
  )
}

function placeholderRisk(hasPlaceholderText, hasAuthOrClientGate) {
  if (hasPlaceholderText && hasAuthOrClientGate) return 'high'
  if (hasPlaceholderText || hasAuthOrClientGate) return 'med'
  return 'low'
}

function escapeCell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .trim()
}

function analyzePage(relPath) {
  const absPath = path.join(repoRoot, relPath)
  const read = readFileSafe(absPath)
  const text = read.text

  const hasUseSeoMeta = /\buseSeoMeta\s*\(/.test(text)
  const hasUseHead = /\buseHead\s*\(/.test(text)
  const hasDefinePageMeta = /\bdefinePageMeta\s*\(/.test(text)
  const hasLegacyHead =
    /\bhead\s*\(\s*\)\s*\{/.test(text) || /\bhead\s*:\s*(?:\(|\{)/.test(text)

  const titlePresent = detectTitle(text)
  const descriptionPresent = detectDescription(text)
  const canonicalPresent = detectCanonical(text)
  const robotsPresent = detectRobots(text)

  const hasPlaceholderText = detectPlaceholder(text)
  const hasAuthOrClientGate = detectAuthOrClientGate(text)
  const risk = placeholderRisk(hasPlaceholderText, hasAuthOrClientGate)

  const metaType = seoMetaType(
    hasUseSeoMeta,
    hasUseHead,
    hasDefinePageMeta,
    hasLegacyHead
  )

  const notes = []
  if (read.error) notes.push(`read error: ${read.error}`)
  if (hasLegacyHead) notes.push('legacy head() option')
  if (hasUseSeoMeta && hasUseHead) notes.push('uses useSeoMeta + useHead')
  if (hasDefinePageMeta && (hasUseSeoMeta || hasUseHead || hasLegacyHead)) {
    notes.push('definePageMeta with additional head/meta helpers')
  }
  if (hasPlaceholderText) notes.push('placeholder text heuristic')
  if (hasAuthOrClientGate) notes.push('client/auth gating heuristic')

  const nuxtConfig = findNearestNuxtConfig(relPath)
  if (nuxtConfig?.hasRouteRules) {
    notes.push(`nearby routeRules in ${nuxtConfig.path}`)
  }

  return {
    appPackage: scopeLabelFromPath(relPath),
    file: relPath,
    route: inferRouteFromFile(relPath),
    seoMeta: metaType,
    hasUseSeoMeta,
    hasUseHead,
    hasDefinePageMeta,
    hasLegacyHead,
    titlePresent,
    descriptionPresent,
    canonicalPresent,
    robotsPresent,
    hasPlaceholderText,
    risk,
    notes: notes.join('; '),
  }
}

function compareRows(a, b) {
  return (
    a.appPackage.localeCompare(b.appPackage) ||
    a.route.localeCompare(b.route) ||
    a.file.localeCompare(b.file)
  )
}

function generateReport(rows) {
  const total = rows.length
  const withUseSeoMeta = rows.filter((row) => row.hasUseSeoMeta).length
  const withOnlyUseHead = rows.filter(
    (row) => !row.hasUseSeoMeta && row.seoMeta === 'useHead'
  ).length
  const withOnlyDefinePageMeta = rows.filter(
    (row) => !row.hasUseSeoMeta && !row.hasUseHead && !row.hasLegacyHead && row.hasDefinePageMeta
  ).length
  const withNone = rows.filter((row) => row.seoMeta === 'none').length
  const withPlaceholder = rows.filter((row) => row.hasPlaceholderText).length

  const lines = []
  lines.push('# Page Meta Report')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('## Summary')
  lines.push(`- Total pages found: ${total}`)
  lines.push(`- Pages with \`useSeoMeta\`: ${withUseSeoMeta}`)
  lines.push(`- Pages with only \`useHead\`: ${withOnlyUseHead}`)
  lines.push(`- Pages with only \`definePageMeta\`: ${withOnlyDefinePageMeta}`)
  lines.push(`- Pages with none: ${withNone}`)
  lines.push(`- Pages that likely render placeholder text like “Loading…”: ${withPlaceholder}`)
  lines.push('')

  lines.push('## Results')
  lines.push('')
  lines.push(
    '| App/Package | File | Route (best-effort) | SEO Meta | Title present? | Description present? | Canonical present? | Robots present? | Placeholder risk? | Notes |'
  )
  lines.push(
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |'
  )

  for (const row of rows) {
    lines.push(
      `| ${escapeCell(row.appPackage)} | ${escapeCell(row.file)} | ${escapeCell(
        row.route
      )} | ${escapeCell(row.seoMeta)} | ${yesNo(row.titlePresent)} | ${yesNo(
        row.descriptionPresent
      )} | ${yesNo(row.canonicalPresent)} | ${yesNo(row.robotsPresent)} | ${escapeCell(
        row.risk
      )} | ${escapeCell(row.notes)} |`
    )
  }

  lines.push('')
  lines.push('## Top Fix Targets')
  lines.push('')

  const targets = rows
    .filter((row) => row.seoMeta === 'none' && row.risk === 'high')
    .sort(compareRows)

  if (!targets.length) {
    lines.push('- No pages matched `(SEO Meta = none) + (Placeholder risk = high)`.')
  } else {
    for (const row of targets) {
      lines.push(`- ${row.file}`)
    }
  }

  lines.push('')
  return `${lines.join('\n')}`
}

function main() {
  const pageAbsFiles = walkForPageVueFiles(repoRoot)
  const pageRelFiles = pageAbsFiles
    .map((abs) => toPosix(path.relative(repoRoot, abs)))
    .sort((a, b) => a.localeCompare(b))

  const rows = pageRelFiles.map((rel) => analyzePage(rel)).sort(compareRows)
  const report = generateReport(rows)
  fs.writeFileSync(outputPath, report, 'utf8')

  console.log(`page-meta-report: generated ${toPosix(path.relative(repoRoot, outputPath))}`)
  console.log(`page-meta-report: pages scanned ${rows.length}`)
}

main()
