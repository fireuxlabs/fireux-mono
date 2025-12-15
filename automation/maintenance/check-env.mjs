#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Resolve repo root based on this script's location
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const templatesDir = path.join(repoRoot, 'templates', 'env')
const appTemplate = path.join(templatesDir, '.env.app.template')

/**
 * This script checks the current working directory for a .env file
 * and compares its keys against the canonical env templates.
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

function listTemplateKeys(templateFile) {
  const content = fs.readFileSync(templateFile, 'utf8')
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

function uniqueKeys(keys) {
  return [...new Set(keys)].sort()
}

function main() {
  if (!fs.existsSync(appTemplate)) {
    console.error('Env template not found at', appTemplate)
    process.exit(1)
  }

  const appEnv = parseEnvFile(path.join(process.cwd(), '.env'))
  const expected = uniqueKeys([...listTemplateKeys(appTemplate)])

  const missing = expected.filter((k) => !(k in appEnv))

  if (missing.length) {
    console.error('\n[env] Missing keys in .env for', process.cwd())
    for (const k of missing) console.error('  -', k)
    console.error(
      `\nHint: start from ${path.relative(repoRoot, appTemplate)} then fill in values.`
    )
    process.exit(2)
  }
  console.log('[env] All required keys present for', process.cwd())
}

main()
