#!/usr/bin/env node
/**
 * Delete stray emitted files (*.js, *.js.map, *.d.ts) that live alongside source .ts/.vue files.
 * Excludes: node_modules, dist, build, .nuxt, .output, .next, .turbo, types/
 */
import { glob } from 'glob'
import fs from 'fs/promises'
import path from 'node:path'

const DRY = process.argv.includes('--dry')

const IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.nuxt/**',
  '**/.output/**',
  '**/.next/**',
  '**/.turbo/**',
  'types/**'
]

const patterns = [
  '**/*.js',
  '**/*.js.map',
  '**/*.d.ts'
]

function inTypesDir(f) {
  return f.split(path.sep).includes('types')
}

;(async () => {
  const files = await glob(patterns, { ignore: IGNORE, withFileTypes: false, nodir: true })
  const victims = []
  for (const f of files) {
    if (inTypesDir(f)) continue
    // Skip files that are clearly source entries (e.g., package export points)
    // Only delete if a sibling .ts exists with same basename
    const tsCandidate = f.replace(/\.(js|d\.ts)(\.map)?$/, '.ts')
    const vueCandidate = f.replace(/\.(js|d\.ts)(\.map)?$/, '.vue')
    try {
      await fs.access(tsCandidate)
      victims.push(f)
      continue
    } catch {}
    try {
      await fs.access(vueCandidate)
      victims.push(f)
    } catch {}
  }

  if (victims.length === 0) {
    console.log('No stray emitted files found.')
    return
  }

  console.log(`${DRY ? '[DRY]' : ''} Found ${victims.length} files${DRY ? '' : ' to delete'}:`)
  for (const v of victims) console.log(' -', v)

  if (DRY) return
  await Promise.all(victims.map((v) => fs.rm(v).catch(() => {})))
  console.log('Cleanup complete.')
})()
