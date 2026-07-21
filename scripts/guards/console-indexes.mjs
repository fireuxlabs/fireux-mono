// @fireux-script
// last_used: 2026-07-21
// usage_note: keeps console entity indexes on the shared selected-target and outcome-driven target presentation spine.
// FILE: scripts/guards/console-indexes.mjs
// Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: prevent selected-target and target-state presentation forks.
// Concurrent edit — 2026-07-21 22:38 CEST — Console authority alignment: lock family-owned target resolution and outcome-bound selection.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const INDEX_COMPONENT_RE = /\/components\/Console\/([^/]+)\/Index\/Index\.vue$/
const MEMBERSHIP_TARGET_FAMILIES = new Set([
  'Blank',
  'Portfolio',
  'Property',
  'Supplier',
])

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const files = []
  const violations = []

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    collectFiles(rootPath, files)
  }

  const indexComponents = files.flatMap((fullPath) => {
    const normalized = normalizePath(fullPath)
    const match = normalized.match(INDEX_COMPONENT_RE)
    return match ? [{ fullPath, family: match[1] }] : []
  })

  for (const index of indexComponents) {
    validateIndex({ ...index, files, repoRoot, violations })
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ console index spine drift detected:',
        ...violations
          .sort((left, right) => left.localeCompare(right))
          .map((violation) => `  - ${violation}`),
        '',
        '[guard] Fix:',
        '- Keep ConsoleXIndex on the selected → targets → debug rhythm and shared useConsoleIndex adapter.',
        '- Render selected state through ConsoleSelectedTarget and forward @clear="actions.clear".',
        '- Render target pending/error/ready/empty state only through ConsoleTargetCollection.',
        '- Resolve membership target IDs and outcomes once in the family core; index adapters only consume that authority.',
        '- Bind Kitchen selection to its live/demo target items and outcome, with auto-selection left to useConsoleIndex.',
        '- Domain wrappers retain entity mapping, copy, cards, actions, and intentional multi-source composition.',
      ].join('\n')
    )
  }

  console.log(
    '[guard] ✅ console entity indexes use the shared presentation spine'
  )
}

