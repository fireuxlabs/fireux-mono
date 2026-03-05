#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const packagesDir = path.join(repoRoot, 'packages')
const mirrorDir = path.join(repoRoot, 'mirror')
const mirrorListPath = path.join(mirrorDir, 'mirror.txt')

function collectModelFiles(dir) {
  const out = []
  const stack = [dir]

  while (stack.length) {
    const current = stack.pop()
    if (!current) continue

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const abs = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(abs)
        continue
      }
      if (!entry.isFile()) continue
      if (!entry.name.endsWith('.model.ts')) continue
      out.push(path.relative(repoRoot, abs).split(path.sep).join('/'))
    }
  }

  return out.sort((a, b) => a.localeCompare(b))
}

function main() {
  fs.mkdirSync(mirrorDir, { recursive: true })

  if (!fs.existsSync(packagesDir) || !fs.statSync(packagesDir).isDirectory()) {
    throw new Error('mirror-models: packages/ directory not found')
  }

  const modelFiles = collectModelFiles(packagesDir)

  const lines = [
    '# mirror list generated from model files',
    '# source: packages/**/**/*.model.ts',
    '# regenerate: pnpm mirror:models',
    '',
    ...modelFiles,
    '',
  ]

  fs.writeFileSync(mirrorListPath, lines.join('\n'), 'utf8')
  console.log(
    `mirror-models: wrote ${modelFiles.length} model files to ${path.relative(repoRoot, mirrorListPath)}`
  )

  execFileSync('node', ['scripts/mirror-sync.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
}

main()

