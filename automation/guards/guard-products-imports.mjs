#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { globSync } from 'glob'

// Guard: fireux-products must import useFirestoreManager from fireux-core, not relative paths.
const badPatterns = [
  '../../operations/useFirestoreManager',
  '../../../operations/useFirestoreManager',
  '../../operations/useFirestoreManager.ts',
  '../../../operations/useFirestoreManager.ts',
]

const files = globSync(
  'packages/extensions/fireux-products/src/runtime/**/*.{ts,vue}',
  {
    nodir: true,
  }
)

const offenders = []

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  for (const bad of badPatterns) {
    if (text.includes(bad)) {
      offenders.push(`${file} imports ${bad}`)
    }
  }
}

if (offenders.length) {
  console.error(
    'Guard failed: disallowed useFirestoreManager import path(s) found in fireux-products:\n' +
      offenders.map((o) => `- ${o}`).join('\n')
  )
  process.exit(1)
}

console.log('Guard passed: fireux-products imports are clean.')
