// @fireux-script
// last_used: 2026-08-03
// usage_note: guard reusable local script safety mechanics and release-backup ordering.
// Concurrent edit — 2026-07-20 20:54 CEST — Repo Efficiency Pass 3 of 6: execute protected-artifact checks and lock Rules release backup order.
// Concurrent edit — 2026-07-20 22:07 CEST — Repo Efficiency Pass 4 of 6: lock read-only App media audit and guarded snapshot mutation contracts.
// Concurrent edit — 2026-07-20 22:27 CEST — User/Profile data pass: lock the identity reconciliation planner to read-only target-bound inspection.
// Concurrent edit — 2026-07-21 15:07 CEST — Cleanbox-to-Werkbox migration: lock quarantine, migration-marker finalization, trusted-source evidence, release ordering, and production-promotion exclusivity.
// Concurrent edit — 2026-07-21 16:11 CEST — Shared Firestore Rules pass: lock lexical and wildcard-normalized frame identity.
// Concurrent edit — 2026-08-03 — Separate local Werkbox attestation drift from authorised deployment proof.

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import {
  composeFirestoreRules,
  expandFirestoreRulesTemplate,
} from '../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs'
import { assertAllFirestoreRulesArtifactsCurrent } from '../_lib/firestore-rules-source.mjs'
import { writeProtectedJsonArtifact } from '../_lib/protected-json-artifact.mjs'

export async function run({ repoRoot = process.cwd() } = {}) {
  await assertGitSavePolicy(repoRoot)
  await assertAllFirestoreRulesArtifactsCurrent()
  await assertRulesFragmentScope(repoRoot)
  await assertRulesSourceConsumers(repoRoot)
  await assertProtectedJsonArtifact()
  await assertRulesReleaseBackup(repoRoot)
  await assertWerkboxRulesSurface(repoRoot)
  await assertAppMediaOperationalSurface(repoRoot)
  await assertSnapshotSyncSafety(repoRoot)
  await assertUserIdentityPlannerReadOnly(repoRoot)
  await assertFirebaseAuthDomainSync(repoRoot)
  console.log('[guard] ✅ operational script safety valid')
}

export async function assertGitSavePolicy(repoRoot) {
  const source = await readFile(
    path.join(repoRoot, 'scripts/gitsave.sh'),
    'utf8'
  )
  const envLint = await readFile(
    path.join(repoRoot, 'scripts/lint-envs.mjs'),
    'utf8'
  )
  const ciWorkflow = await readFile(
    path.join(repoRoot, '.github/workflows/ci.yml'),
    'utf8'
  )

  assert.match(source, /Guard failures cannot be bypassed\./)
  assert.doesNotMatch(
    source,
    /--strict-scope|--no-strict-scope|--allow-large|--allow-behind|--allow-guard-failure|--no-guard|--no-verify|strict_scope|allow_large|allow_behind|allow_guard_failure|run_guard/,
    'gitsave must not expose switches that weaken scope or guard policy.'
  )
  assert.doesNotMatch(
    `${envLint}\n${ciWorkflow}`,
    /ALLOW_INCOMPLETE_ENVS|Env lint \(permissive in CI\)/,
    'Environment validation must not advertise or use a permissive bypass.'
  )
}

