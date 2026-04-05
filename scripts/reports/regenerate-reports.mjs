#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../..')
const canonVersion = 'server-projection-v1'
const generatedAt = new Date().toISOString()

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
  'demo',
  'mirror',
  'temp',
])

const SOURCE_EXTENSIONS = new Set(['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', '.vue'])

const INDEXABLE_ALLOWLIST = [
  'users',
  'jobs',
  'agents',
  'professionals',
  'chefs',
  'suppliers',
  'places',
  'kitchens',
  'companies',
  'blogs',
  'recipes',
  'products',
]

const NEVER_INDEX_ROUTE_BUCKETS = [
  '/console/**',
  '/dashboard/**',
  '/admin/**',
  '/dev/**',
  '/auth/**',
  '/onboarding/**',
]

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function rel(absPath) {
  return toPosix(path.relative(repoRoot, absPath))
}

function readFileSafe(absPath) {
  try {
    return fs.readFileSync(absPath, 'utf8')
  } catch {
    return ''
  }
}

function walkFiles(rootDir, options = {}) {
  const includeExtensions = options.extensions || SOURCE_EXTENSIONS
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
      const ext = path.extname(entry.name)
      if (!includeExtensions.has(ext)) continue
      out.push(abs)
    }
  }

  return out
}

function writeFile(relPath, contents) {
  const absPath = path.join(repoRoot, relPath)
  fs.mkdirSync(path.dirname(absPath), { recursive: true })
  fs.writeFileSync(absPath, contents, 'utf8')
}

function uniq(values) {
  return Array.from(new Set(values))
}

