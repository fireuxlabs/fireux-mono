#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const rootExample = path.join(root, '.env.example')

/**
 * This script checks the current working directory for a .env file
 * and compares its keys against the repo root .env.example.
 *
 * Usage from an app folder: `node ../../scripts/check-env.mjs`
 */

function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  const content = fs.readFileSync(file, 'utf8')
  const keys = {}
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const idx = t.indexOf('=')
    if (idx === -1) continue
    const k = t.slice(0, idx).trim()
    keys[k] = true
  }
  return keys
}

function listExampleKeys(exampleFile) {
  const content = fs.readFileSync(exampleFile, 'utf8')
  const keys = []
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const idx = t.indexOf('=')
    if (idx === -1) continue
    keys.push(t.slice(0, idx).trim())
  }
  return keys
}

function main() {
  if (!fs.existsSync(rootExample)) {
    console.error('Root .env.example not found at', rootExample)
    process.exit(1)
  }

  const appEnv = parseEnvFile(path.join(process.cwd(), '.env'))
  const expected = listExampleKeys(rootExample)

  const missing = expected.filter(k => !(k in appEnv))

  if (missing.length) {
    console.error('\n[env] Missing keys in .env for', process.cwd())
    for (const k of missing) console.error('  -', k)
    console.error('\nHint: copy keys from repo .env.example and fill in values.')
    process.exit(2)
  }
  console.log('[env] All required keys present for', process.cwd())
}

main()
