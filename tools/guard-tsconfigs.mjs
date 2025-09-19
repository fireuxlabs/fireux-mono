#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const apps = [
  'projects/cleanbox/cleanbox-app',
  'projects/cleanbox/richies-reinigung',
  'projects/misebox/misebox-app',
  'projects/misebox/niederhorn',
  'projects/fireux/fireux-app',
  'projects/fireux/tennant',
]

const FAILS = []
for (const app of apps) {
  const p = join(app, 'tsconfig.json')
  const raw = readFileSync(p, 'utf8')
  if (!/"extends"\s*:\s*"..\/tsconfig\.app\.base\.json"/.test(raw)) {
    FAILS.push(
      `[${app}] tsconfig must extend ../tsconfig.app.base.json exactly`
    )
  }
}

if (FAILS.length) {
  console.error(
    '\n⛔ TS config guard failed:\n' + FAILS.map((x) => ' - ' + x).join('\n')
  )
  process.exit(1)
} else {
  console.log('✅ TS config guard passed')
}
