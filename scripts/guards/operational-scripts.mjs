// @fireux-script
// last_used: 2026-07-21
// usage_note: guard reusable local script safety mechanics and release-backup ordering.
// Concurrent edit — 2026-07-20 20:54 CEST — Repo Efficiency Pass 3 of 6: execute protected-artifact checks and lock Rules release backup order.
// Concurrent edit — 2026-07-20 22:07 CEST — Repo Efficiency Pass 4 of 6: lock read-only App media audit and guarded snapshot mutation contracts.
// Concurrent edit — 2026-07-20 22:27 CEST — User/Profile data pass: lock the identity reconciliation planner to read-only target-bound inspection.
// Concurrent edit — 2026-07-21 15:07 CEST — Cleanbox-to-Werkbox migration: lock quarantine, migration-marker finalization, trusted-source evidence, release ordering, and production-promotion exclusivity.

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { access, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { writeProtectedJsonArtifact } from '../_lib/protected-json-artifact.mjs'
import { buildWerkboxServerSourceEvidence } from '../_lib/werkbox-security-contract.mjs'

export async function run({ repoRoot = process.cwd() } = {}) {
  await assertProtectedJsonArtifact()
  await assertRulesReleaseBackup(repoRoot)
  await assertWerkboxRulesSurface(repoRoot)
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
  const misebox = await readFile(
    path.join(repoRoot, 'scripts/deploy-misebox-firestore-rules.mjs'),
    'utf8'
  )
  assertBackupBefore(misebox, 'const releaseBackup = await backupReleases()', [
    'if (args.deploySimulation)',
    'if (args.promoteProduction)',
    'const rollbackRuleset = await getRuleset',
  ])
  assertProtectedRulesBackup(misebox)

  const werkbox = await readFile(
    path.join(repoRoot, 'scripts/deploy-werkbox-firestore-rules.mjs'),
    'utf8'
  )
  assertOrderedTokens(
    branchSource(werkbox, 'if (args.rollback) {', 'const compilation ='),
    [
      'args.rollback.databaseId === PRODUCTION_DATABASE_ID',
      "'Production candidate release requires --promote-production; rollback may only restore the tracked deny-all quarantine source.'",
      'const releaseBackup = await backupReleases([args.rollback.databaseId])',
      'const release = await pointRelease(',
    ],
    'Werkbox rollback'
  )
  assertOrderedTokens(
    branchSource(
      werkbox,
      'if (args.deploySimulation) {',
      'if (args.quarantineProduction) {'
    ),
    [
      'const releaseBackup = await backupReleases([SIMULATION_DATABASE_ID])',
      "const ruleset = await api(`projects/${PROJECT_ID}/rulesets`",
      'const release = await pointRelease(',
    ],
    'Werkbox simulation release'
  )
  assertOrderedTokens(
    branchSource(
      werkbox,
      'if (args.quarantineProduction) {',
      'if (args.promoteProduction) {'
    ),
    [
      'const releaseBackup = await backupReleases([PRODUCTION_DATABASE_ID])',
      "const ruleset = await api(`projects/${PROJECT_ID}/rulesets`",
      'const release = await pointRelease(',
    ],
    'Werkbox quarantine release'
  )
  assertOrderedTokens(
    branchSource(
      werkbox,
      'if (args.promoteProduction) {',
      'function parseArgs(values) {'
    ),
    [
      'const migrationEvidence = await assertReleaseEvidence(',
      'await assertReleaseSourceHash(PRODUCTION_DATABASE_ID, quarantineSha256)',
      'const releaseBackup = await backupReleases([PRODUCTION_DATABASE_ID])',
      'const confirmedEvidence = await assertReleaseEvidence(',
      'const release = await pointRelease(',
    ],
    'Werkbox production promotion'
  )
  assertProtectedRulesBackup(werkbox)
}

function branchSource(source, startToken, endToken) {
  const start = source.indexOf(startToken)
  const end = source.indexOf(endToken, start + startToken.length)
  assert.ok(start >= 0 && end > start, `Missing branch ${startToken}.`)
  return source.slice(start, end)
}

function assertOrderedTokens(source, tokens, label) {
  let cursor = -1
  for (const token of tokens) {
    const index = source.indexOf(token, cursor + 1)
    assert.ok(index > cursor, `${label} must retain ordered token ${token}.`)
    cursor = index
  }
}

function assertBackupBefore(source, backupToken, mutationTokens) {
  const backupIndex = source.indexOf(backupToken)
  assert.ok(backupIndex >= 0, `Rules release actions require ${backupToken}.`)
  for (const mutationToken of mutationTokens) {
    const mutationIndex = source.indexOf(mutationToken)
    assert.ok(
      mutationIndex > backupIndex,
      `Rules backup must precede ${mutationToken}.`
    )
  }
}

function assertProtectedRulesBackup(source) {
  const start = source.indexOf('async function backupReleases(')
  const end = source.indexOf('function sha256(value)', start)
  const backupFunction = source.slice(start, end)
  assert.match(
    backupFunction,
    /await writeProtectedJsonArtifact\(\{[\s\S]*payload:/
  )
}

async function assertWerkboxRulesSurface(repoRoot) {
  const packageJson = JSON.parse(
    await readFile(path.join(repoRoot, 'package.json'), 'utf8')
  )
  assert.equal(
    packageJson.scripts?.['firebase:rules:werkbox'],
    'node scripts/deploy-werkbox-firestore-rules.mjs',
    'Werkbox Rules must expose one guarded root command.'
  )

  const source = await readFile(
    path.join(repoRoot, 'scripts/deploy-werkbox-firestore-rules.mjs'),
    'utf8'
  )
  for (const token of [
    "const PROJECT_ID = 'cleanbox-f15bc'",
    "const PRODUCTION_DATABASE_ID = 'cleanbox'",
    "const SIMULATION_DATABASE_ID = 'cleanbox-simulation'",
    "'security-migrations/werkbox-firestore-rules-v1'",
    '--quarantine-production',
    'firestore-quarantine.rules',
    'executeQuarantineTests(',
    'Rollback is restricted to the tracked candidate or deny-all quarantine source.',
    'candidate_rules_sha256',
    'quarantine_rules_sha256',
    'post_migration_inventory_sha256',
    'server_api_probe_sha256',
    'server_api_source_sha256',
    'server_api_cutover_version',
    'no_legacy_compatibility',
    'operation_set_sha256',
    'assertConfirmation(',
    'assertNoBlockingIssues(issues,',
    'function buildSecurityTests(databaseId)',
    'Professional structured experience client update denied',
    'Professional scalar update cannot preserve polluted positions',
    'raw User identity denied to another user',
    'client notification delete denied',
    'Agent invalid contact email denied',
    'App javascript social URL denied',
    'App name remains control-owned',
    'Richies isolated from Werkbox member',
    'unknown root defaults to deny',
    'writeProtectedJsonArtifact',
  ]) {
    assert.ok(source.includes(token), `Werkbox Rules harness must retain ${token}.`)
  }
  assert.doesNotMatch(
    source,
    /request\.auth\.uid\s*==\s*['"][A-Za-z0-9_-]{20,}['"]/
  )

  const rules = await readFile(
    path.join(repoRoot, 'scripts/firebase/werkbox/firestore.rules'),
    'utf8'
  )
  for (const token of [
    "database in ['cleanbox', 'cleanbox-simulation']",
    "appId in ['cleanbox-app', 'richies-reinigung']",
    'match /ecosystems/{ecosystemId}',
    "request.auth.token.firebase.sign_in_provider != 'anonymous'",
    'match /jobs/{document=**}',
    'match /places/{document=**}',
    'match /companies/{document=**}',
    'match /products/{document=**}',
    'match /blogs/{document=**}',
    'match /{document=**}',
    'allow get, list, create, update, delete: if false;',
  ]) {
    assert.ok(rules.includes(token), `Werkbox Rules must retain ${token}.`)
  }
  assert.doesNotMatch(
    rules,
    /request\.auth\.uid\s*==\s*['"][A-Za-z0-9_-]{20,}['"]/
  )

  const quarantine = await readFile(
    path.join(
      repoRoot,
      'scripts/firebase/werkbox/firestore-quarantine.rules'
    ),
    'utf8'
  )
  const quarantineAllows = [
    ...quarantine.matchAll(/allow\s+([^:]+):\s*if\s+([^;]+);/g),
  ].map((match) => ({
    permissions: match[1].replaceAll(/\s+/g, ' ').trim(),
    condition: match[2].replaceAll(/\s+/g, ' ').trim(),
  }))
  assert.deepEqual(
    quarantineAllows,
    [{ permissions: 'read, write', condition: 'false' }],
    'Werkbox quarantine must have exactly one unconditional read/write denial.'
  )

  const planner = await readFile(
    path.join(repoRoot, 'scripts/plan-werkbox-firestore-migration.mjs'),
    'utf8'
  )
  for (const token of [
    'This planner is read-only.',
    'MIGRATION_MARKER_ALREADY_EXISTS',
    'source_backup_sha256',
    'canonical_notification_count',
    "products: 'disabled-v1'",
    "blogs: 'disabled-v1'",
  ]) {
    assert.ok(planner.includes(token), `Werkbox planner must retain ${token}.`)
  }

  const migrator = await readFile(
    path.join(repoRoot, 'scripts/migrate-werkbox-firestore-contract.mjs'),
    'utf8'
  )
  for (const token of [
    'assertProductionQuarantine(',
    'probeTrustedServerApis(sourceEvidence.sha256)',
    '/api/internal/werkbox/security-contract',
    'https://richies-reinigung.web.app',
    'captureAuthorityInventory()',
    'assertInventoryTransition(',
    'finalizeMigrationMarker({',
    'productionStillQuarantined: true',
    'candidateRulesPromoted: false',
  ]) {
    assert.ok(migrator.includes(token), `Werkbox migrator must retain ${token}.`)
  }
  const applySlice = branchSource(
    migrator,
    '  } else {',
    '} finally {'
  )
  assertOrderedTokens(
    applySlice,
    [
      'const preProbe = await probeTrustedServerApis(sourceEvidence.sha256)',
      'const quarantineEvidence = await assertProductionQuarantine(',
      'const backupArtifact = await writeProtectedJsonArtifact({',
      'await applyTransaction(dataOperations)',
      'const verification = await verifyResults(dataOperations)',
      'assertInventoryTransition(preInventory, postInventory, dataOperations)',
      'const postProbe = await probeTrustedServerApis(sourceEvidence.sha256)',
      'await finalizeMigrationMarker({',
      'const markerVerification = await verifyResults([',
    ],
    'Werkbox migration apply'
  )

  const contractSource = await readFile(
    path.join(
      repoRoot,
      'packages/ecosystem/fireux-werkbox/src/runtime/server/api/internal/werkbox/security-contract.get.ts'
    ),
    'utf8'
  )
  const contractSha256 = contractSource.match(
    /WERKBOX_SERVER_SOURCE_SHA256\s*=\s*\n?\s*'([a-f0-9]{64})'/
  )?.[1]
  const expectedContract = await buildWerkboxServerSourceEvidence({ repoRoot })
  assert.equal(
    contractSha256,
    expectedContract.sha256,
    'Werkbox deployed security-contract hash must match the exact trusted source manifest.'
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