function validateIndex({ fullPath, family, files, repoRoot, violations }) {
  const relative = relativePath(repoRoot, fullPath)
  const indexDir = path.dirname(fullPath)
  const source = readFileSync(fullPath, 'utf8')
  const selectedPath = path.join(indexDir, 'Selected.vue')
  const targetsPath = path.join(indexDir, 'Targets.vue')
  const selectedTag = readSelfClosingTag(
    source,
    `Console${family}IndexSelected`
  )
  const targetsTag = readSelfClosingTag(source, `Console${family}IndexTargets`)
  const debugTag = readSelfClosingTag(source, 'DevFireuxDebugPanel')

  assertMatch(
    source,
    /class=["']console-surface console-surface--compact["']/,
    relative,
    'index must use the compact shared console surface',
    violations
  )
  if (!selectedTag) {
    violations.push(`${relative} (missing Console${family}IndexSelected)`)
  } else if (!/@clear=["']actions\.clear["']/.test(selectedTag)) {
    violations.push(
      `${relative} (selected wrapper must forward @clear="actions.clear")`
    )
  }
  if (!targetsTag) {
    violations.push(`${relative} (missing Console${family}IndexTargets)`)
  } else {
    assertMatch(
      targetsTag,
      /:collection=["']sections\.targets\.collection["']/,
      relative,
      'targets wrapper must receive sections.targets.collection',
      violations
    )
    assertMatch(
      targetsTag,
      /:outcome=["']sections\.targets\.outcome["']/,
      relative,
      'targets wrapper must receive sections.targets.outcome',
      violations
    )
    assertMatch(
      targetsTag,
      /@select=["']actions\.selectTarget["']/,
      relative,
      'targets wrapper must forward actions.selectTarget',
      violations
    )
  }
  if (!debugTag) {
    violations.push(`${relative} (missing DevFireuxDebugPanel)`)
  } else {
    assertMatch(
      debugTag,
      /:data=["']debug["']/,
      relative,
      'debug panel must receive the index debug state',
      violations
    )
  }
  const selectedPosition = source.indexOf(`<Console${family}IndexSelected`)
  const targetsPosition = source.indexOf(`<Console${family}IndexTargets`)
  const debugPosition = source.indexOf('<DevFireuxDebugPanel')
  if (
    selectedPosition >= 0 &&
    targetsPosition >= 0 &&
    debugPosition >= 0 &&
    !(selectedPosition < targetsPosition && targetsPosition < debugPosition)
  ) {
    violations.push(
      `${relative} (index order must be selected → targets → debug)`
    )
  }
  assertMatch(
    source,
    new RegExp(`\\buse${family}ConsoleIndex\\s*\\(`),
    relative,
    `index must call use${family}ConsoleIndex`,
    violations
  )

  validateSelected({ selectedPath, family, repoRoot, violations })
  validateTargets({ targetsPath, indexDir, files, repoRoot, violations })
  validateComposable({ family, files, repoRoot, violations })
  validateTargetAuthority({ family, files, repoRoot, violations })
}

function validateSelected({ selectedPath, family, repoRoot, violations }) {
  const relative = relativePath(repoRoot, selectedPath)
  if (!existsSync(selectedPath)) {
    violations.push(`${relative} (missing selected-target wrapper)`)
    return
  }

  const source = readFileSync(selectedPath, 'utf8')
  assertMatch(
    source,
    /<ConsoleSelectedTarget\b/,
    relative,
    'selected wrapper must use ConsoleSelectedTarget',
    violations
  )
  assertMatch(
    source,
    /@clear=["']emit\(['"]clear['"]\)["']/,
    relative,
    'selected wrapper must emit clear from ConsoleSelectedTarget',
    violations
  )
  assertMatch(
    source,
    new RegExp(`label=["']${escapeRegex(family)}["']`),
    relative,
    `selected wrapper must identify ${family}`,
    violations
  )
}

function validateTargets({
  targetsPath,
  indexDir,
  files,
  repoRoot,
  violations,
}) {
  const relative = relativePath(repoRoot, targetsPath)
  if (!existsSync(targetsPath)) {
    violations.push(`${relative} (missing targets wrapper)`)
    return
  }

  const targetPresentationFiles = files.filter(
    (candidate) =>
      candidate.endsWith('.vue') &&
      candidate.startsWith(`${indexDir}${path.sep}`)
  )
  const combinedSource = targetPresentationFiles
    .map((candidate) => readFileSync(candidate, 'utf8'))
    .join('\n')
  const targetsSource = readFileSync(targetsPath, 'utf8')

  assertMatch(
    combinedSource,
    /<ConsoleTargetCollection\b/,
    relative,
    'target presentation must delegate state chrome to ConsoleTargetCollection',
    violations
  )
  if (/<MoleculesStateCard\b/.test(targetsSource)) {
    violations.push(
      `${relative} (targets wrapper must not replace authoritative outcome state with a local state card)`
    )
  }
}

function validateComposable({ family, files, repoRoot, violations }) {
  const filename = `use${family}ConsoleIndex.ts`
  const candidates = files.filter(
    (candidate) => path.basename(candidate) === filename
  )
  if (!candidates.length) {
    violations.push(`${filename} (missing console index adapter)`)
    return
  }

  for (const candidate of candidates) {
    const source = readFileSync(candidate, 'utf8')
    if (/\buseConsoleIndex\s*\(\s*\{/.test(source)) continue
    violations.push(
      `${relativePath(repoRoot, candidate)} (console index adapter must delegate to useConsoleIndex)`
    )
  }
}

function validateTargetAuthority({ family, files, repoRoot, violations }) {
  const coreFilename = `use${family}Console.ts`
  const indexFilename = `use${family}ConsoleIndex.ts`
  const familySegment = `/console/${family.toLowerCase()}/`
  const coreCandidates = files.filter((candidate) => {
    const normalized = normalizePath(candidate)
    return (
      path.basename(candidate) === coreFilename &&
      normalized.includes(`${familySegment}core/`)
    )
  })
  const indexCandidates = files.filter((candidate) => {
    const normalized = normalizePath(candidate)
    return (
      path.basename(candidate) === indexFilename &&
      normalized.includes(`${familySegment}index/`)
    )
  })

  if (coreCandidates.length !== 1) {
    violations.push(
      `${coreFilename} (expected exactly one family core; found ${coreCandidates.length})`
    )
    return
  }
  if (indexCandidates.length !== 1) {
    violations.push(
      `${indexFilename} (expected exactly one family index adapter; found ${indexCandidates.length})`
    )
    return
  }

  const corePath = coreCandidates[0]
  const indexPath = indexCandidates[0]
  const coreRelative = relativePath(repoRoot, corePath)
  const indexRelative = relativePath(repoRoot, indexPath)
  const coreSource = readFileSync(corePath, 'utf8')
  const indexSource = readFileSync(indexPath, 'utf8')

  assertNoIndexTargetResolver(indexSource, indexRelative, violations)

  if (MEMBERSHIP_TARGET_FAMILIES.has(family)) {
    if (findCallSources(coreSource, 'useConsoleTargets').length !== 1) {
      violations.push(
        `${coreRelative} (family core must own exactly one useConsoleTargets resolver)`
      )
    }
    assertMatch(
      coreSource,
      new RegExp(`useConsoleTargets\\s*\\(\\s*\\{\\s*family:\\s*['\"]${family.toLowerCase()}['\"]`),
      coreRelative,
      `family core must resolve ${family} target IDs`,
      violations
    )
    assertMatch(
      coreSource,
      /consoleTargets\.resolveOutcome\s*\(/,
      coreRelative,
      'family core must compose membership state into its target outcome',
      violations
    )
    assertMatch(
      coreSource,
      family === 'Blank'
        ? /targetIds:\s*consoleTargets\.targetIds/
        : /consoleTargets\.filter\s*\(\s*explicitFilter\s*\)/,
      coreRelative,
      family === 'Blank'
        ? 'Blank collection must exact-load the UserApp target ids'
        : 'family collection filter must be bounded by UserApp target ids',
      violations
    )
    assertMatch(
      coreSource,
      /\btargetOutcome(?:\s*:\s*[A-Za-z][A-Za-z0-9_]*|\s*,)/,
      coreRelative,
      'family selection runtime must receive the authoritative target outcome',
      violations
    )
    assertMatch(
      coreSource,
      /targeting:\s*consoleTargets/,
      coreRelative,
      'family core must expose its one target authority to the index adapter',
      violations
    )
    assertMatch(
      indexSource,
      /\btargeting\b[\s\S]*targeting\.singleTargetId/,
      indexRelative,
      'index adapter must consume core-owned target authority for single-target selection',
      violations
    )
    return
  }

  if (family !== 'Kitchen') {
    const runtimeCalls = findCallSources(coreSource, 'useConsoleEntityRuntime')
    if (runtimeCalls.length !== 1) {
      violations.push(
        `${coreRelative} (family core must create exactly one outcome-bound entity runtime)`
      )
    } else {
      assertMatch(
        runtimeCalls[0],
        /\btargetOutcome(?:\s*:\s*[A-Za-z][A-Za-z0-9_]*|\s*,)/,
        coreRelative,
        'family core must bind selection to its authoritative target outcome',
        violations
      )
    }
    return
  }

  if (findCallSources(coreSource, 'useKitchenConsoleTargetCollection').length !== 1) {
    violations.push(
      `${coreRelative} (Kitchen core must own exactly one authenticated live target collection)`
    )
  }
  assertMatch(
    coreSource,
    /targets:\s*liveTargetCollection/,
    coreRelative,
    'Kitchen core must expose the authenticated target collection it owns',
    violations
  )
  assertNoMatch(
    indexSource,
    /useKitchenConsoleTargetCollection\s*\(/,
    indexRelative,
    'Kitchen index must consume, not recreate, the core target collection',
    violations
  )

  const selectionCalls = findCallSources(coreSource, 'useConsoleSelection')
  if (selectionCalls.length !== 1) {
    violations.push(
      `${coreRelative} (Kitchen core must create exactly one outcome-bound console selection)`
    )
  } else {
    assertMatch(
      selectionCalls[0],
      /targetItems:\s*selectionTargets/,
      coreRelative,
      'Kitchen selection must receive source-aware target items',
      violations
    )
    assertMatch(
      selectionCalls[0],
      /targetOutcome:\s*selectionOutcome/,
      coreRelative,
      'Kitchen selection must receive the source-aware target outcome',
      violations
    )
  }
  assertNoMatch(
    coreSource,
    /\bautoSelectTargetId\b/,
    coreRelative,
    'Kitchen core must leave auto-selection to the shared index adapter',
    violations
  )
  for (const watchSource of findCallSources(coreSource, 'watch')) {
    assertNoMatch(
      watchSource,
      /\b(?:selectKitchen|selectTarget)\s*\(/,
      coreRelative,
      'Kitchen core must not add a second auto-selection watch',
      violations
    )
  }
}

function assertNoIndexTargetResolver(source, relative, violations) {
  assertNoMatch(
    source,
    /\buseConsoleTargets\s*\(/,
    relative,
    'index adapter must not duplicate the family core target resolver',
    violations
  )
  assertNoMatch(
    source,
    /\.resolveOutcome\s*\(/,
    relative,
    'index adapter must not overlay another target outcome',
    violations
  )
}

function findCallSources(source, callee) {
  const calls = []
  const pattern = new RegExp(`\\b${escapeRegex(callee)}(?:\\s*<[^;{}()]*>)?\\s*\\(`, 'g')
  let match

  while ((match = pattern.exec(source))) {
    const open = source.indexOf('(', match.index)
    const close = findMatchingParenthesis(source, open)
    if (close === -1) break
    calls.push(source.slice(match.index, close + 1))
    pattern.lastIndex = close + 1
  }

  return calls
}

function findMatchingParenthesis(source, open) {
  let depth = 0
  let quote = ''
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = open; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (lineComment) {
      if (char === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false
        index += 1
      }
      continue
    }
    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === quote) quote = ''
      continue
    }
    if (char === '/' && next === '/') {
      lineComment = true
      index += 1
      continue
    }
    if (char === '/' && next === '*') {
      blockComment = true
      index += 1
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '(') depth += 1
    if (char !== ')') continue
    depth -= 1
    if (depth === 0) return index
  }

  return -1
}

function readSelfClosingTag(source, componentName) {
  return (
    source.match(
      new RegExp(`<${escapeRegex(componentName)}\\b[\\s\\S]*?\\/>`)
    )?.[0] ?? ''
  )
}

function assertMatch(source, pattern, relative, message, violations) {
  if (!pattern.test(source)) violations.push(`${relative} (${message})`)
}

function assertNoMatch(source, pattern, relative, message, violations) {
  if (pattern.test(source)) violations.push(`${relative} (${message})`)
}

function collectFiles(dir, files) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue

    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      collectFiles(fullPath, files)
      continue
    }
    if (fullPath.endsWith('.vue') || fullPath.endsWith('.ts'))
      files.push(fullPath)
  }
}

function relativePath(repoRoot, fullPath) {
  return normalizePath(path.relative(repoRoot, fullPath))
}

function normalizePath(value) {
  return value.split(path.sep).join('/')
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
