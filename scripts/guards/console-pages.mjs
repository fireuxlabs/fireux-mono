// @fireux-script
// last_used: 2026-07-15
// usage_note: keeps console page composition explicit and surface metadata valid.
// FILE: scripts/guards/console-pages.mjs

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const PAGE_MARKER = '/pages/console/'
const STANDARD_SURFACES = new Set([
  'browse',
  'detail',
  'create',
  'edit',
  'workflow',
  'live',
])
const NON_DIRECT_PAGES = new Map([
  ['packages/core/fireux-core/src/runtime/pages/console/index.vue', 'redirect'],
  ['packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/identity.vue', 'router'],
  ['packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue', 'live'],
  ['projects/fireux/fireux-app/app/pages/console/index.vue', 'redirect'],
])

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []
  const seenPages = new Set()

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    scan(rootPath, repoRoot, violations, seenPages)
  }

  for (const relative of NON_DIRECT_PAGES.keys()) {
    if (!seenPages.has(relative)) {
      violations.push(`${relative} (stale non-direct page exception)`)
    }
  }

  if (violations.length) {
    throw new Error([
      '[guard] ❌ console page contract drift detected:',
      ...violations
        .sort((left, right) => left.localeCompare(right))
        .map((violation) => `  - ${violation}`),
      '',
      '[guard] Fix:',
      '- Console pages compose UDashboardPanel, LayoutsConsoleNavbar, and a body slot directly.',
      '- Pages own body width and spacing; named domain components own domain presentation.',
      '- Header actions belong in the console navbar right slot.',
      '- Surface metadata, when declared, uses browse, detail, create, edit, workflow, or live.',
      '- Only redirects, nested routers, and live layouts are exempt.',
    ].join('\n'))
  }

  console.log('[guard] ✅ console pages use the explicit page contract')
}

function scan(dir, repoRoot, violations, seenPages) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue

    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      scan(fullPath, repoRoot, violations, seenPages)
      continue
    }

    const normalized = fullPath.split(path.sep).join('/')
    if (!normalized.includes(PAGE_MARKER) || !normalized.endsWith('.vue')) continue

    const source = readFileSync(fullPath, 'utf8')
    const relative = path.relative(repoRoot, fullPath).split(path.sep).join('/')
    const template = readTemplate(source)
    const script = readScript(source)
    const surface = readConsoleSurface(script)
    const exceptionKind = NON_DIRECT_PAGES.get(relative)
    const directContract = hasDirectContract(template)

    seenPages.add(relative)

    if (surface && !STANDARD_SURFACES.has(surface)) {
      violations.push(`${relative} (invalid consoleSurface: ${surface})`)
    }

    if (normalized.endsWith('/edit.vue') && surface !== 'edit') {
      violations.push(`${relative} (edit route must declare consoleSurface: 'edit')`)
    }

    if (exceptionKind) {
      if (directContract) {
        violations.push(`${relative} (direct page must be removed from exceptions)`)
        continue
      }
      validateException(relative, exceptionKind, template, script, surface, violations)
      continue
    }

    validateDirectContract(relative, template, script, violations)
  }
}

function validateDirectContract(relative, template, script, violations) {
  const requiredTemplateParts = [
    ['UDashboardPanel', /<UDashboardPanel\b/],
    ['header slot', /<template\s+#header\b/],
    ['LayoutsConsoleNavbar', /<LayoutsConsoleNavbar\b/],
    ['body slot', /<template\s+#body\b/],
  ]

  for (const [label, pattern] of requiredTemplateParts) {
    if (!pattern.test(template)) {
      violations.push(`${relative} (missing ${label})`)
    }
  }

  if (!/\blayout\s*:\s*['"]console['"]/.test(script)) {
    violations.push(`${relative} (direct console page must declare layout: 'console')`)
  }
  if (!/\brequiresAuth\s*:\s*true\b/.test(script)) {
    violations.push(`${relative} (direct console page must declare requiresAuth: true)`)
  }
}

function validateException(relative, kind, template, script, surface, violations) {
  if (kind === 'redirect' && !/\bnavigateTo\s*\(/.test(script)) {
    violations.push(`${relative} (redirect exception must call navigateTo)`)
  }
  if (kind === 'router' && !/<NuxtPage\b/.test(template)) {
    violations.push(`${relative} (router exception must render NuxtPage)`)
  }
  if (kind === 'live') {
    if (surface !== 'live') {
      violations.push(`${relative} (live exception must declare consoleSurface: 'live')`)
    }
    if (!/\blayout\s*:\s*['"][^'"]+['"]/.test(script)) {
      violations.push(`${relative} (live exception must declare its layout)`)
    }
  }
}

function hasDirectContract(template) {
  return (
    /<UDashboardPanel\b/.test(template) &&
    /<template\s+#header\b/.test(template) &&
    /<LayoutsConsoleNavbar\b/.test(template) &&
    /<template\s+#body\b/.test(template)
  )
}

function readTemplate(source) {
  const start = source.indexOf('<template')
  if (start === -1) return ''
  const scriptStart = source.indexOf('<script', start)
  return source
    .slice(start, scriptStart === -1 ? source.length : scriptStart)
    .replace(/<!--[\s\S]*?-->/g, '')
}

function readScript(source) {
  const start = source.indexOf('<script')
  if (start === -1) return ''
  return stripJsComments(source.slice(start))
}

function readConsoleSurface(script) {
  return script.match(/\bconsoleSurface\s*:\s*(['"])([^'"]+)\1/)?.[2] ?? ''
}

function stripJsComments(source) {
  let result = ''
  let quote = ''
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    const next = source[index + 1]

    if (lineComment) {
      if (character === '\n') {
        lineComment = false
        result += character
      }
      continue
    }

    if (blockComment) {
      if (character === '*' && next === '/') {
        blockComment = false
        index += 1
      }
      continue
    }

    if (quote) {
      result += character
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === quote) {
        quote = ''
      }
      continue
    }

    if (character === '"' || character === "'" || character === '`') {
      quote = character
      result += character
      continue
    }
    if (character === '/' && next === '/') {
      lineComment = true
      index += 1
      continue
    }
    if (character === '/' && next === '*') {
      blockComment = true
      index += 1
      continue
    }

    result += character
  }

  return result
}
