#!/usr/bin/env node

import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['projects']
const violations = []

function walk(dir) {
  let entries = []
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const full = join(dir, entry.name)
    // If we land on an app directory, check for utils child directly
    if (entry.name === 'app') {
      const utilsDir = join(full, 'utils')
      try {
        const stat = statSync(utilsDir)
        if (stat.isDirectory()) {
          violations.push(utilsDir)
        }
      } catch {
        // no utils directory, ok
      }
    }
    // Recurse
    walk(full)
  }
}

for (const root of roots) {
  walk(root)
}

if (violations.length) {
  console.error('Disallowed app/utils directories found:')
  for (const v of violations) {
    console.error(`- ${v}`)
  }
  process.exit(1)
}

console.log('No disallowed app/utils directories found.')
