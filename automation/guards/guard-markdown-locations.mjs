#!/usr/bin/env node
/* Guard: ensure markdown files stay in approved locations. */
import { execSync } from 'node:child_process'

const allowedPatterns = [
  /^README\.md$/,
  /^AGENTS\.md$/,
  /^docs\/.*\.md$/,
  /^\.github\/prompts\/.*\.md$/,
  /^\.specify\/.*\.md$/,
  /^copilot-documentation\/.*\.md$/,
  /^packages\/.*\/README\.md$/,
  /^packages\/.*\/docs\/.*\.md$/,
  /^packages\/.*\/dist\/.*\.md$/,
  /^packages\/.*\/src\/.*\.md$/,
  /^projects\/.*\/README\.md$/,
  /^projects\/.*\/docs\/.*\.md$/,
  /^automation\/migrations\/README\.md$/,
]

const isAllowed = (path) => allowedPatterns.some((re) => re.test(path))

const listMarkdown = () => {
  const raw = execSync(
    "find . -path './node_modules' -prune -o -path './projects/fireux/fireux-app/.nuxt' -prune -o -path './projects/fireux/fireux-app/node_modules' -prune -o -name '*.md' -type f -print",
    { encoding: 'utf8' }
  )
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith('./') ? p.slice(2) : p))
}

const violations = listMarkdown().filter((path) => !isAllowed(path))

if (violations.length) {
  console.error('Markdown files found outside approved locations:')
  for (const v of violations) console.error(` - ${v}`)
  process.exit(1)
}
