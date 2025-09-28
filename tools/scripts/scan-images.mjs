#!/usr/bin/env node
import { glob } from 'glob'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const ROOT = process.cwd()

const IMG_GLOB = '**/*.{png,jpg,jpeg,gif,svg,webp,ico,bmp,avif,svgz}'
const CODE_GLOB = '**/*.{vue,ts,tsx,js,mjs,cjs,md,css,scss,json}'
const IGNORE = ['**/node_modules/**', '**/.git/**', '**/artifacts/**']

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/')
}

function webPathFor(file) {
  const p = rel(file)
  const pubIdx = p.indexOf('/public/')
  if (pubIdx !== -1) return '/' + p.slice(pubIdx + '/public/'.length)
  const coreMarker = 'packages/core/fireux-core/src/runtime/public/'
  const coreIdx = p.indexOf(coreMarker)
  if (coreIdx !== -1) return '/' + p.slice(coreIdx + coreMarker.length)
  return null // not directly web-served; still include in inventory
}

function groupFor(file) {
  const p = rel(file)
  if (p.startsWith('projects/')) return 'projects'
  if (p.startsWith('packages/')) return 'packages'
  return 'other'
}

async function sha1(file) {
  const buf = await fs.readFile(file)
  return crypto.createHash('sha1').update(buf).digest('hex')
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function main() {
  const imagePaths = await glob(IMG_GLOB, {
    ignore: IGNORE,
    withFileTypes: false,
  })
  const absImages = imagePaths.map((p) => path.join(ROOT, p))

  const items = []
  for (const file of absImages) {
    const r = rel(file)
    const web = webPathFor(file)
    const grp = groupFor(file)
    const hash = await sha1(file)
    items.push({ file: r, web, group: grp, hash, used: false })
  }

  // Build quick lookup maps
  const byWeb = new Map()
  for (const it of items) {
    if (it.web) byWeb.set(it.web, it)
  }

  // Heuristic allowlist that may be referenced indirectly
  const allowlist = new Set(['/favicon.ico'])
  for (const it of items) {
    if (it.web && (it.web.startsWith('/icon-') || it.web === '/favicon.ico')) {
      it.used = true
    }
  }

  // Scan code for web path references
  const codePaths = await glob(CODE_GLOB, {
    ignore: IGNORE,
    withFileTypes: false,
  })
  const webList = items.map((i) => i.web).filter(Boolean)
  // Build one regex for efficiency
  const regex = new RegExp(webList.map(escapeRegex).join('|'))

  for (const p of codePaths) {
    const abs = path.join(ROOT, p)
    const content = await fs.readFile(abs, 'utf8').catch(() => '')
    if (!content) continue
    let m
    // Fast pre-check
    if (!regex.test(content)) continue
    for (const w of webList) {
      if (content.includes(w)) {
        const it = byWeb.get(w)
        if (it) it.used = true
      }
    }
  }

  // Duplicates by hash
  const dupMap = new Map()
  for (const it of items) {
    if (!dupMap.has(it.hash)) dupMap.set(it.hash, [])
    dupMap.get(it.hash).push(it)
  }
  const duplicates = [...dupMap.values()].filter((list) => list.length > 1)

  // Orphans (unused and not allowlisted)
  const orphans = items.filter(
    (it) => !it.used && !(it.web && allowlist.has(it.web))
  )

  // Group for output
  const groups = {
    projects: items.filter((i) => i.group === 'projects'),
    packages: items.filter((i) => i.group === 'packages'),
    other: items.filter((i) => i.group === 'other'),
  }

  const lines = []
  lines.push('# Image Inventory')
  lines.push('')
  lines.push(`Generated on: ${new Date().toISOString().slice(0, 10)}`)
  lines.push('')
  lines.push('## Summary')
  lines.push(`- Total images: ${items.length}`)
  lines.push(`- Duplicates groups: ${duplicates.length}`)
  lines.push(`- Unused candidates: ${orphans.length}`)
  lines.push('')

  lines.push('## Duplicates (by content hash)')
  if (duplicates.length === 0) {
    lines.push('- None')
  } else {
    for (const group of duplicates) {
      lines.push(`- hash ${group[0].hash}:`)
      for (const it of group) lines.push(`  - ${it.file}`)
    }
  }
  lines.push('')

  lines.push('## Unused candidates (heuristic)')
  if (orphans.length === 0) {
    lines.push('- None')
  } else {
    for (const it of orphans) {
      lines.push(`- ${it.file}${it.web ? ` (web: ${it.web})` : ''}`)
    }
  }
  lines.push('')

  function section(title, arr) {
    lines.push(`## ${title}`)
    if (arr.length === 0) {
      lines.push('- None')
    } else {
      // Group by top-level folder under the section
      const buckets = new Map()
      for (const it of arr) {
        const parts = it.file.split('/')
        const key = parts.slice(0, 3).join('/') // e.g., projects/cleanbox/cleanbox-app
        if (!buckets.has(key)) buckets.set(key, [])
        buckets.get(key).push(it)
      }
      for (const [key, list] of buckets) {
        lines.push(`### ${key}`)
        for (const it of list) lines.push(`- ${it.file}`)
        lines.push('')
      }
    }
    lines.push('')
  }

  section('Projects', groups.projects)
  section('Packages', groups.packages)
  if (groups.other.length) section('Other', groups.other)

  const outPath = path.join(ROOT, 'images.md')
  await fs.writeFile(outPath, lines.join('\n'), 'utf8')
  console.log('Wrote', rel(outPath))
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
