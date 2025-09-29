#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Repo root is two levels up from this script: tools/scripts -> repoRoot
const repoRoot = path.resolve(__dirname, '../..')

const TARGET_GLOBS = ['packages/**/src/**/*.vue']

const VUE_APIS = [
  'ref',
  'computed',
  'reactive',
  'watch',
  'watchEffect',
  'onMounted',
  'onBeforeMount',
  'onUnmounted',
  'onBeforeUnmount',
  'nextTick',
  'provide',
  'inject',
  'shallowRef',
  'toRef',
  'toRefs',
  'unref',
]

function extractScriptSetup(code) {
  const openRe = /<script\s+setup[^>]*>/i
  const closeRe = /<\/script>/i
  const open = openRe.exec(code)
  if (!open) return null
  const start = open.index + open[0].length
  const close = closeRe.exec(code.slice(start))
  if (!close) return null
  const end = start + close.index
  return { start, end, content: code.slice(start, end), openTag: open[0] }
}

function parseVueImportNames(importLine) {
  // import { a, b as c } from 'vue'
  const m = importLine.match(/import\s*\{([^}]*)\}\s*from\s*['"]vue['"]/)
  if (!m) return []
  return m[1]
    .split(',')
    .map((s) =>
      s
        .trim()
        .split(/\s+as\s+/)[0]
        .trim()
    )
    .filter(Boolean)
}

function ensureVueImports(script) {
  const lines = script.split(/\r?\n/)
  const importIdxs = []
  let vueImportIdx = -1
  let existingVueNames = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*import\b/.test(line)) importIdxs.push(i)
    if (
      /from\s*['"]vue['"]\s*;?\s*$/.test(line) ||
      /from\s*['"]vue['"]\s*/.test(line)
    ) {
      vueImportIdx = i
      existingVueNames = parseVueImportNames(line)
    }
  }

  // Detect used APIs
  const used = new Set()
  for (const api of VUE_APIS) {
    // Match when api is called like `api(` and not part of an identifier (no preceding word or dot)
    const re = new RegExp(`(^|[^\\w.])${api}\\s*\\(`)
    if (re.test(script)) used.add(api)
  }

  if (used.size === 0) return script // nothing to add

  // Determine missing
  const missing = [...used].filter((name) => !existingVueNames.includes(name))
  if (missing.length === 0) return script

  if (vueImportIdx >= 0) {
    // Extend existing import
    const line = lines[vueImportIdx]
    const updated = line.replace(/import\s*\{([^}]*)\}/, (_m, group) => {
      const parts = group
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      for (const m of missing) if (!parts.includes(m)) parts.push(m)
      return `import { ${parts.join(', ')} }`
    })
    lines[vueImportIdx] = updated
    return lines.join('\n')
  }

  // Insert a new import after the first import, or at top of script
  const insertAt = importIdxs.length ? importIdxs[importIdxs.length - 1] + 1 : 0
  const newLine = `import { ${missing.join(', ')} } from 'vue'`
  lines.splice(insertAt, 0, newLine)
  return lines.join('\n')
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8')
  const ss = extractScriptSetup(src)
  if (!ss) return { file, changed: false }
  const updated = ensureVueImports(ss.content)
  if (updated === ss.content) return { file, changed: false }
  const next = src.slice(0, ss.start) + updated + src.slice(ss.end)
  fs.writeFileSync(file, next)
  return { file, changed: true }
}

function main() {
  let changedCount = 0
  let scanned = 0
  for (const pattern of TARGET_GLOBS) {
    const files = globSync(pattern, {
      cwd: repoRoot,
      absolute: true,
      dot: false,
    })
    for (const file of files) {
      scanned++
      const res = processFile(file)
      if (res.changed) changedCount++
    }
  }
  console.log(`tscrawler: scanned ${scanned} files, changed ${changedCount}`)
}

main()
