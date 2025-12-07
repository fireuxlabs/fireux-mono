#!/usr/bin/env node

import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const apps = [
  'projects/fireux/fireux-app/public/img/app/pwa',
  'projects/misebox/misebox-app/public/img/app/pwa',
  'projects/misebox/niederhorn/public/img/app/pwa',
  'projects/cleanbox/cleanbox-app/public/img/app/pwa',
  'projects/cleanbox/richies-reinigung/public/img/app/pwa',
  'projects/fireux/tennant/public/img/app/pwa',
]

const allowed = new Set(['icon-192.png', 'icon-512.png'])
const errors = []

for (const dir of apps) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch (err) {
    errors.push(`Missing PWA icon directory: ${dir}`)
    continue
  }

  const files = entries.filter((entry) => {
    const full = join(dir, entry)
    try {
      return statSync(full).isFile()
    } catch (err) {
      return false
    }
  })

  for (const required of allowed) {
    if (!files.includes(required)) {
      errors.push(`Missing ${required} in ${dir}`)
    }
  }

  for (const file of files) {
    if (!allowed.has(file)) {
      errors.push(`Unexpected file in ${dir}: ${file}`)
    }
  }
}

if (errors.length) {
  console.error(
    'PWA icon guard failed:\n' + errors.map((e) => `- ${e}`).join('\n')
  )
  process.exit(1)
}

console.log('PWA icon guard passed.')