function collectCollections(files) {
  const byCollection = new Map()

  const collectionPatterns = [
    /\bcollection\s*\(\s*[^)]*?['"`]([a-zA-Z0-9_-]+)['"`]/g,
    /\.collection\s*\(\s*['"`]([a-zA-Z0-9_-]+)['"`]\s*\)/g,
    /\b(?:Path|Firestore)\s*:\s*\/?([a-zA-Z0-9_-]+)\/(?:<|\{)/g,
  ]

  for (const file of files) {
    const text = readFileSafe(file)
    if (!text) continue
    for (const pattern of collectionPatterns) {
      for (const match of text.matchAll(pattern)) {
        const collection = String(match[1] || '').trim()
        if (!collection) continue
        if (!/^[a-zA-Z0-9_-]+$/.test(collection)) continue

        if (!byCollection.has(collection)) byCollection.set(collection, new Set())
        byCollection.get(collection).add(rel(file))
      }
    }
  }

  return byCollection
}

function formatMetadataBlock(scanScopeLines) {
  const lines = []
  lines.push(`Generated: ${generatedAt}`)
  lines.push(`Canon version: \`${canonVersion}\``)
  lines.push('Scan scope:')
  for (const line of scanScopeLines) lines.push(`- ${line}`)
  return lines.join('\n')
}

function regeneratePageMetaReport() {
  const pageMetaScript = path.join(repoRoot, 'scripts/page-meta-report.mjs')
  if (!fs.existsSync(pageMetaScript)) {
    throw new Error('Missing scripts/page-meta-report.mjs')
  }

  const run = spawnSync('node', [pageMetaScript], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  })

  if (run.status !== 0) {
    throw new Error(`page-meta-report.mjs failed with exit code ${run.status}`)
  }

  const pageMetaPath = path.join(repoRoot, 'page-meta-report.md')
  const pageMetaText = readFileSafe(pageMetaPath)
  if (!pageMetaText) return

  const scopeLines = [
    'Included: files under any `pages/` directory across `apps/**`, `packages/**`, `projects/**`.',
    'Included checks: `useSeoMeta`, `useHead`, `definePageMeta`, placeholder/auth gate heuristics.',
    'Excluded: `node_modules`, build outputs, `.git`, docs-only folders.',
  ]

  const metadata = formatMetadataBlock(scopeLines)

  let next = pageMetaText
  next = next.replace(/Generated:\s*[^\n]+/i, `Generated: ${generatedAt}`)
  if (!/Canon version:/i.test(next)) {
    next = next.replace(/Generated:[^\n]*\n/i, (line) => `${line}Canon version: \`${canonVersion}\`\n`)
  } else {
    next = next.replace(/Canon version:\s*`[^`]+`/i, `Canon version: \`${canonVersion}\``)
  }
  if (!/Scan scope:/i.test(next)) {
    next = next.replace(
      /Canon version:[^\n]*\n/i,
      (line) => `${line}Scan scope:\n${scopeLines.map((s) => `- ${s}`).join('\n')}\n`
    )
  } else {
    next = next.replace(
      /Scan scope:[\s\S]*?(?:\n##|\n#|$)/i,
      `Scan scope:\n${scopeLines.map((s) => `- ${s}`).join('\n')}\n\n##`
    )
  }

  if (!next.startsWith('# Page Meta Report')) {
    next = `# Page Meta Report\n\n${metadata}\n\n${next}`
  }

  fs.writeFileSync(pageMetaPath, next, 'utf8')
}

function generateGlobalEntitiesReport(files) {
  const byCollection = collectCollections(files)
  const seoIndexMentions = new Map()

  for (const file of files) {
    const relative = rel(file)
    if (relative === 'scripts/reports/regenerate-reports.mjs') continue
    const text = readFileSafe(file)
    if (!text) continue
    for (const match of text.matchAll(/\bseo_index_[a-z0-9_-]+\b/gi)) {
      const name = String(match[0] || '').trim()
      if (!name) continue
      if (!seoIndexMentions.has(name)) seoIndexMentions.set(name, new Set())
      seoIndexMentions.get(name).add(relative)
    }
  }

  for (const [seoCollection, paths] of seoIndexMentions.entries()) {
    if (!byCollection.has(seoCollection)) {
      byCollection.set(seoCollection, paths)
    } else {
      for (const p of paths) byCollection.get(seoCollection).add(p)
    }
  }

  const rows = Array.from(byCollection.entries())
    .map(([collection, set]) => ({
      collection,
      files: Array.from(set).sort(),
      isSeoIndex: collection.startsWith('seo_index_'),
      indexRecommendation: INDEXABLE_ALLOWLIST.includes(collection)
        ? 'index'
        : collection.startsWith('seo_index_')
          ? 'noindex (projection)'
          : 'noindex (default)',
    }))
    .sort((a, b) => a.collection.localeCompare(b.collection))

  const candidateIndexable = rows
    .filter((row) => INDEXABLE_ALLOWLIST.includes(row.collection))
    .map((row) => row.collection)

  const seoIndexCollections = rows
    .filter((row) => row.isSeoIndex)
    .map((row) => row.collection)

  const scopeLines = [
    'Included: `packages/**`, `projects/**`, `apps/**`, `scripts/**` source files.',
    'Signals: Firestore calls (`collection(...)`, `.collection(...)`) and model path comments.',
    'Excluded: nested subcollections and app overlays are not treated as canonical global entities.',
  ]

  const lines = []
  lines.push('# Global Entities Report')
  lines.push('')
  lines.push(formatMetadataBlock(scopeLines))
  lines.push('')
  lines.push('## Summary')
  lines.push(`- Root collection candidates detected: ${rows.length}`)
  lines.push(`- Candidate indexable collections: ${candidateIndexable.length}`)
  lines.push(`- SEO projection collections detected: ${seoIndexCollections.length}`)
  lines.push('')
  lines.push('## Detected Collections')
  lines.push('')
  lines.push('| Collection | Indexing recommendation | Example source paths |')
  lines.push('| --- | --- | --- |')
  for (const row of rows) {
    const examples = row.files.slice(0, 3).join('<br/>')
    lines.push(`| \`${row.collection}\` | ${row.indexRecommendation} | ${examples} |`)
  }
  lines.push('')
  lines.push('## Candidate Indexable Entities')
  if (!candidateIndexable.length) {
    lines.push('- None detected from allowlist.')
  } else {
    for (const name of candidateIndexable) lines.push(`- \`${name}\``)
  }
  lines.push('')
  lines.push('## Never Index Buckets')
  for (const route of NEVER_INDEX_ROUTE_BUCKETS) lines.push(`- \`${route}\``)
  lines.push('- Nested subcollections (`/<root>/{id}/...`)')
  lines.push('- App overlays (`/apps/{appId}/...`)')
  lines.push('')
  lines.push('## Transitional State')
  lines.push('- Keep `seo_index_*` collections until each entity migrates to canonical-doc sitemap reads.')
  lines.push('- `handles` legacy collection is retired; runtime handle resolution is canonical `users.handle`.')

  const report = `${lines.join('\n')}\n`
  writeFile('global-entities-report.md', report)
  writeFile('docs/seo/global-entities-report.md', report)
}

function generateHandleSystemReport(files) {
  const refsHandles = []
  const refsUserHandleReads = []
  const refsUserHandleWrites = []
  const refsSeoIndexUsers = []
  const refsPublicUserEndpoints = []

  for (const file of files) {
    const relative = rel(file)
    if (relative === 'scripts/reports/regenerate-reports.mjs') continue
    const text = readFileSafe(file)
    if (!text) continue

    if (/\b['"`]handles['"`]\b/.test(text) || /\bhandles\/\{handle\}/.test(text)) {
      refsHandles.push(relative)
    }
    if (/where\s*\(\s*['"`]handle['"`]\s*,\s*['"`]==['"`]/.test(text)) {
      refsUserHandleReads.push(relative)
    }
    if (/\bhandle\b/.test(text) && /(updateDoc|setDoc|runTransaction|upsert)/.test(text)) {
      refsUserHandleWrites.push(relative)
    }
    if (/seo_index_users/.test(text)) {
      refsSeoIndexUsers.push(relative)
    }
    if (/\/api\/public\/users/.test(text)) {
      refsPublicUserEndpoints.push(relative)
    }
  }

  const scopeLines = [
    'Included: runtime pages/composables/server APIs, modules, and scripts.',
    'Signals: `handles` collection references, `users.handle` read/write paths, `seo_index_users` usage.',
    'Excluded: generated output and non-source assets.',
  ]

  const lines = []
  lines.push('# Handle System Report')
  lines.push('')
  lines.push(formatMetadataBlock(scopeLines))
  lines.push('')
  lines.push('## Current Architecture')
  lines.push('- Runtime public routing resolves user handles from `users.handle`.')
  lines.push('- Public user pages now use endpoint-first SSR (`/api/public/users`, `/api/public/users/:handle`).')
  lines.push('- User SEO now resolves from canonical docs (`users`) for pages and sitemap generation.')
  lines.push('- `handles/{handle}` should be absent from runtime and cleanup scripts after migration.')
  lines.push('')
  lines.push('## Runtime Handle Reads')
  if (!refsUserHandleReads.length) {
    lines.push('- None detected.')
  } else {
    for (const p of uniq(refsUserHandleReads).sort()) lines.push(`- \`${p}\``)
  }
  lines.push('')
  lines.push('## Handle Write Paths')
  if (!refsUserHandleWrites.length) {
    lines.push('- None detected.')
  } else {
    for (const p of uniq(refsUserHandleWrites).sort()) lines.push(`- \`${p}\``)
  }
  lines.push('')
  lines.push('## Legacy `handles` Collection References')
  if (!refsHandles.length) {
    lines.push('- None detected.')
  } else {
    for (const p of uniq(refsHandles).sort()) lines.push(`- \`${p}\``)
  }
  lines.push('')
  lines.push('## Transitional SEO Projection References (`seo_index_users`)')
  if (!refsSeoIndexUsers.length) {
    lines.push('- None detected.')
  } else {
    for (const p of uniq(refsSeoIndexUsers).sort()) lines.push(`- \`${p}\``)
  }
  lines.push('')
  lines.push('## Public Endpoint References')
  if (!refsPublicUserEndpoints.length) {
    lines.push('- None detected.')
  } else {
    for (const p of uniq(refsPublicUserEndpoints).sort()) lines.push(`- \`${p}\``)
  }
  lines.push('')
  lines.push('## Recommendation')
  lines.push('- Canonical runtime routing should remain `users.handle`.')
  lines.push('- Keep `seo_index_*` only where entities are not yet migrated; `seo_index_users` is retired.')

  const report = `${lines.join('\n')}\n`
  writeFile('handle-system-report.md', report)
  writeFile('docs/handle.md', report)
}

function generateCollectionManagerReport(files) {
  const managerFiles = []
  const firestorePublicPages = []
  const endpointPublicPages = []
  const targetPageMatchers = [
    /\/pages\/users\/(index|\[handle\])\.vue$/,
    /\/pages\/jobs\/(index|\[id\])\.vue$/,
    /\/pages\/kitchens\/(index|\[id\])\.vue$/,
    /\/pages\/places\/(index|\[id\])\.vue$/,
    /\/pages\/companies\/(index|\[id\])\.vue$/,
    /\/pages\/agents\/(index|\[id\])\.vue$/,
    /\/pages\/professionals\/(index|\[id\])\.vue$/,
    /\/pages\/chefs\/(index|\[id\])\.vue$/,
    /\/pages\/suppliers\/(index|\[id\])\.vue$/,
    /\/pages\/blog\/(index|\[slug\])\.vue$/,
    /\/pages\/recipes\/(index|\[slug\])\.vue$/,
  ]

  for (const file of files) {
    const relative = rel(file)
    const text = readFileSafe(file)
    if (!text) continue

    if (/Collection\/Manager\.vue$/.test(relative) || /\bUserCollectionManager\b/.test(text)) {
      managerFiles.push(relative)
    }

    const isTargetPublicPage = targetPageMatchers.some((re) => re.test(relative))
    if (!isTargetPublicPage) continue

    const usesEndpoint = /\/api\/public\//.test(text) || /\$fetch\s*\(\s*['"`]\/api\/public\//.test(text)
    const usesClientFirestore =
      /\buseFirestore\b/.test(text) ||
      /\buseCollection\b/.test(text) ||
      /\buseDocument\b/.test(text) ||
      /\bfirestoreFetch(Collection|Doc|Query)?\b/.test(text)

    if (usesEndpoint) {
      endpointPublicPages.push(relative)
    } else if (usesClientFirestore) {
      firestorePublicPages.push(relative)
    }
  }

  const scopeLines = [
    'Included: collection manager components, public route pages, runtime server API files.',
    'Signals: endpoint-first reads (`/api/public/*`) vs client Firestore reads (`useCollection`, `useDocument`, `firestoreFetch*`).',
    'Excluded: private console/dashboard/admin pages from migration scope.',
  ]

  const lines = []
  lines.push('# Collection Manager Report')
  lines.push('')
  lines.push(formatMetadataBlock(scopeLines))
  lines.push('')
  lines.push('## Current Collection Manager Architecture')
  lines.push('- Collection manager UI components remain in-place for CRUD/list UX surfaces.')
  lines.push('- Migration scope is public read-path only; manager CRUD patterns remain unchanged.')
  lines.push('')
  lines.push('### Manager Files')
  if (!managerFiles.length) {
    lines.push('- None detected.')
  } else {
    for (const p of uniq(managerFiles).sort()) lines.push(`- \`${p}\``)
  }
  lines.push('')
  lines.push('## Public Read Path Status')
  lines.push(`- Endpoint-first public pages detected: ${uniq(endpointPublicPages).length}`)
  lines.push(`- Client-Firestore public pages still detected: ${uniq(firestorePublicPages).length}`)
  lines.push('')
  lines.push('### Endpoint-First')
  if (!endpointPublicPages.length) {
    lines.push('- None detected.')
  } else {
    for (const p of uniq(endpointPublicPages).sort()) lines.push(`- \`${p}\``)
  }
  lines.push('')
  lines.push('### Still Client Firestore')
  if (!firestorePublicPages.length) {
    lines.push('- None detected.')
  } else {
    for (const p of uniq(firestorePublicPages).sort()) lines.push(`- \`${p}\``)
  }
  lines.push('')
  lines.push('## Coupling Analysis')
  lines.push('- Server-projection adoption does not require redesigning collection manager CRUD abstractions.')
  lines.push('- Required changes are page/public API read-path changes and sitemap source migration only.')
  lines.push('')
  lines.push('## Transitional State')
  lines.push('- Keep `seo_index_*` for entities still projection-backed during rollout.')
  lines.push('- `handles/{handle}` legacy path is retired in runtime and migration scripts.')
  lines.push('- New `/api/public/users` endpoints supersede projection-first public reads incrementally.')

  const report = `${lines.join('\n')}\n`
  writeFile('collection-manager-report.md', report)
  writeFile('docs/reports/collection-manager-report.md', report)
}

function main() {
  const allFiles = walkFiles(repoRoot)

  regeneratePageMetaReport()
  generateGlobalEntitiesReport(allFiles)
  generateHandleSystemReport(allFiles)
  generateCollectionManagerReport(allFiles)
}

try {
  main()
  process.stdout.write('[reports] regenerated page-meta/global-entities/handle-system/collection-manager reports\n')
} catch (error) {
  process.stderr.write(`[reports] failed: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
}
