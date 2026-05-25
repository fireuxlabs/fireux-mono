// FILE: scripts/guards/components.mjs
// Component registration guard.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(['node_modules', '.nuxt', '.output', 'dist'])

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    scan(rootPath, violations)
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ component naming drift detected:',
        ...violations
          .sort((a, b) => a.localeCompare(b))
          .map((violation) => `  - ${violation}`),
        '',
        '[guard] Fix:',
        '- Package-provided UI belongs under runtime/components/**.',
        '- Use Nuxt path-based component names from runtime/components/**.',
        '- Do not reintroduce organisms folders or Organisms* component names.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ component naming valid')
}

function scan(dir, violations) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue

    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (fullPath.endsWith(path.join('src', 'runtime', 'components', 'organisms'))) {
        violations.push(path.relative(process.cwd(), fullPath))
        continue
      }
      scan(fullPath, violations)
      continue
    }

    if (!/\.(ts|vue)$/.test(entry)) continue

    const source = readFileSync(fullPath, 'utf8')
    if (
      source.includes('runtime/components/organisms') ||
      source.includes('components/organisms') ||
      /\bOrganisms[A-Z]/.test(source)
    ) {
      violations.push(path.relative(process.cwd(), fullPath))
    }
  }
}
