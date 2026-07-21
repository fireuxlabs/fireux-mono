// @fireux-script
// last_used: 2026-07-21
// usage_note: render and verify complete Firestore Rules release artifacts from Core fragments and ecosystem templates.
// Concurrent edit — 2026-07-21 15:27 CEST — Shared Firestore Rules pass: own deterministic target discovery, rendering, hashing, and drift checks.

import { createHash } from 'node:crypto'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { composeFirestoreRules } from '../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const ecosystemRoot = path.join(repoRoot, 'packages', 'ecosystem')
const templateRelativePath = path.join(
  'src',
  'config',
  'firebase',
  'firestore.template.rules'
)

export async function listFirestoreRulesTargets() {
  const entries = await readdir(ecosystemRoot, { withFileTypes: true })
  const targets = []

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name)
  )) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    const templatePath = path.join(ecosystemRoot, entry.name, templateRelativePath)
    if (!(await exists(templatePath))) continue

    const template = await readFile(templatePath, 'utf8')
    const rendered = await composeFirestoreRules(template)
    const artifactPath = path.resolve(repoRoot, rendered.manifest.artifactPath)
    assertArtifactPath(artifactPath, rendered.manifest.key)

    targets.push(
      Object.freeze({
        ...rendered,
        packageName: entry.name,
        templatePath,
        artifactPath,
        sha256: sha256(rendered.content),
      })
    )
  }

  const keys = targets.map((target) => target.manifest.key)
  if (new Set(keys).size !== keys.length) {
    throw new Error('Firestore Rules ecosystem keys must be unique.')
  }
  return targets
}

export async function renderFirestoreRulesTarget(key) {
  const targets = await listFirestoreRulesTargets()
  const target = targets.find((entry) => entry.manifest.key === key)
  if (!target) {
    throw new Error(
      `Unknown Firestore Rules target ${key}. Known targets: ${targets
        .map((entry) => entry.manifest.key)
        .join(', ')}`
    )
  }
  return target
}

export async function assertFirestoreRulesArtifactCurrent(key) {
  const target = await renderFirestoreRulesTarget(key)
  await assertTargetCurrent(target)
  return target
}

export async function assertAllFirestoreRulesArtifactsCurrent() {
  const targets = await listFirestoreRulesTargets()
  if (!targets.length) {
    throw new Error('No ecosystem Firestore Rules templates were found.')
  }
  for (const target of targets) await assertTargetCurrent(target)
  return targets
}

async function assertTargetCurrent(target) {
  const actual = await readFile(target.artifactPath, 'utf8').catch((error) => {
    if (error?.code === 'ENOENT') return null
    throw error
  })
  if (actual === target.content) return

  const actualSha256 = actual == null ? null : sha256(actual)
  throw new Error(
    `${target.manifest.key} Firestore Rules artifact is stale.\n` +
      `Template: ${path.relative(repoRoot, target.templatePath)}\n` +
      `Artifact: ${target.manifest.artifactPath}\n` +
      `Expected SHA-256: ${target.sha256}\n` +
      `Actual SHA-256: ${actualSha256 ?? 'missing'}\n` +
      'Regenerate explicitly with: node scripts/render-firestore-rules.mjs --write'
  )
}

function assertArtifactPath(artifactPath, key) {
  const expected = path.join(repoRoot, 'scripts', 'firebase', key, 'firestore.rules')
  if (artifactPath !== expected) {
    throw new Error(`${key} Firestore Rules artifact escaped its fixed target.`)
  }
}

async function exists(file) {
  try {
    await access(file)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}
