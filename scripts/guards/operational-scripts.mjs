// @fireux-script
// last_used: 2026-07-20
// usage_note: guard reusable local script safety mechanics and release-backup ordering.
// Concurrent edit — 2026-07-20 20:54 CEST — Repo Efficiency Pass 3 of 6: execute protected-artifact checks and lock Rules release backup order.
// Concurrent edit — 2026-07-20 22:07 CEST — Repo Efficiency Pass 4 of 6: lock read-only App media audit and guarded snapshot mutation contracts.
// Concurrent edit — 2026-07-20 22:27 CEST — User/Profile data pass: lock the identity reconciliation planner to read-only target-bound inspection.

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { access, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { writeProtectedJsonArtifact } from '../_lib/protected-json-artifact.mjs'

export async function run({ repoRoot = process.cwd() } = {}) {
  await assertProtectedJsonArtifact()
  await assertRulesReleaseBackup(repoRoot)
  await assertAppMediaOperationalSurface(repoRoot)
  await assertSnapshotSyncSafety(repoRoot)
  await assertUserIdentityPlannerReadOnly(repoRoot)
  console.log('[guard] ✅ operational script safety valid')
}

async function assertProtectedJsonArtifact() {
  const directory = await mkdtemp(
    path.join(tmpdir(), 'fireux-protected-json-artifact-')
  )
  const artifactPath = path.join(directory, 'backup.json')

  try {
    const payload = { alpha: 1, nested: { ready: true } }
    const artifact = await writeProtectedJsonArtifact({
      path: artifactPath,
      payload,
    })
    const expectedSource = `${JSON.stringify(payload, null, 2)}\n`
    const source = await readFile(artifactPath, 'utf8')
    const file = await stat(artifactPath)

    assert.equal(source, expectedSource)
    assert.equal(file.mode & 0o777, 0o600)
    assert.equal(
      artifact.sha256,
      createHash('sha256').update(expectedSource).digest('hex')
    )
    await assert.rejects(
      writeProtectedJsonArtifact({ path: artifactPath, payload }),
      (error) => error?.code === 'EEXIST'
    )
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function assertRulesReleaseBackup(repoRoot) {
  const source = await readFile(
    path.join(repoRoot, 'scripts/deploy-misebox-firestore-rules.mjs'),
    'utf8'
  )
  const backupIndex = source.indexOf(
    'const releaseBackup = await backupReleases()'
  )
  assert.ok(backupIndex >= 0, 'Rules release actions require a backup.')

  for (const mutationToken of [
    'if (args.deploySimulation)',
    'if (args.promoteProduction)',
    'const rollbackRuleset = await getRuleset',
  ]) {
    const mutationIndex = source.indexOf(mutationToken)
    assert.ok(
      mutationIndex > backupIndex,
      `Rules backup must precede ${mutationToken}.`
    )
  }

  const backupFunction = source.slice(
    source.indexOf('async function backupReleases()'),
    source.indexOf('function sha256(value)')
  )
  assert.match(
    backupFunction,
    /await writeProtectedJsonArtifact\(\{[\s\S]*payload:/
  )
}

async function assertAppMediaOperationalSurface(repoRoot) {
  const packageJson = JSON.parse(
    await readFile(path.join(repoRoot, 'package.json'), 'utf8')
  )
  assert.equal(
    packageJson.scripts?.['audit:app-media'],
    'node scripts/audit-app-media.mjs',
    'App media exposes one read-only operational audit.'
  )

  const retired = [
    'list-app-media-trash.mjs',
    'delete-app-media-trash.mjs',
    'delete-app-media-folders.mjs',
    'sync-app-media-from-public.mjs',
  ]
  for (const file of retired) {
    await assert.rejects(
      access(path.join(repoRoot, 'scripts', file)),
      (error) => error?.code === 'ENOENT',
      `${file} is retired; App media writes are runtime-owned.`
    )
  }

  for (const command of [
    'list:app-media-trash',
    'delete:app-media-trash',
    'delete:app-media-folders',
    'sync:app-media-from-public',
  ]) {
    assert.equal(
      packageJson.scripts?.[command],
      undefined,
      `${command} must not restore a root App media writer.`
    )
  }

  const audit = await readFile(
    path.join(repoRoot, 'scripts/audit-app-media.mjs'),
    'utf8'
  )
  for (const token of [
    'APP_REGISTRY',
    'parseFirebaseStorageDownloadUrl',
    'const media = recordObject(data.media)',
    'bucket.getFiles({ prefix })',
    'await deleteApp(adminApp)',
  ]) {
    assert.ok(audit.includes(token), `App media audit must retain ${token}.`)
  }
}

async function assertSnapshotSyncSafety(repoRoot) {
  const packageJson = JSON.parse(
    await readFile(path.join(repoRoot, 'package.json'), 'utf8')
  )
  assert.equal(
    packageJson.scripts?.['sync:misebox-public-card-snapshots'],
    'node scripts/sync-self-contained-collection-rows.mjs',
    'The guarded Misebox snapshot sync must be an explicit supported command.'
  )

  const source = await readFile(
    path.join(repoRoot, 'scripts/sync-self-contained-collection-rows.mjs'),
    'utf8'
  )
  assert.doesNotMatch(source, /--commit|args\.commit/)

  for (const token of [
    'Pass both --project <projectId> and --database <databaseId>.',
    'Apply requires --confirm ${confirmation}.',
    'Apply requires --backup <new-json-path>.',
    'writeProtectedJsonArtifact',
    'db.runTransaction',
    'transaction.getAll',
    'assertCurrentVersions',
    'assertPatchApplied',
    'await deleteApp(app)',
  ]) {
    assert.ok(source.includes(token), `Snapshot sync must retain ${token}.`)
  }

  const backupIndex = source.indexOf('backup = await writePreimageBackup')
  const applyIndex = source.indexOf('verified = await applyPlan')
  assert.ok(backupIndex >= 0, 'Snapshot apply requires a protected preimage.')
  assert.ok(
    applyIndex > backupIndex,
    'Snapshot preimage must be complete before the atomic mutation starts.'
  )
}

async function assertUserIdentityPlannerReadOnly(repoRoot) {
  const source = await readFile(
    path.join(
      repoRoot,
      'scripts/plan-misebox-user-identity-reconciliation.mjs'
    ),
    'utf8'
  )

  for (const token of [
    'manual_entrypoint: true',
    "const PROJECT_ID = 'misebox-78f9c'",
    "const DATABASE_ID = 'misebox'",
    "const APP_ID = 'misebox-app'",
    "if (key === 'apply' || key === 'commit')",
    'This command is read-only.',
    'readOnly: true',
    'writeProtectedJsonArtifact',
    'await deleteApp(adminApp)',
  ]) {
    assert.ok(
      source.includes(token),
      `User identity planner must retain ${token}.`
    )
  }

  for (const token of [
    'db.runTransaction',
    'db.batch(',
    'transaction.create',
    'transaction.set',
    'transaction.update',
    'transaction.delete',
    '.recursiveDelete(',
    'file.delete(',
  ]) {
    assert.ok(
      !source.includes(token),
      `User identity planner must not expose remote mutation token ${token}.`
    )
  }
}