export async function assertFirebaseAuthDomainSync(repoRoot) {
  const deploy = await readFile(
    path.join(repoRoot, 'scripts/firebase-deploy.mjs'),
    'utf8'
  )
  const sync = await readFile(
    path.join(repoRoot, 'scripts/sync-firebase-auth-domains.mjs'),
    'utf8'
  )
  const createEcosystem = await readFile(
    path.join(repoRoot, 'scripts/create-ecosystem.mjs'),
    'utf8'
  )
  const authDomainHelpers = await readFile(
    path.join(repoRoot, 'scripts/_lib/firebase-auth-domains.mjs'),
    'utf8'
  )
  const interlakenPackage = JSON.parse(
    await readFile(
      path.join(repoRoot, 'projects/misebox/interlaken-essen/package.json'),
      'utf8'
    )
  )

  assert.match(deploy, /sync-firebase-auth-domains\.mjs/)
  assert.match(deploy, /args\['auth-domains'\]/)
  assert.match(sync, /updateMask=authorizedDomains/)
  assert.match(sync, /new Set\(\[\.\.\.previous, \.\.\.domains\]\)/)
  assert.match(sync, /verification failed/)
  assert.match(sync, /parseFirebaseAuthDomains/)
  assert.match(authDomainHelpers, /without protocol, path or port/)
  assert.match(createEcosystem, /--auth-domain <hostname>/)
  assert.match(createEcosystem, /--firebase-site <site-id>/)
  assert.match(createEcosystem, /--sync-auth-domain/)
  assert.match(createEcosystem, /--no-sync-auth-domain/)
  assert.match(
    createEcosystem,
    /Add all intended public origins to Firebase Authentication authorized domains/
  )
  assert.match(createEcosystem, /\$\{firebaseSite\}\.web\.app/)
  assert.match(createEcosystem, /Please answer yes or no/)
  assert.match(createEcosystem, /!process\.stdin\.isTTY/)
  assert.match(createEcosystem, /sync-firebase-auth-domains\.mjs/)
  assert.match(
    createEcosystem,
    /src\/runtime\/public\/img\/ecosystem\/brand\/\.gitkeep/
  )
  assert.match(
    createEcosystem,
    /canonical ecosystem brand source and its named App projections/
  )

  const createScript = path.join(repoRoot, 'scripts/create-ecosystem.mjs')
  const fixtureArgs = [
    createScript,
    '--name',
    'auth-domain-guard-fixture',
    '--dry-run',
    '--auth-domain',
    'app.example.com',
  ]
  const missingDecision = spawnSync(process.execPath, fixtureArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  })
  assert.notEqual(missingDecision.status, 0)
  assert.match(
    `${missingDecision.stdout}${missingDecision.stderr}`,
    /needs an explicit Firebase Auth authorized-domain decision/
  )

  const explicitNo = spawnSync(
    process.execPath,
    [...fixtureArgs, '--no-sync-auth-domain'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: false,
    }
  )
  assert.equal(explicitNo.status, 0)
  assert.match(explicitNo.stdout, /would leave Firebase Auth domains unchanged/)
  assert.match(explicitNo.stdout, /app\.example\.com/)
  assert.match(explicitNo.stdout, /auth-domain-guard-fixture\.web\.app/)

  const explicitSite = spawnSync(
    process.execPath,
    [
      ...fixtureArgs,
      '--firebase-site',
      'custom-hosting-site',
      '--no-sync-auth-domain',
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: false,
    }
  )
  assert.equal(explicitSite.status, 0)
  assert.match(explicitSite.stdout, /custom-hosting-site\.web\.app/)

  const invalidHostname = spawnSync(
    process.execPath,
    [
      createScript,
      '--name',
      'auth-domain-guard-fixture',
      '--dry-run',
      '--auth-domain',
      'https://app.example.com',
      '--no-sync-auth-domain',
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: false,
    }
  )
  assert.notEqual(invalidHostname.status, 0)
  assert.match(
    `${invalidHostname.stdout}${invalidHostname.stderr}`,
    /without protocol, path or port/
  )

  const missingHostname = spawnSync(
    process.execPath,
    [
      createScript,
      '--name',
      'auth-domain-guard-fixture',
      '--dry-run',
      '--sync-auth-domain',
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: false,
    }
  )
  assert.notEqual(missingHostname.status, 0)
  assert.match(
    `${missingHostname.stdout}${missingHostname.stderr}`,
    /require --auth-domain <hostname>/
  )
  assert.match(
    interlakenPackage.scripts?.deploy || '',
    /--auth-domains interlaken-essen\.misebox\.app,interlaken-essen\.web\.app/
  )
  assert.match(
    interlakenPackage.scripts?.['deploy:hosting'] || '',
    /--auth-domains interlaken-essen\.misebox\.app,interlaken-essen\.web\.app/
  )
}

