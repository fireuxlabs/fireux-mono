#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..', '..')
const modelsRoot = join(repoRoot, 'packages')

const expectedArgIndex = process.argv.indexOf('--expected')
const expectedObjects =
  expectedArgIndex >= 0
    ? String(process.argv[expectedArgIndex + 1] || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : ['Project', 'App', 'Ecosystem']

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const nextPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.output') return []
        return walk(nextPath)
      }

      if (!entry.isFile() || !entry.name.endsWith('.ts')) return []
      if (!nextPath.includes('/src/runtime/models/')) return []

      return [nextPath]
    })
  )

  return files.flat()
}

function modelNameFromSource(source) {
  const match = source.match(/export const (\w+)Model\s*=/)
  return match?.[1] || ''
}

const files = await walk(modelsRoot)
const directProjectLinked = []
let projectRoot = null

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const modelName = modelNameFromSource(source)
  if (!modelName) continue

  const entry = {
    object: modelName.replace(/Model$/, ''),
    file: relative(repoRoot, file),
  }

  if (modelName === 'Project') {
    projectRoot = entry
  }

  if (/(^|\n)\s*project_id\s*:/.test(source)) {
    directProjectLinked.push(entry)
  }
}

directProjectLinked.sort((a, b) => a.object.localeCompare(b.object))

const actualObjects = [
  ...(projectRoot ? ['Project'] : []),
  ...directProjectLinked.map((entry) => entry.object),
]

const uniqueActualObjects = [...new Set(actualObjects)]
const missingObjects = expectedObjects.filter(
  (object) => !uniqueActualObjects.includes(object)
)
const unexpectedObjects = uniqueActualObjects.filter(
  (object) => !expectedObjects.includes(object)
)

const checks = [
  {
    key: 'project-root',
    label: 'Project root model exists',
    ok: Boolean(projectRoot),
    detail: projectRoot?.file || 'Missing Project model',
  },
  {
    key: 'app-project-link',
    label: 'App declares project_id',
    ok: directProjectLinked.some((entry) => entry.object === 'App'),
    detail:
      directProjectLinked.find((entry) => entry.object === 'App')?.file ||
      'App model missing project_id',
  },
  {
    key: 'ecosystem-project-link',
    label: 'Ecosystem declares project_id',
    ok: directProjectLinked.some((entry) => entry.object === 'Ecosystem'),
    detail:
      directProjectLinked.find((entry) => entry.object === 'Ecosystem')?.file ||
      'Ecosystem model missing project_id',
  },
]

console.log(
  JSON.stringify(
    {
      ok:
        checks.every((check) => check.ok) &&
        missingObjects.length === 0 &&
        unexpectedObjects.length === 0,
      expectedObjects,
      actualObjects: uniqueActualObjects,
      directProjectLinkedObjects: directProjectLinked,
      projectRoot,
      missingObjects,
      unexpectedObjects,
      checks,
    },
    null,
    2
  )
)
