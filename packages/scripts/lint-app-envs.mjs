#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

const appTemplatePath = path.join(repoRoot, 'templates', '.env.app.template')

function parseEnvKeysFromText(text) {
  const keys = new Set()

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const normalized = line.startsWith('export ') ? line.slice('export '.length).trim() : line
    const eqIdx = normalized.indexOf('=')
    if (eqIdx === -1) continue

    const key = normalized.slice(0, eqIdx).trim()
    if (!key) continue

    keys.add(key)
  }

  return keys
}

function parseEnvKeysFromFile(filePath) {
  if (!fs.existsSync(filePath)) return new Set()
  const content = fs.readFileSync(filePath, 'utf8')
  return parseEnvKeysFromText(content)
}

function sorted(listOrSet) {
  return [...listOrSet].sort((a, b) => a.localeCompare(b))
}

function rel(p) {
  return path.relative(repoRoot, p)
}

function main() {
  if (!fs.existsSync(appTemplatePath)) {
    console.error(`[env] Missing template: ${rel(appTemplatePath)}`)
    process.exit(1)
  }

  const templateKeys = parseEnvKeysFromFile(appTemplatePath)
  if (templateKeys.size === 0) {
    console.error(`[env] Template has no keys: ${rel(appTemplatePath)}`)
    process.exit(1)
  }

  const appEnvFiles = globSync('projects/*/*/.env', {
    cwd: repoRoot,
    absolute: true,
    nodir: true,
  })

  if (appEnvFiles.length === 0) {
    console.warn('[env] No app .env files found under projects/*/*/.env')
    process.exit(0)
  }

  const failures = []

  for (const envFile of appEnvFiles) {
    const envKeys = parseEnvKeysFromFile(envFile)

    const missing = sorted([...templateKeys].filter((k) => !envKeys.has(k)))
    const extra = sorted([...envKeys].filter((k) => !templateKeys.has(k)))

    if (missing.length || extra.length) {
      failures.push({ envFile, missing, extra })
    }
  }

  if (failures.length) {
    console.error(`\n[env] ${failures.length} app .env file(s) do not match ${rel(appTemplatePath)}\n`)

    for (const f of failures) {
      console.error(`- ${rel(f.envFile)}`)
      if (f.missing.length) {
        console.error('  Missing keys:')
        for (const k of f.missing) console.error(`    - ${k}`)
      }
      if (f.extra.length) {
        console.error('  Extra keys (not allowed at app level):')
        for (const k of f.extra) console.error(`    - ${k}`)
      }
      console.error('')
    }

    console.error(`Fix: make each app .env contain ONLY the keys in ${rel(appTemplatePath)}.`)
    process.exit(2)
  }

  console.log(`[env] OK: ${appEnvFiles.length} app .env file(s) match ${rel(appTemplatePath)}`)
}

main()