async function assertRulesFragmentScope(repoRoot) {
  const templateSource = await readFile(
    path.join(
      repoRoot,
      'packages/ecosystem/fireux-werkbox/src/config/firebase/firestore.template.rules'
    ),
    'utf8'
  )
  const template = await expandFirestoreRulesTemplate(templateSource)
  const ownerMarker = '    // @fireux-core-rules owner'
  const tabIndented = template.replace(
    ownerMarker,
    '\t// @fireux-core-rules owner'
  )
  assert.notEqual(
    tabIndented,
    template,
    'Werkbox Rules must retain the owner marker fixture.'
  )
  await assert.rejects(
    () => composeFirestoreRules(tabIndented),
    /fragment owner must use 4 spaces/,
    'Core Rules composition must reject tab-indented fragment markers.'
  )

  const functionNested = template.replace(
    ownerMarker,
    `    function fragmentFixture() {\n${ownerMarker}\n    }`
  )
  await assert.rejects(
    () => composeFirestoreRules(functionNested),
    /fragment owner must be in the database lexical scope/,
    'Core Rules composition must reject fragments nested in another block.'
  )

  const reboundDatabase = template.replace(
    ownerMarker,
    '  }\n' +
      '  match  /databases/{database}/documents {\n' +
      '    function isAuthenticated() {\n' +
      '      return true;\n' +
      '    }\n\n' +
      ownerMarker
  )
  await assert.rejects(
    () => composeFirestoreRules(reboundDatabase),
    /must remain inside the service and database frames opened by the Core open fragment/,
    'Fragments must not rebind to a lookalike database wrapper.'
  )

  const joinMarker = '        // @fireux-core-rules join-validator'
  const reboundJoin = template.replace(
    joinMarker,
    '      }\n' + '      match  /join-requests/{userId} {\n' + joinMarker
  )
  await assert.rejects(
    () => composeFirestoreRules(reboundJoin),
    /must retain one original contracted match \/join-requests\/\{userId\} frame/,
    'A first-use contracted frame must remain structurally unique.'
  )

  const membershipMarker = '      // @fireux-core-rules membership-block'
  const reboundApp = template.replace(
    membershipMarker,
    '    }\n' + '    match  /apps/{appId} {\n' + membershipMarker
  )
  await assert.rejects(
    () => composeFirestoreRules(reboundApp),
    /must remain inside the original contracted match \/apps\/\{appId\} frame/,
    'A later fragment must retain its previously contracted App frame.'
  )

  const appMatch = '    match /apps/{appId} {'
  const aliasedApp = template.replace(
    appMatch,
    '    match /apps/{shadowAppId} {\n' +
      '      allow get: if request.auth != null;\n' +
      '    }\n\n' +
      appMatch
  )
  await assert.rejects(
    () => composeFirestoreRules(aliasedApp),
    /must retain one wildcard-normalized match \/databases\/\{\*\}\/documents\/apps\/\{\*\} frame/,
    'Wildcard aliases must not create an overlapping contracted App frame.'
  )

  const overlayMarker = '        // @fireux-core-rules overlay-validator'
  const overlayMatch = '      match /{profileCollection}/{userId} {'
  const appScopedOverlay = template
    .replace(`${overlayMarker}\n`, '')
    .replace(overlayMatch, `${overlayMarker}\n${overlayMatch}`)
  assert.notEqual(
    appScopedOverlay,
    template,
    'Werkbox Rules must retain the profile-overlay marker fixture.'
  )
  await assert.rejects(
    () => composeFirestoreRules(appScopedOverlay),
    /fragment overlay-validator must be in the app-profile-overlay lexical scope/,
    'Core Rules composition must reject a nested fragment at its parent scope.'
  )

  const authFunction = '    function isAuthenticated() {'
  const authBoundary = `    }\n\n${ownerMarker}`
  const inaccessibleHelper = template
    .replace(
      authFunction,
      '    match /helper-fixture/{fixtureId} {\n' +
        '      function isAuthenticated() {'
    )
    .replace(authBoundary, `      }\n    }\n\n${ownerMarker}`)
  assert.notEqual(
    inaccessibleHelper,
    template,
    'Werkbox Rules must retain the authentication helper fixture.'
  )
  await assert.rejects(
    () => composeFirestoreRules(inaccessibleHelper),
    /fragment owner requires accessible function isAuthenticated\(\)/,
    'Core Rules dependencies must resolve from an accessible ancestor scope.'
  )

  const rootHelper = template
    .replace(
      '// @fireux-core-rules open',
      'function isAuthenticated() {\n' +
        '  return true;\n' +
        '}\n\n' +
        '// @fireux-core-rules open'
    )
    .replace(
      '    function isAuthenticated() {',
      '    function renamedIsAuthenticated() {'
    )
  await assert.rejects(
    () => composeFirestoreRules(rootHelper),
    /root block must be service cloud\.firestore/,
    'Root-level functions must not satisfy Rules fragment dependencies.'
  )

  const knownAppDeclaration = '    function isKnownApp(appId) {'
  const midDeclaration = template
    .replace(`${ownerMarker}\n`, '')
    .replace(
      knownAppDeclaration,
      `    function isKnownApp(appId)\n${ownerMarker}\n    {`
    )
  await assert.rejects(
    () => composeFirestoreRules(midDeclaration),
    /fragment owner must start at a declaration boundary/,
    'Rules fragments must not split a declaration from its block.'
  )
}

