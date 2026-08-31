#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-21
// usage_note: compile and adversarially test Werkbox Rules, or perform a guarded future release after audited migration evidence exists.
// Concurrent edit — 2026-07-21 15:14 CEST — Cleanbox-to-Werkbox migration: lock evidence-gated promotion and credential-bearing URL regression coverage.
// Concurrent edit — 2026-07-21 15:27 CEST — Shared Firestore Rules pass: require the verified Core-composed candidate artifact before release work.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: adversarially test optional bounded public biography writes.

import process from 'node:process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { assertFirestoreRulesArtifactCurrent } from './_lib/firestore-rules-source.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const PROJECT_ID = 'cleanbox-f15bc'
const PRODUCTION_DATABASE_ID = 'cleanbox'
const SIMULATION_DATABASE_ID = 'cleanbox-simulation'
const ECOSYSTEM_ID = 'cleanbox'
const APP_IDS = Object.freeze(['cleanbox-app', 'richies-reinigung'])
const MIGRATION_MARKER_PATH =
  'security-migrations/werkbox-firestore-rules-v1'
const SERVER_API_HOSTS = Object.freeze([
  'https://cleanbox.web.app',
  'https://richies-reinigung.web.app',
])
const SERVER_API_PROBES = [
  { baseUrl: 'https://cleanbox.web.app', method: 'GET', path: '/api/internal/jobs' },
  { baseUrl: 'https://cleanbox.web.app', method: 'POST', path: '/api/places/ensure' },
  { baseUrl: 'https://cleanbox.web.app', method: 'POST', path: '/api/companies/materialize' },
  { baseUrl: 'https://cleanbox.web.app', method: 'PATCH', path: '/api/internal/profiles/professional/structured' },
  ...SERVER_API_HOSTS.flatMap((baseUrl) => [
    { baseUrl, method: 'POST', path: '/api/internal/app/membership' },
    { baseUrl, method: 'POST', path: '/api/internal/user/account' },
    { baseUrl, method: 'POST', path: '/api/internal/user/handle' },
    { baseUrl, method: 'GET', path: '/api/internal/app/people' },
  ]),
]
const QUARANTINE_RULES_PATH = new URL(
  './firebase/werkbox/firestore-quarantine.rules',
  import.meta.url
)
const API = 'https://firebaserules.googleapis.com/v1'
const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(`
Compile and adversarially test Werkbox Firestore Security Rules.

Usage:
  node scripts/deploy-werkbox-firestore-rules.mjs
  node scripts/deploy-werkbox-firestore-rules.mjs --check
  node scripts/deploy-werkbox-firestore-rules.mjs --test-simulation
  node scripts/deploy-werkbox-firestore-rules.mjs --deploy-simulation --confirm <value>
  node scripts/deploy-werkbox-firestore-rules.mjs --quarantine-production --confirm <value>
  node scripts/deploy-werkbox-firestore-rules.mjs --promote-production --confirm <value>
  node scripts/deploy-werkbox-firestore-rules.mjs --rollback <database-id> <ruleset-name> --confirm <value>

No action defaults to --check. Check compiles the candidate source and runs
deterministic adversarial Rules tests only; it never reads or writes Firestore
data and never changes a Rules release. Warnings block.

The candidate may be staged and tested in an already-provisioned simulation
database before the data migration. The production sequence is deliberately
one-way: deploy trusted APIs, stage the candidate, quarantine production with
the tracked deny-all source, run the exact data migration, then promote only
when the Admin-owned ${MIGRATION_MARKER_PATH} binds the migration, live API
probes, quarantine source, and this exact candidate source. This command never
creates a simulation database. Every release mutation first writes a mode-0600
backup under /private/tmp. Simulation rollback accepts either reviewed source;
production rollback is fail-closed to the deny-all quarantine source, while the
candidate can reach production only through --promote-production.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const { content } = await assertFirestoreRulesArtifactCurrent('werkbox')
const quarantineContent = await readFile(QUARANTINE_RULES_PATH, 'utf8')
assertPinnedSource(content)
assertQuarantineSource(quarantineContent)
const source = { files: [{ name: 'firestore.rules', content }] }
const quarantineSource = {
  files: [{ name: 'firestore.rules', content: quarantineContent }],
}
const sourceSha256 = sha256(content)
const quarantineSha256 = sha256(quarantineContent)
if (args.rollback) {
  assertConfirmation(
    `rollback:${PROJECT_ID}:${args.rollback.databaseId}:${args.rollback.rulesetName}`
  )
}
const requestedReleaseAction =
  args.deploySimulation ? 'deploy-simulation'
  : args.quarantineProduction ? 'quarantine-production'
  : args.promoteProduction ? 'promote-production'
  : ''
const requestedReleaseDatabaseId =
  args.deploySimulation ? SIMULATION_DATABASE_ID
  : args.quarantineProduction || args.promoteProduction
    ? PRODUCTION_DATABASE_ID
  : ''
if (requestedReleaseAction) {
  const requestedSourceSha256 = args.quarantineProduction
    ? quarantineSha256
    : sourceSha256
  assertConfirmation(
    `${requestedReleaseAction}:${PROJECT_ID}:${requestedReleaseDatabaseId}:${requestedSourceSha256}`
  )
}

const resolved = await resolveFirebaseAdminCredential({
  args,
  scope: 'werkbox',
  projectId: PROJECT_ID,
})
const access = await resolved.credential.getAccessToken()
const accessToken = String(access?.access_token || '').trim()
if (!accessToken) throw new Error('Firebase credential returned no access token.')

if (args.rollback) {
  const rollbackRuleset = await getRuleset(args.rollback.rulesetName)
  const rollbackContent = rulesContent(rollbackRuleset)
  if (!rollbackContent) throw new Error('Rollback ruleset has no firestore.rules.')
  const rollbackSha256 = sha256(rollbackContent)
  if (
    args.rollback.databaseId === PRODUCTION_DATABASE_ID &&
    rollbackSha256 === sourceSha256
  ) {
    throw new Error(
      'Production candidate release requires --promote-production; rollback may only restore the tracked deny-all quarantine source.'
    )
  }
  let rollbackSecurity
  if (rollbackSha256 === sourceSha256) {
    rollbackSecurity = await executeSecurityTests(
      rollbackRuleset.name,
      false,
      args.rollback.databaseId
    )
  } else if (rollbackSha256 === quarantineSha256) {
    rollbackSecurity = await executeQuarantineTests(
      rollbackRuleset.name,
      false,
      args.rollback.databaseId
    )
  } else {
    throw new Error(
      'Rollback is restricted to the tracked candidate or deny-all quarantine source.'
    )
  }
  const releaseBackup = await backupReleases([args.rollback.databaseId])
  const release = await pointRelease(
    args.rollback.databaseId,
    rollbackRuleset.name
  )
  await verifyRelease(
    args.rollback.databaseId,
    rollbackRuleset.name,
    rollbackSha256
  )
  await printJson({
    mode: 'rollback',
    projectId: PROJECT_ID,
    databaseId: args.rollback.databaseId,
    credentialSource: resolved.source,
    rulesetName: rollbackRuleset.name,
    rulesetSourceSha256: rollbackSha256,
    release,
    releaseBackup,
    testsPassed: rollbackSecurity.tests.length,
  })
  process.exit(0)
}

const compilation = await compileSource(source, 'Candidate Rules compilation')
const security = await executeSecurityTests(
  `projects/${PROJECT_ID}`,
  true,
  PRODUCTION_DATABASE_ID
)
const quarantineCompilation = await compileSource(
  quarantineSource,
  'Quarantine Rules compilation'
)
const quarantineSecurity = await executeQuarantineTests(
  `projects/${PROJECT_ID}`,
  true,
  PRODUCTION_DATABASE_ID
)

if (args.check) {
  await printJson({
    mode: 'check',
    projectId: PROJECT_ID,
    databaseId: PRODUCTION_DATABASE_ID,
    credentialSource: resolved.source,
    sourceSha256,
    quarantineSha256,
    issues: [
      ...compilation.issues,
      ...security.issues,
      ...quarantineCompilation.issues,
      ...quarantineSecurity.issues,
    ],
    testsPassed: security.tests.length + quarantineSecurity.tests.length,
    testEvidenceSha256: sha256(JSON.stringify(security.tests)),
    quarantineTestEvidenceSha256: sha256(
      JSON.stringify(quarantineSecurity.tests)
    ),
  })
  process.exit(0)
}

if (args.testSimulation) {
  const simulation = await getRelease(SIMULATION_DATABASE_ID)
  const ruleset = await getRuleset(simulation.rulesetName)
  const simulationSecurity = await executeSecurityTests(
    ruleset.name,
    false,
    SIMULATION_DATABASE_ID
  )
  await printJson({
    mode: 'test-simulation',
    projectId: PROJECT_ID,
    databaseId: SIMULATION_DATABASE_ID,
    credentialSource: resolved.source,
    sourceSha256,
    rulesetName: ruleset.name,
    rulesetSourceSha256: sha256(rulesContent(ruleset)),
    issues: simulationSecurity.issues,
    testsPassed: simulationSecurity.tests.length,
    testEvidenceSha256: sha256(JSON.stringify(simulationSecurity.tests)),
  })
  process.exit(0)
}

if (args.deploySimulation) {
  // A missing simulation database fails at this backup; this script never
  // provisions databases. The protected backup precedes ruleset creation.
  const releaseBackup = await backupReleases([SIMULATION_DATABASE_ID])
  const ruleset = await api(`projects/${PROJECT_ID}/rulesets`, {
    method: 'POST',
    body: { source },
  })
  const release = await pointRelease(SIMULATION_DATABASE_ID, ruleset.name)
  await verifyRelease(SIMULATION_DATABASE_ID, ruleset.name, sourceSha256)
  await printJson({
    mode: 'deploy-simulation',
    projectId: PROJECT_ID,
    databaseId: SIMULATION_DATABASE_ID,
    credentialSource: resolved.source,
    sourceSha256,
    rulesetName: ruleset.name,
    release,
    releaseBackup,
    testsPassed: security.tests.length,
  })
  process.exit(0)
}

if (args.quarantineProduction) {
  const stagedCandidate = await assertSimulationCandidateReady(sourceSha256)
  const releaseBackup = await backupReleases([PRODUCTION_DATABASE_ID])
  const ruleset = await api(`projects/${PROJECT_ID}/rulesets`, {
    method: 'POST',
    body: { source: quarantineSource },
  })
  const release = await pointRelease(PRODUCTION_DATABASE_ID, ruleset.name)
  await verifyRelease(
    PRODUCTION_DATABASE_ID,
    ruleset.name,
    quarantineSha256
  )
  await printJson({
    mode: 'quarantine-production',
    projectId: PROJECT_ID,
    databaseId: PRODUCTION_DATABASE_ID,
    credentialSource: resolved.source,
    quarantineSha256,
    rulesetName: ruleset.name,
    release,
    releaseBackup,
    testsPassed:
      quarantineSecurity.tests.length + stagedCandidate.testsPassed,
    nextGate:
      'Keep production quarantined; run the exact reviewed data migration, then promote the staged candidate.',
  })
  process.exit(0)
}

if (args.promoteProduction) {
  const migrationEvidence = await assertReleaseEvidence({
    sourceSha256,
    quarantineSha256,
  })
  await assertLiveServerEvidence(migrationEvidence)
  await assertReleaseSourceHash(PRODUCTION_DATABASE_ID, quarantineSha256)
  const simulation = await getRelease(SIMULATION_DATABASE_ID)
  const ruleset = await getRuleset(simulation.rulesetName)
  if (sha256(rulesContent(ruleset)) !== sourceSha256) {
    throw new Error(
      'Simulation does not point to the current candidate source. Deploy and test it again.'
    )
  }
  const promotionSecurity = await executeSecurityTests(
    ruleset.name,
    false,
    PRODUCTION_DATABASE_ID
  )
  const releaseBackup = await backupReleases([PRODUCTION_DATABASE_ID])
  const confirmedEvidence = await assertReleaseEvidence({
    sourceSha256,
    quarantineSha256,
  })
  if (stableJson(confirmedEvidence) !== stableJson(migrationEvidence)) {
    throw new Error('Migration/server-cutover evidence changed during verification.')
  }
  await assertLiveServerEvidence(confirmedEvidence)
  await assertReleaseSourceHash(PRODUCTION_DATABASE_ID, quarantineSha256)
  const release = await pointRelease(PRODUCTION_DATABASE_ID, ruleset.name)
  await verifyRelease(PRODUCTION_DATABASE_ID, ruleset.name, sourceSha256)
  await printJson({
    mode: 'promote-production',
    projectId: PROJECT_ID,
    databaseId: PRODUCTION_DATABASE_ID,
    credentialSource: resolved.source,
    sourceSha256,
    rulesetName: ruleset.name,
    release,
    releaseBackup,
    migrationEvidenceSha256: sha256(stableJson(confirmedEvidence)),
    testsPassed: promotionSecurity.tests.length,
  })
}

async function assertSimulationCandidateReady(expectedSha256) {
  const simulation = await getRelease(SIMULATION_DATABASE_ID)
  const ruleset = await getRuleset(simulation.rulesetName)
  if (sha256(rulesContent(ruleset)) !== expectedSha256) {
    throw new Error(
      'Simulation does not point to the current candidate source. Stage and test it before production quarantine.'
    )
  }
  const security = await executeSecurityTests(
    ruleset.name,
    false,
    SIMULATION_DATABASE_ID
  )
  return { rulesetName: ruleset.name, testsPassed: security.tests.length }
}

function parseArgs(values) {
  const parsed = {
    help: false,
    check: false,
    testSimulation: false,
    deploySimulation: false,
    quarantineProduction: false,
    promoteProduction: false,
    rollback: null,
    confirm: '',
  }
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (value === '--help') parsed.help = true
    else if (value === '--check') parsed.check = true
    else if (value === '--test-simulation') parsed.testSimulation = true
    else if (value === '--deploy-simulation') parsed.deploySimulation = true
    else if (value === '--quarantine-production') {
      parsed.quarantineProduction = true
    }
    else if (value === '--promote-production') parsed.promoteProduction = true
    else if (value === '--confirm') {
      parsed.confirm = String(values[index + 1] || '')
      index += 1
      if (!parsed.confirm) throw new Error('--confirm requires a value.')
    } else if (value === '--service-account') {
      parsed['service-account'] = values[index + 1]
      index += 1
      if (!parsed['service-account']) {
        throw new Error('--service-account requires a path.')
      }
    } else if (value === '--rollback') {
      const databaseId = values[index + 1]
      const rulesetName = values[index + 2]
      index += 2
      if (![SIMULATION_DATABASE_ID, PRODUCTION_DATABASE_ID].includes(databaseId)) {
        throw new Error(
          '--rollback database must be cleanbox-simulation or cleanbox.'
        )
      }
      if (!rulesetName?.startsWith(`projects/${PROJECT_ID}/rulesets/`)) {
        throw new Error('--rollback requires a full pinned-project ruleset name.')
      }
      parsed.rollback = { databaseId, rulesetName }
    } else {
      throw new Error(`Unknown argument: ${value}`)
    }
  }

  const actions = [
    parsed.check,
    parsed.testSimulation,
    parsed.deploySimulation,
    parsed.quarantineProduction,
    parsed.promoteProduction,
    Boolean(parsed.rollback),
  ].filter(Boolean)
  if (!parsed.help && actions.length > 1) {
    throw new Error('Choose at most one action. Use --help for usage.')
  }
  if (!parsed.help && actions.length === 0) parsed.check = true
  return parsed
}

function assertPinnedSource(value) {
  for (const token of [
    "database in ['cleanbox', 'cleanbox-simulation']",
    "appId in ['cleanbox-app', 'richies-reinigung']",
    'match /ecosystems/{ecosystemId}',
    'match /jobs/{document=**}',
    'match /places/{placeId}',
    'allow get: if resource != null;',
    'match /companies/{document=**}',
    'match /products/{document=**}',
    'match /blogs/{document=**}',
    'match /{document=**}',
  ]) {
    if (!value.includes(token)) throw new Error(`Rules lost pinned token: ${token}`)
  }
  if (/request\.auth\.uid\s*==\s*['"][A-Za-z0-9_-]{20,}['"]/.test(value)) {
    throw new Error('Werkbox Rules must not hardcode a developer uid.')
  }
}

function assertQuarantineSource(value) {
  const allowStatements = [...value.matchAll(/allow\s+([^:]+):\s*if\s+([^;]+);/g)]
    .map((match) => ({
      permissions: match[1].replaceAll(/\s+/g, ' ').trim(),
      condition: match[2].replaceAll(/\s+/g, ' ').trim(),
    }))
  if (
    allowStatements.length !== 1 ||
    allowStatements[0].permissions !== 'read, write' ||
    allowStatements[0].condition !== 'false'
  ) {
    throw new Error(
      'Quarantine Rules must contain exactly one unconditional read/write denial.'
    )
  }
}

function assertConfirmation(expected) {
  if (args.confirm !== expected) {
    throw new Error(`Release action requires --confirm ${expected}`)
  }
}

async function compileSource(rulesSource, label) {
  const result = await api(`projects/${PROJECT_ID}:test`, {
    method: 'POST',
    body: { source: rulesSource, testSuite: { testCases: [] } },
  })
  assertNoBlockingIssues(result.issues || [], label)
  return { issues: result.issues || [] }
}

async function executeSecurityTests(testTarget, includeSource, databaseId) {
  const tests = buildSecurityTests(databaseId)
  const batches = Array.from(
    { length: Math.ceil(tests.length / 25) },
    (_, index) => tests.slice(index * 25, (index + 1) * 25)
  )
  const responses = await Promise.all(
    batches.map((batch) =>
      api(`${testTarget}:test`, {
        method: 'POST',
        body: {
          ...(includeSource ? { source } : {}),
          testSuite: { testCases: batch.map(({ testCase }) => testCase) },
        },
      })
    )
  )
  const issues = responses.flatMap((result) => result.issues || [])
  assertNoBlockingIssues(issues, 'Rules security tests')
  const rawResults = responses.flatMap((result) => result.testResults || [])
  const results = tests.map((test, index) => ({
    name: test.name,
    expectation: test.testCase.expectation,
    state: rawResults[index]?.state || 'MISSING',
    debugMessages: rawResults[index]?.debugMessages || [],
  }))
  const failures = results.filter((result) => result.state !== 'SUCCESS')
  if (failures.length) {
    throw new Error(`Security tests failed:\n${JSON.stringify(failures, null, 2)}`)
  }
  return { issues, tests: results }
}

async function executeQuarantineTests(testTarget, includeSource, databaseId) {
  const ownerId = 'rules-owner'
  const writeTime = '2026-07-21T10:00:00Z'
  const tests = [
    read(
      'quarantine denies unauthenticated read',
      'DENY',
      databaseId,
      'users/rules-owner',
      '',
      {}
    ),
    read(
      'quarantine denies owner read',
      'DENY',
      databaseId,
      'users/rules-owner',
      ownerId,
      {}
    ),
    list(
      'quarantine denies authenticated list',
      'DENY',
      databaseId,
      'jobs',
      ownerId
    ),
    create(
      'quarantine denies authenticated create',
      'DENY',
      databaseId,
      'jobs/probe',
      ownerId,
      {},
      writeTime
    ),
    update(
      'quarantine denies authenticated update',
      'DENY',
      databaseId,
      'users/rules-owner',
      ownerId,
      {},
      {},
      writeTime
    ),
    remove(
      'quarantine denies authenticated delete',
      'DENY',
      databaseId,
      'users/rules-owner',
      ownerId,
      {}
    ),
  ]
  const result = await api(`${testTarget}:test`, {
    method: 'POST',
    body: {
      ...(includeSource ? { source: quarantineSource } : {}),
      testSuite: { testCases: tests.map(({ testCase }) => testCase) },
    },
  })
  const issues = result.issues || []
  assertNoBlockingIssues(issues, 'Quarantine Rules security tests')
  const rawResults = result.testResults || []
  const results = tests.map((test, index) => ({
    name: test.name,
    expectation: test.testCase.expectation,
    state: rawResults[index]?.state || 'MISSING',
    debugMessages: rawResults[index]?.debugMessages || [],
  }))
  const failures = results.filter((entry) => entry.state !== 'SUCCESS')
  if (failures.length) {
    throw new Error(
      `Quarantine security tests failed:\n${JSON.stringify(failures, null, 2)}`
    )
  }
  return { issues, tests: results }
}

function buildSecurityTests(databaseId) {
  const ownerId = 'rules-owner'
  const adminId = 'rules-admin'
  const memberId = 'rules-member'
  const strangerId = 'rules-stranger'
  const writeTime = '2026-07-21T10:00:00Z'
  const updateTime = '2026-07-21T10:05:00Z'
  const created = (by = ownerId, appId = 'cleanbox-app') => ({
    at: writeTime,
    by,
    app_id: appId,
  })
  const updated = (by = ownerId, at = writeTime) => ({ at, by })
  const user = {
    display_name: 'Rules Owner',
    avatar: 'https://example.invalid/avatar.png',
    handle: 'rules-owner',
  }
  const userWithBio = {
    ...user,
    bio: 'I build useful things.',
  }
  const privateAccount = {
    email: 'owner@example.invalid',
    preferences: {
      language: 'en',
      theme: 'system',
      email_security_alerts: true,
      share_usage_analytics: false,
    },
    terms: { version: '', accepted_at: null },
    created: created(),
    updated: updated(),
  }
  const notification = {
    message: 'Security probe',
    scope: 'app',
    created: { at: writeTime, app_id: 'cleanbox-app' },
    read: false,
  }
  const ecosystemNotification = {
    ...notification,
    scope: 'ecosystem',
    created: { at: writeTime, app_id: '' },
  }
  const app = {
    project_id: 'werkbox',
    ecosystem_id: 'cleanbox',
    database_id: 'cleanbox',
    slug: 'cleanbox-app',
    status: 'active',
    app_name: 'Werkbox',
    app_short_name: 'Werkbox',
    role: 'global',
    self_join_enabled: true,
    derived: { user_count: 2 },
    created: created('migration-admin'),
    updated: updated('migration-admin'),
  }
  const richiesApp = {
    ...app,
    slug: 'richies-reinigung',
    app_name: 'Richies Reinigung',
    app_short_name: 'Richies',
    role: 'tenant',
    self_join_enabled: false,
    created: created('migration-admin', 'richies-reinigung'),
  }
  const membership = (role = 'user', appId = 'cleanbox-app') => ({
    role,
    subscription: 'free',
    onboarding_status: 'pending',
    created: created('migration-admin', appId),
    updated: updated('migration-admin'),
  })
  const sparseMembership = {
    role: 'user',
    subscription: 'free',
    onboarding_status: 'pending',
    created: created('migration-admin', 'cleanbox-app'),
    updated: updated('migration-admin'),
  }
  const relatedMembership = {
    ...sparseMembership,
    kitchens: ['kitchen-a'],
    primary_kitchen: 'kitchen-a',
  }
  const overlay = {
    created: created(ownerId),
    updated: updated(),
  }
  const joinRequest = {
    user_id: '__rules_list_probe__',
    created: created(ownerId),
  }
  const agent = {
    title: 'Placement agent',
    summary: 'Summary',
    agent_bio: 'Bio',
    agent_image: 'https://example.invalid/agent.png',
    agent_placement_types: ['permanent'],
    agent_coverage_areas: ['Bern'],
    agent_contact_email: 'agent@example.invalid',
    agent_contact_phone: '+41 00 000 00 00',
    agent_website_url: 'https://example.invalid',
    subtitle: 'Jobs',
    tagline: 'Practical work',
    tags: ['cleaning'],
    created: created(),
    updated: updated(),
  }
  const professional = {
    title: 'Cleaner',
    subtitle: 'Professional',
    tagline: 'Reliable work',
    summary: 'Summary',
    bio: 'Bio',
    image: 'https://example.invalid/professional.png',
    positions: ['Cleaner'],
    tags: ['cleaning'],
    relevant_experience: [],
    other_experience: [],
    languages: [],
    certifications: [],
    education: [],
    volunteering: [],
    projects: [],
    created: created(),
    updated: updated(),
  }
  const stamp = { at: updateTime, by: ownerId }
  const adminStamp = { at: updateTime, by: adminId }
  const memberMocks = membershipMocks(databaseId, 'cleanbox-app', ownerId, 'user')
  const richiesMemberMocks = membershipMocks(
    databaseId,
    'richies-reinigung',
    ownerId,
    'user'
  )
  const adminMocks = membershipMocks(databaseId, 'cleanbox-app', adminId, 'admin')
  const regularMocks = membershipMocks(databaseId, 'cleanbox-app', memberId, 'user')

  const tests = [
    read('authenticated canonical User get', 'ALLOW', databaseId, `users/${ownerId}`, ownerId, user),
    read('raw User identity denied to another user', 'DENY', databaseId, `users/${ownerId}`, strangerId, user),
    read('anonymous-provider User get denied', 'DENY', databaseId, `users/${ownerId}`, ownerId, user, [], 'anonymous'),
    read('unauthenticated User get denied', 'DENY', databaseId, `users/${ownerId}`, '', user),
    list('raw User list denied', 'DENY', databaseId, 'users', ownerId),
    update('owner safe User update', 'ALLOW', databaseId, `users/${ownerId}`, ownerId, user, { ...user, display_name: 'Updated' }, updateTime),
    update('owner can add a bounded public User bio', 'ALLOW', databaseId, `users/${ownerId}`, ownerId, user, { ...user, bio: 'I build useful things.' }, updateTime),
    update('owner can store a 280-character public User bio', 'ALLOW', databaseId, `users/${ownerId}`, ownerId, user, { ...user, bio: 'b'.repeat(280) }, updateTime),
    update('owner can remove optional public User bio', 'ALLOW', databaseId, `users/${ownerId}`, ownerId, userWithBio, user, updateTime),
    update('owner cannot exceed the public User bio limit', 'DENY', databaseId, `users/${ownerId}`, ownerId, user, { ...user, bio: 'b'.repeat(281) }, updateTime),
    ...[
      ['number', 42],
      ['list', []],
      ['map', {}],
      ['boolean', true],
      ['null', null],
    ].map(([label, bio]) =>
      update(
        `owner cannot store a ${label} public User bio`,
        'DENY',
        databaseId,
        `users/${ownerId}`,
        ownerId,
        user,
        { ...user, bio },
        updateTime
      )
    ),
    update('User app privilege self-assignment denied', 'DENY', databaseId, `users/${ownerId}`, ownerId, user, { ...user, app_ids: ['cleanbox-app', 'richies-reinigung'] }, updateTime),
    update('User profile privilege self-assignment denied', 'DENY', databaseId, `users/${ownerId}`, ownerId, user, { ...user, profiles: [] }, updateTime),
    update('User handle bypass denied', 'DENY', databaseId, `users/${ownerId}`, ownerId, user, { ...user, handle: 'forged-handle' }, updateTime),
    update('User schema pollution denied', 'DENY', databaseId, `users/${ownerId}`, ownerId, user, { ...user, email: 'leak@example.invalid' }, updateTime),
    create('client User create denied', 'DENY', databaseId, `users/${ownerId}`, ownerId, user, writeTime),
    remove('client User delete denied', 'DENY', databaseId, `users/${ownerId}`, ownerId, user),

    read('owner private account get', 'ALLOW', databaseId, `users/${ownerId}/private/account`, ownerId, privateAccount),
    read('private account PII denied to stranger', 'DENY', databaseId, `users/${ownerId}/private/account`, strangerId, privateAccount),
    update('owner preferences update', 'ALLOW', databaseId, `users/${ownerId}/private/account`, ownerId, privateAccount, { ...privateAccount, preferences: { ...privateAccount.preferences, theme: 'dark' }, updated: stamp }, updateTime),
    update('private email update bypass denied', 'DENY', databaseId, `users/${ownerId}/private/account`, ownerId, privateAccount, { ...privateAccount, email: 'changed@example.invalid', updated: stamp }, updateTime),
    update('private terms update bypass denied', 'DENY', databaseId, `users/${ownerId}/private/account`, ownerId, privateAccount, { ...privateAccount, terms: { version: '2', accepted_at: updateTime }, updated: stamp }, updateTime),
    update('private schema pollution denied', 'DENY', databaseId, `users/${ownerId}/private/account`, ownerId, privateAccount, { ...privateAccount, admin: true, updated: stamp }, updateTime),

    read('owner notification get', 'ALLOW', databaseId, `users/${ownerId}/notifications/probe`, ownerId, notification),
    list('owner bounded notification list', 'ALLOW', databaseId, `users/${ownerId}/notifications`, ownerId, [], { limit: 50 }),
    list('unbounded notification list denied', 'DENY', databaseId, `users/${ownerId}/notifications`, ownerId, [], { limit: 51 }),
    update('owner notification acknowledgement', 'ALLOW', databaseId, `users/${ownerId}/notifications/probe`, ownerId, notification, { ...notification, read: true }, updateTime),
    update('owner ecosystem notification acknowledgement', 'ALLOW', databaseId, `users/${ownerId}/notifications/ecosystem-probe`, ownerId, ecosystemNotification, { ...ecosystemNotification, read: true }, updateTime),
    update('ecosystem notification App scope mismatch denied', 'DENY', databaseId, `users/${ownerId}/notifications/ecosystem-probe`, ownerId, ecosystemNotification, { ...ecosystemNotification, scope: 'app', read: true }, updateTime),
    remove('client notification delete denied', 'DENY', databaseId, `users/${ownerId}/notifications/probe`, ownerId, notification),
    create('client notification publish denied', 'DENY', databaseId, `users/${ownerId}/notifications/forged`, ownerId, notification, writeTime),

    read('Werkbox App member get', 'ALLOW', databaseId, 'apps/cleanbox-app', ownerId, app, memberMocks),
    read('Werkbox App PII denied to non-member', 'DENY', databaseId, 'apps/cleanbox-app', strangerId, app),
    read('anonymous App member token denied', 'DENY', databaseId, 'apps/cleanbox-app', ownerId, app, memberMocks, 'anonymous'),
    read('Richies isolated from Werkbox member', 'DENY', databaseId, 'apps/richies-reinigung', ownerId, richiesApp, memberMocks),
    read('Richies App remains available to its own member', 'ALLOW', databaseId, 'apps/richies-reinigung', ownerId, richiesApp, richiesMemberMocks),
    update('App admin allowlisted content update', 'ALLOW', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, tagline: 'General practical work', updated: adminStamp }, updateTime, adminMocks),
    update('App admin valid social update', 'ALLOW', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, social_links: { website: 'https://example.invalid', email: 'ops@example.invalid' }, updated: adminStamp }, updateTime, adminMocks),
    update('App admin valid media update', 'ALLOW', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, media: { logo_url: 'https://example.invalid/logo.png' }, updated: adminStamp }, updateTime, adminMocks),
    update('non-admin App update denied', 'DENY', databaseId, 'apps/cleanbox-app', memberId, app, { ...app, tagline: 'Forged', updated: { at: updateTime, by: memberId } }, updateTime, regularMocks),
    update('App name remains control-owned', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, app_name: 'Forged name', updated: adminStamp }, updateTime, adminMocks),
    update('App role escalation denied', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, role: 'system', updated: adminStamp }, updateTime, adminMocks),
    update('App derived authority bypass denied', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, derived: { user_count: 999 }, updated: adminStamp }, updateTime, adminMocks),
    update('App javascript social URL denied', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, social_links: { website: 'javascript:alert(1)' }, updated: adminStamp }, updateTime, adminMocks),
    update('App credential-bearing HTTPS URL denied', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, social_links: { website: 'https://user:pass@example.invalid/private' }, updated: adminStamp }, updateTime, adminMocks),
    update('App insecure media URL denied', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, media: { logo_url: 'http://unsafe.invalid/logo.png' }, updated: adminStamp }, updateTime, adminMocks),
    update('App invalid social email denied', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, social_links: { email: 'not-an-email' }, updated: adminStamp }, updateTime, adminMocks),
    update('App schema pollution denied', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, { ...app, secret: true, updated: adminStamp }, updateTime, adminMocks),
    create('client App create denied', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, writeTime, adminMocks),
    remove('client App delete denied', 'DENY', databaseId, 'apps/cleanbox-app', adminId, app, adminMocks),
    list('raw App list denied', 'DENY', databaseId, 'apps', adminId, adminMocks),

    read('raw Ecosystem get denied', 'DENY', databaseId, 'ecosystems/cleanbox', adminId, {}),
    create('client Ecosystem create denied', 'DENY', databaseId, 'ecosystems/cleanbox', adminId, {}, writeTime),
    update('client Ecosystem update denied', 'DENY', databaseId, 'ecosystems/cleanbox', adminId, {}, {}, updateTime),

    read('owner AppUser get', 'ALLOW', databaseId, `apps/cleanbox-app/users/${ownerId}`, ownerId, membership()),
    read('AppUser PII denied to stranger', 'DENY', databaseId, `apps/cleanbox-app/users/${ownerId}`, strangerId, membership()),
    list('App admin bounded canonical AppUser list', 'ALLOW', databaseId, 'apps/cleanbox-app/users', adminId, adminMocks, { limit: 100 }, relatedMembership),
    list('App admin bounded sparse AppUser list', 'ALLOW', databaseId, 'apps/cleanbox-app/users', adminId, adminMocks, { limit: 100 }, sparseMembership),
    list('App admin unbounded AppUser list denied', 'DENY', databaseId, 'apps/cleanbox-app/users', adminId, adminMocks, { limit: 101 }, membership()),
    list('App admin malformed AppUser list denied', 'DENY', databaseId, 'apps/cleanbox-app/users', adminId, adminMocks, { limit: 100 }, { ...membership(), secret: true }),
    list('App admin invalid AppUser onboarding status denied', 'DENY', databaseId, 'apps/cleanbox-app/users', adminId, adminMocks, { limit: 100 }, { ...sparseMembership, onboarding_status: 'forged' }),
    list('App admin incomplete AppUser relationship denied', 'DENY', databaseId, 'apps/cleanbox-app/users', adminId, adminMocks, { limit: 100 }, { ...sparseMembership, kitchens: ['kitchen-a'] }),
    list('App admin invalid AppUser primary relationship denied', 'DENY', databaseId, 'apps/cleanbox-app/users', adminId, adminMocks, { limit: 100 }, { ...relatedMembership, primary_kitchen: 'kitchen-b' }),
    read('Richies AppUser isolated from Werkbox admin', 'DENY', databaseId, `apps/richies-reinigung/users/${ownerId}`, adminId, membership('user', 'richies-reinigung'), adminMocks),
    update('client AppUser privilege update denied', 'DENY', databaseId, `apps/cleanbox-app/users/${ownerId}`, ownerId, membership(), { ...membership(), role: 'admin' }, updateTime),

    list('App admin bounded canonical join-request list', 'ALLOW', databaseId, 'apps/cleanbox-app/join-requests', adminId, adminMocks, { limit: 100 }, joinRequest),
    list('App admin unbounded join-request list denied', 'DENY', databaseId, 'apps/cleanbox-app/join-requests', adminId, adminMocks, { limit: 101 }, joinRequest),
    list('App admin malformed join-request list denied', 'DENY', databaseId, 'apps/cleanbox-app/join-requests', adminId, adminMocks, { limit: 100 }, { ...joinRequest, email: 'leak@example.invalid' }),

    read('owner member App profile get', 'ALLOW', databaseId, `apps/cleanbox-app/professionals/${ownerId}`, ownerId, overlay, memberMocks),
    list('App admin bounded canonical profile overlay list', 'ALLOW', databaseId, 'apps/cleanbox-app/professionals', adminId, adminMocks, { limit: 100 }, overlay),
    list('App admin malformed profile overlay list denied', 'DENY', databaseId, 'apps/cleanbox-app/professionals', adminId, adminMocks, { limit: 100 }, { ...overlay, title: 'leak' }),
    read('App profile PII denied cross-App', 'DENY', databaseId, `apps/richies-reinigung/professionals/${ownerId}`, ownerId, { ...overlay, created: created(ownerId, 'richies-reinigung') }, memberMocks),
    update('owner App profile stamp update', 'ALLOW', databaseId, `apps/cleanbox-app/professionals/${ownerId}`, ownerId, overlay, { ...overlay, updated: stamp }, updateTime, memberMocks),
    update('App profile schema pollution denied', 'DENY', databaseId, `apps/cleanbox-app/professionals/${ownerId}`, ownerId, overlay, { ...overlay, title: 'Forged', updated: stamp }, updateTime, memberMocks),
    create('client App profile create denied', 'DENY', databaseId, `apps/cleanbox-app/professionals/${ownerId}`, ownerId, overlay, writeTime, memberMocks),

    read('Agent owner get', 'ALLOW', databaseId, `agents/${ownerId}`, ownerId, agent),
    read('Agent raw PII denied to stranger', 'DENY', databaseId, `agents/${ownerId}`, strangerId, agent),
    update('Agent exact owner update', 'ALLOW', databaseId, `agents/${ownerId}`, ownerId, agent, { ...agent, summary: 'Updated', updated: stamp }, updateTime),
    update('Agent invalid URL denied', 'DENY', databaseId, `agents/${ownerId}`, ownerId, agent, { ...agent, agent_image: 'http://unsafe.invalid/a.png', updated: stamp }, updateTime),
    update('Agent invalid contact email denied', 'DENY', databaseId, `agents/${ownerId}`, ownerId, agent, { ...agent, agent_contact_email: 'not-an-email', updated: stamp }, updateTime),
    update('Agent schema pollution denied', 'DENY', databaseId, `agents/${ownerId}`, ownerId, agent, { ...agent, admin: true, updated: stamp }, updateTime),
    create('client Agent create denied', 'DENY', databaseId, `agents/${ownerId}`, ownerId, agent, writeTime),
    list('raw Agent list denied', 'DENY', databaseId, 'agents', ownerId),

    read('Professional owner get', 'ALLOW', databaseId, `professionals/${ownerId}`, ownerId, professional),
    read('Professional raw PII denied to stranger', 'DENY', databaseId, `professionals/${ownerId}`, strangerId, professional),
    update('Professional safe scalar update', 'ALLOW', databaseId, `professionals/${ownerId}`, ownerId, professional, { ...professional, summary: 'Updated', updated: stamp }, updateTime),
    update('Professional safe positions update', 'ALLOW', databaseId, `professionals/${ownerId}`, ownerId, professional, { ...professional, positions: ['Cleaner', 'Caretaker'], updated: stamp }, updateTime),
    update('Professional scalar update cannot preserve polluted positions', 'DENY', databaseId, `professionals/${ownerId}`, ownerId, { ...professional, positions: [42] }, { ...professional, positions: [42], summary: 'Updated', updated: stamp }, updateTime),
    update('Professional structured experience client update denied', 'DENY', databaseId, `professionals/${ownerId}`, ownerId, professional, { ...professional, relevant_experience: [{ role: 'Forged' }], updated: stamp }, updateTime),
    update('Professional schema pollution denied', 'DENY', databaseId, `professionals/${ownerId}`, ownerId, professional, { ...professional, private_email: 'leak@example.invalid', updated: stamp }, updateTime),
    update('Professional invalid URL denied', 'DENY', databaseId, `professionals/${ownerId}`, ownerId, professional, { ...professional, image: 'http://unsafe.invalid/p.png', updated: stamp }, updateTime),
    create('client Professional create denied', 'DENY', databaseId, `professionals/${ownerId}`, ownerId, professional, writeTime),
    list('raw Professional list denied', 'DENY', databaseId, 'professionals', ownerId),
  ]

  for (const root of ['jobs', 'companies', 'products', 'blogs']) {
    tests.push(
      read(`${root} raw domain get denied`, 'DENY', databaseId, `${root}/probe`, ownerId, {}),
      create(`${root} raw domain create denied`, 'DENY', databaseId, `${root}/probe`, ownerId, {}, writeTime)
    )
  }
  tests.push(
    read('Place exact canonical get allowed', 'ALLOW', databaseId, 'places/probe', null, {}),
    list('Place collection list denied', 'DENY', databaseId, 'places', ownerId),
    create('Place browser create denied', 'DENY', databaseId, 'places/probe', ownerId, {}, writeTime),
    read('unknown root defaults to deny', 'DENY', databaseId, 'future-domain/probe', ownerId, {}),
    create('unknown nested path defaults to deny', 'DENY', databaseId, 'apps/cleanbox-app/private/secrets/probe', adminId, {}, writeTime, adminMocks),
    read('migration evidence denied to clients', 'DENY', databaseId, MIGRATION_MARKER_PATH, adminId, {})
  )
  return tests
}

function auth(uid, provider = 'password') {
  return {
    uid,
    token: { sub: uid, firebase: { sign_in_provider: provider } },
  }
}

function rulesPath(databaseId, value) {
  return `/databases/${databaseId}/documents/${value}`
}

function read(name, expectation, databaseId, value, uid, resourceData, functionMocks = [], provider = 'password') {
  return {
    name,
    testCase: {
      expectation,
      request: {
        auth: uid ? auth(uid, provider) : null,
        path: rulesPath(databaseId, value),
        method: 'get',
      },
      ...(resourceData ? { resource: { data: resourceData } } : {}),
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  }
}

function list(
  name,
  expectation,
  databaseId,
  value,
  uid,
  functionMocks = [],
  query,
  resourceData
) {
  return {
    name,
    testCase: {
      expectation,
      request: {
        auth: uid ? auth(uid) : null,
        path: rulesPath(databaseId, `${value}/__rules_list_probe__`),
        method: 'list',
        ...(query ? { query } : {}),
      },
      ...(resourceData ? { resource: { data: resourceData } } : {}),
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  }
}

function create(name, expectation, databaseId, value, uid, data, time, functionMocks = []) {
  return {
    name,
    testCase: {
      expectation,
      request: {
        auth: auth(uid),
        path: rulesPath(databaseId, value),
        method: 'create',
        time,
        resource: { data },
      },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
    },
  }
}

function update(name, expectation, databaseId, value, uid, currentData, nextData, time, functionMocks = []) {
  return {
    name,
    testCase: {
      expectation,
      request: {
        auth: auth(uid),
        path: rulesPath(databaseId, value),
        method: 'update',
        time,
        resource: { data: nextData },
      },
      resource: { data: currentData },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  }
}

function remove(name, expectation, databaseId, value, uid, currentData, functionMocks = []) {
  return {
    name,
    testCase: {
      expectation,
      request: {
        auth: auth(uid),
        path: rulesPath(databaseId, value),
        method: 'delete',
      },
      resource: { data: currentData },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
    },
  }
}

function membershipMocks(databaseId, appId, userId, role) {
  const path = rulesPath(databaseId, `apps/${appId}/users/${userId}`)
  return [
    {
      function: 'exists',
      args: [{ exactValue: path }],
      result: { value: true },
    },
    {
      function: 'get',
      args: [{ exactValue: path }],
      result: { value: { data: { role } } },
    },
  ]
}

async function assertReleaseEvidence({ sourceSha256, quarantineSha256 }) {
  const document = await firestoreGet(MIGRATION_MARKER_PATH)
  const evidence = decodeFirestoreFields(document.fields || {})
  const expectedCutovers = {
    jobs: 'trusted-api-v1',
    places: 'trusted-api-v1',
    companies: 'trusted-api-v1',
    products: 'disabled-v1',
    blogs: 'disabled-v1',
    professional_structured_experience: 'trusted-api-v1',
    app_admin_people: 'trusted-api-v1',
  }
  const errors = []
  if (evidence.schema_version !== 1) errors.push('schema_version')
  if (evidence.complete !== true) errors.push('complete')
  if (evidence.no_legacy_compatibility !== true) {
    errors.push('no_legacy_compatibility')
  }
  if (evidence.project_id !== PROJECT_ID) errors.push('project_id')
  if (evidence.database_id !== PRODUCTION_DATABASE_ID) errors.push('database_id')
  if (evidence.ecosystem_id !== ECOSYSTEM_ID) errors.push('ecosystem_id')
  if (stableJson(evidence.app_ids) !== stableJson(APP_IDS)) errors.push('app_ids')
  for (const field of [
    'user_count',
    'app_user_count',
    'agent_count',
    'professional_count',
    'handle_reservation_count',
    'canonical_notification_count',
  ]) {
    if (!Number.isSafeInteger(evidence[field]) || evidence[field] < 0) {
      errors.push(field)
    }
  }
  for (const field of [
    'operation_set_sha256',
    'source_backup_sha256',
    'plan_artifact_sha256',
    'final_plan_sha256',
    'post_migration_inventory_sha256',
    'server_api_probe_sha256',
  ]) {
    if (!/^[a-f0-9]{64}$/.test(evidence[field] || '')) errors.push(field)
  }
  if (evidence.candidate_rules_sha256 !== sourceSha256) {
    errors.push('candidate_rules_sha256')
  }
  if (evidence.quarantine_rules_sha256 !== quarantineSha256) {
    errors.push('quarantine_rules_sha256')
  }
  if (evidence.server_api_cutover_version !== 1) {
    errors.push('server_api_cutover_version')
  }
  if (stableJson(evidence.server_api_cutovers) !== stableJson(expectedCutovers)) {
    errors.push('server_api_cutovers')
  }
  if (evidence.server_api_base_url !== 'https://cleanbox.web.app') {
    errors.push('server_api_base_url')
  }
  if (
    stableJson(evidence.known_descendant_collection_ids) !==
    stableJson([
      'users',
      'agents',
      'professionals',
      'private',
      'notifications',
      'join-requests',
      'membership-blocks',
    ])
  ) {
    errors.push('known_descendant_collection_ids')
  }
  for (const field of ['completed_at', 'server_api_verified_at']) {
    if (
      typeof evidence[field] !== 'string' ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(evidence[field])
    ) {
      errors.push(field)
    }
  }
  if (errors.length) {
    throw new Error(
      `Production source is blocked: ${MIGRATION_MARKER_PATH} is missing exact evidence for ${errors.join(', ')}.`
    )
  }
  return evidence
}

async function assertLiveServerEvidence(evidence) {
  for (const probe of SERVER_API_PROBES) {
    const response = await fetch(`${probe.baseUrl}${probe.path}`, {
      method: probe.method,
      headers: {
        accept: 'application/json',
        ...(probe.method === 'GET'
          ? {}
          : { 'content-type': 'application/json' }),
      },
      ...(probe.method === 'GET' ? {} : { body: '{}' }),
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
    })
    const contentType = String(response.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
    if (response.status !== 401 || contentType !== 'application/json') {
      throw new Error(
        `Live server probe failed for ${probe.method} ${probe.baseUrl}${probe.path}.`
      )
    }
  }

}

async function firestoreGet(documentPath) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/${PRODUCTION_DATABASE_ID}/documents/${documentPath}`
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      `Migration evidence read failed (HTTP ${response.status}): ${JSON.stringify(payload)}`
    )
  }
  return payload
}

function decodeFirestoreFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)])
  )
}

function decodeFirestoreValue(value) {
  if ('nullValue' in value) return null
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('timestampValue' in value) return value.timestampValue
  if ('stringValue' in value) return value.stringValue
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(decodeFirestoreValue)
  }
  if ('mapValue' in value) {
    return decodeFirestoreFields(value.mapValue.fields || {})
  }
  throw new Error(`Unsupported Firestore evidence value: ${JSON.stringify(value)}`)
}

function assertNoBlockingIssues(issues, label) {
  const blocking = issues.filter(
    (issue) => issue.severity === 'ERROR' || issue.severity === 'WARNING'
  )
  if (blocking.length) {
    throw new Error(`${label} reported blocking issues:\n${formatIssues(blocking)}`)
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${API}/${path}`, {
    method: options.method || 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      `Firebase Rules API ${options.method || 'GET'} ${path} failed ` +
        `(HTTP ${response.status}): ${JSON.stringify(payload)}`
    )
  }
  return payload
}

function releaseName(databaseId) {
  return `projects/${PROJECT_ID}/releases/cloud.firestore/${databaseId}`
}

async function getRelease(databaseId) {
  return api(releaseName(databaseId))
}

async function getRuleset(name) {
  return api(name)
}

async function pointRelease(databaseId, rulesetName) {
  const name = releaseName(databaseId)
  return api(name, {
    method: 'PATCH',
    body: { release: { name, rulesetName }, updateMask: 'rulesetName' },
  })
}

async function verifyRelease(databaseId, expectedRuleset, expectedSha256) {
  const release = await getRelease(databaseId)
  if (release.rulesetName !== expectedRuleset) {
    throw new Error(`${databaseId} release did not retain the expected ruleset.`)
  }
  const ruleset = await getRuleset(release.rulesetName)
  if (sha256(rulesContent(ruleset)) !== expectedSha256) {
    throw new Error(`${databaseId} release source hash does not match.`)
  }
}

async function assertReleaseSourceHash(databaseId, expectedSha256) {
  const release = await getRelease(databaseId)
  const ruleset = await getRuleset(release.rulesetName)
  const actualSha256 = sha256(rulesContent(ruleset))
  if (actualSha256 !== expectedSha256) {
    throw new Error(
      `${databaseId} is not on the required reviewed source ${expectedSha256}.`
    )
  }
  return { rulesetName: ruleset.name, sourceSha256: actualSha256 }
}

async function backupReleases(databaseIds) {
  const releases = await Promise.all(
    databaseIds.map(async (databaseId) => {
      const release = await getRelease(databaseId)
      const ruleset = await getRuleset(release.rulesetName)
      return { databaseId, release, ruleset }
    })
  )
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const path = `/private/tmp/fireux-werkbox-firestore-rules-${stamp}.json`
  const backup = await writeProtectedJsonArtifact({
    path,
    payload: {
      format: 'fireux-werkbox-rules-backup/1',
      createdAt: new Date().toISOString(),
      projectId: PROJECT_ID,
      releases,
    },
  })
  return backup
}

function rulesContent(ruleset) {
  return String(
    ruleset?.source?.files?.find((file) => file.name === 'firestore.rules')
      ?.content || ''
  )
}

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex')
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (!value || typeof value !== 'object') return JSON.stringify(value)
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
    .join(',')}}`
}

function formatIssues(issues) {
  return issues
    .map((issue) => {
      const position = issue.sourcePosition || {}
      return `${position.fileName || 'firestore.rules'}:${position.line || '?'}:${position.column || '?'} ${issue.description}`
    })
    .join('\n')
}

function printJson(value) {
  const output = `${JSON.stringify(value, null, 2)}\n`
  return new Promise((resolve) => process.stdout.write(output, resolve))
}