async function assertRulesSourceConsumers(repoRoot) {
  const packageJson = JSON.parse(
    await readFile(path.join(repoRoot, 'package.json'), 'utf8')
  )
  assert.equal(
    packageJson.scripts?.['firebase:rules:render'],
    'node scripts/render-firestore-rules.mjs',
    'Composed Rules must expose one supported read-only drift command.'
  )

  const renderer = await readFile(
    path.join(repoRoot, 'scripts/render-firestore-rules.mjs'),
    'utf8'
  )
  for (const token of [
    'No action defaults to --check.',
    'if (args.write)',
    'await writeFile(target.artifactPath, target.content',
    'assertAllFirestoreRulesArtifactsCurrent()',
  ]) {
    assert.ok(renderer.includes(token), `Rules renderer must retain ${token}.`)
  }

  const consumers = [
    ['Misebox deploy', 'scripts/deploy-misebox-firestore-rules.mjs', 'misebox'],
    ['Werkbox deploy', 'scripts/deploy-werkbox-firestore-rules.mjs', 'werkbox'],
    [
      'Werkbox migration',
      'scripts/migrate-werkbox-firestore-contract.mjs',
      'werkbox',
    ],
  ]

  for (const [label, relativePath, ecosystem] of consumers) {
    const source = await readFile(path.join(repoRoot, relativePath), 'utf8')
    assert.ok(
      source.includes(`assertFirestoreRulesArtifactCurrent('${ecosystem}')`),
      `${label} must consume the verified composed Rules artifact.`
    )
  }
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
  for (const token of [
    'existing Place exact read is available without authentication',
    'missing Place exact read remains denied',
    'Place collection list remains denied',
    'browser cannot create a Place',
  ]) {
    assert.ok(
      misebox.includes(token),
      `Misebox Rules harness must retain ${token}.`
    )
  }

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
      'const ruleset = await api(`projects/${PROJECT_ID}/rulesets`',
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
      'const ruleset = await api(`projects/${PROJECT_ID}/rulesets`',
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
    'App credential-bearing HTTPS URL denied',
    'App name remains control-owned',
    'Richies isolated from Werkbox member',
    'unknown root defaults to deny',
    'writeProtectedJsonArtifact',
  ]) {
    assert.ok(
      source.includes(token),
      `Werkbox Rules harness must retain ${token}.`
    )
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
    'match /places/{placeId}',
    'allow get: if resource != null;',
    'match /companies/{document=**}',
    'match /products/{document=**}',
    'match /blogs/{document=**}',
    'match /{document=**}',
    'allow get, list, create, update, delete: if false;',
  ]) {
    assert.ok(rules.includes(token), `Werkbox Rules must retain ${token}.`)
  }
  assert.match(
    rules,
    /match \/places\/\{placeId\}\s*\{[\s\S]*?allow get:\s*if resource != null;[\s\S]*?allow list, create, update, delete:\s*if false;[\s\S]*?\}/,
    'Werkbox Place Rules must allow exact reads while denying list and browser writes.'
  )
  assert.doesNotMatch(
    rules,
    /request\.auth\.uid\s*==\s*['"][A-Za-z0-9_-]{20,}['"]/
  )

  const quarantine = await readFile(
    path.join(repoRoot, 'scripts/firebase/werkbox/firestore-quarantine.rules'),
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
    'probeTrustedServerApis()',
    'https://richies-reinigung.web.app',
    'captureAuthorityInventory()',
    'assertInventoryTransition(',
    'finalizeMigrationMarker({',
    'productionStillQuarantined: true',
    'candidateRulesPromoted: false',
  ]) {
    assert.ok(
      migrator.includes(token),
      `Werkbox migrator must retain ${token}.`
    )
  }
  const applySlice = branchSource(migrator, '  } else {', '} finally {')
  assertOrderedTokens(
    applySlice,
    [
      'const preProbe = await probeTrustedServerApis()',
      'const quarantineEvidence = await assertProductionQuarantine(',
      'const backupArtifact = await writeProtectedJsonArtifact({',
      'await applyTransaction(dataOperations)',
      'const verification = await verifyResults(dataOperations)',
      'assertInventoryTransition(preInventory, postInventory, dataOperations)',
      'const postProbe = await probeTrustedServerApis()',
      'await finalizeMigrationMarker({',
      'const markerVerification = await verifyResults([',
    ],
    'Werkbox migration apply'
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

export async function assertSnapshotSyncSafety(repoRoot) {
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
  assert.doesNotMatch(
    source,
    /loadCollection\(db,\s*['"]companies['"]\)/,
    'The snapshot sync must not load or mutate canonical stamps-only Company roots.'
  )
  assert.doesNotMatch(
    source,
    /company place public card snapshot/i,
    'Company display truth must remain a server-side Company/Place projection.'
  )

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

export async function assertUserIdentityPlannerReadOnly(
  repoRoot = process.cwd()
) {
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
    'summarizeAuthOnlyIdentities',
    'plausibleIncompleteRegistration',
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

  const executor = await readFile(
    path.join(
      repoRoot,
      'scripts/apply-misebox-user-identity-reconciliation.mjs'
    ),
    'utf8'
  )
  for (const token of [
    "const PROJECT_ID = 'misebox-78f9c'",
    "const DATABASE_ID = 'misebox'",
    "const APP_ID = 'misebox-app'",
    'Apply requires --confirm ${TARGET_CONFIRMATION}.',
    'Apply requires --confirm-plan ${plan.finalPlanSha256}.',
    'writeProtectedJsonArtifact',
    'assertCredentialFreeBackup',
    'readStoragePreimage',
    'await applyFirestoreTransaction',
    'transaction.getAll',
    'Plan changed after backup; transaction aborted.',
    'await applyStorageDeletes',
    'await verifyResults',
    'await deleteApp(adminApp)',
  ]) {
    assert.ok(
      executor.includes(token),
      `User identity executor must retain ${token}.`
    )
  }
  const backupIndex = executor.indexOf(
    'const backupArtifact = await writeProtectedJsonArtifact'
  )
  const firestoreIndex = executor.indexOf('await applyFirestoreTransaction')
  const storageIndex = executor.indexOf('await applyStorageDeletes')
  const verificationIndex = executor.indexOf('await verifyResults')
  assert.ok(
    backupIndex >= 0,
    'User identity apply requires a protected preimage.'
  )
  assert.ok(
    backupIndex < firestoreIndex &&
      firestoreIndex < storageIndex &&
      storageIndex < verificationIndex,
    'User identity apply must back up, mutate, and verify in guarded order.'
  )
}
