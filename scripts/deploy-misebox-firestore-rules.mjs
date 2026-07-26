#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-21
// usage_note: compile, back up, stage, promote, or roll back Misebox named-database Firestore Security Rules through the Firebase Rules REST API.
// Concurrent edit — 2026-07-20 12:41 CEST — Security spine: gate promotion on exhaustive public fixtures, query cases, and private authority attacks.
// Concurrent edit — 2026-07-20 13:44 CEST — User/profile security pass: exercise trusted-only identity, handle, overlay, grant, and full-order boundaries.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: cover owner get-before-create and canonical User profile binding.
// Concurrent edit — 2026-07-20 13:42 CEST — Security rollout gate: require migration evidence and block unproven raw-root cutovers.
// Concurrent edit — 2026-07-20 16:35 CEST — Repo Efficiency Pass 1 of 6: make mutation fixtures truthful, pin App bootstrap identity, and block warnings.
// Concurrent edit — 2026-07-20 19:44 CEST — Repo Efficiency Pass 2 of 6: gate profile integrity and parallelize independent Rules test batches.
// Concurrent edit — 2026-07-20 19:29 CEST — Repo Efficiency Pass 2 fixtures: attest full Place payload evidence and strict URL/year/profile mutations.
// Concurrent edit — 2026-07-20 19:51 CEST — Ecosystem-avatar fixture: preserve the canonical slash-prefixed value as a Rules string.
// Concurrent edit — 2026-07-20 20:02 CEST — Repo Efficiency Pass 2 security fixtures: exercise API-only public profile reads and bounded owner mutations.
// Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: share protected JSON backup writing without sharing release authority.
// Concurrent edit — 2026-07-21 15:27 CEST — Shared Firestore Rules pass: require the verified Core-composed candidate artifact before release work.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: adversarially test optional bounded public biography writes.
// Concurrent edit — 2026-07-21 16:16 CEST — FireUX Finance pass: prove immutable Sale and server-only financial-fact boundaries.
// Concurrent edit — 2026-07-21 20:42 CEST — Kitchen target reads: adversarially prove exact-root Console access without raw listing.
// Concurrent edit — 2026-07-21 21:41 CEST — AppKitchen authority arrays: reject missing, malformed, and oversized write shapes.
// Concurrent edit — 2026-07-21 23:02 CEST — Console authority alignment: prove team membership cannot exercise operator mutations.
// Concurrent edit — 2026-07-21 23:16 CEST — Console authority hardening: trace deny failures and prove complete Supplier support cannot bypass validation.
// Concurrent edit — 2026-07-22 15:55 CEST — Developer identity migration: pin Misebox bootstrap authority to Daniel's retained Firebase identity.
// Concurrent edit — 2026-07-26 — Ingredient authority: release the API-projected root while red-teaming Kitchen references.

import process from 'node:process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { assertFirestoreRulesArtifactCurrent } from './_lib/firestore-rules-source.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const PROJECT_ID = 'misebox-78f9c'
const SIMULATION_DATABASE_ID = 'misebox-simulation'
const PRODUCTION_DATABASE_ID = 'misebox'
const BOOTSTRAP_DEVELOPER_ID = 'jMK33p5XlhYS8rBCEf8qUiogfMg2'
const ECOSYSTEM_AVATAR = '/img/ecosystem/avatar.png'
const MISEBOX_ENV_PATH = new URL(
  '../projects/misebox/misebox-app/.env',
  import.meta.url
)
const API = 'https://firebaserules.googleapis.com/v1'
const BLOCKED_PRODUCTION_ROOTS = [
  'blogs',
  'companies',
  'ecosystems',
  'jobs',
  'menus',
  'places',
  'portfolios',
  'products',
  'properties',
  'suppliers',
]
const PROFILE_INTEGRITY_PLACE_IDS = Object.freeze(
  [
    'ChIJ5a7zI4yZb0gREnXFLyK2efw',
    'ChIJEbkWR0ijj0cRiHfShuHPLcc',
    'ChIJW24UWZEFR0YRLz8DJUFmfes',
    'ChIJXdh4fWQzGQ0RMxS3c5Nua04',
    'ChIJd5U3YbF0iUcR-oLtm9B0M5Y',
  ].sort()
)
const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(`
Compile and promote Misebox Firestore Security Rules.

Usage:
  node scripts/deploy-misebox-firestore-rules.mjs --check
  node scripts/deploy-misebox-firestore-rules.mjs --test-security
  node scripts/deploy-misebox-firestore-rules.mjs --test-simulation
  node scripts/deploy-misebox-firestore-rules.mjs --deploy-simulation
  node scripts/deploy-misebox-firestore-rules.mjs --promote-production
  node scripts/deploy-misebox-firestore-rules.mjs --rollback <database-id> <ruleset-name>

--check compiles without changing a release. Simulation creates one immutable
ruleset; production promotion reuses that exact simulation ruleset. Every
release-changing action first writes a mode-0600 backup under /private/tmp.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const selectedActions = [
  args.check,
  args.testSecurity,
  args.testSimulation,
  args.deploySimulation,
  args.promoteProduction,
  Boolean(args.rollback),
].filter(Boolean)
if (selectedActions.length !== 1) {
  throw new Error('Choose exactly one action. Use --help for usage.')
}

const { content } = await assertFirestoreRulesArtifactCurrent('misebox')
const localEnv = await readFile(MISEBOX_ENV_PATH, 'utf8').catch((error) => {
  if (error?.code === 'ENOENT') return ''
  throw error
})
const configuredDeveloperId = String(
  process.env.DEVELOPER_ID ||
    process.env.DEVELOPER_UID ||
    process.env.NUXT_PUBLIC_DEVELOPER_ID ||
    readEnvValue(localEnv, [
      'DEVELOPER_ID',
      'DEVELOPER_UID',
      'NUXT_PUBLIC_DEVELOPER_ID',
    ]) ||
    ''
).trim()
if (!configuredDeveloperId) {
  throw new Error(
    'Misebox developer uid is required in the environment or app .env.'
  )
}
if (!content.includes(`request.auth.uid == '${BOOTSTRAP_DEVELOPER_ID}'`)) {
  throw new Error('Rules bootstrap developer does not match the audited uid.')
}
if (!content.includes(`return value == '${ECOSYSTEM_AVATAR}' ||`)) {
  throw new Error(
    'Rules must retain the canonical ecosystem User avatar fallback literal.'
  )
}
if (configuredDeveloperId !== BOOTSTRAP_DEVELOPER_ID) {
  throw new Error(
    'Configured developer uid does not match the Rules bootstrap developer.'
  )
}

const resolved = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const access = await resolved.credential.getAccessToken()
const accessToken = String(access?.access_token || '').trim()
if (!accessToken)
  throw new Error('Firebase credential returned no access token.')

const source = { files: [{ name: 'firestore.rules', content }] }
const sourceSha256 = sha256(content)
const compilation = await api(`projects/${PROJECT_ID}:test`, {
  method: 'POST',
  body: { source, testSuite: { testCases: [] } },
})
const blockingIssues = (compilation.issues || []).filter(
  (issue) => issue.severity === 'ERROR' || issue.severity === 'WARNING'
)
if (blockingIssues.length) {
  throw new Error(
    `Rules compilation reported blocking issues:\n${formatIssues(blockingIssues)}`
  )
}

if (args.check) {
  console.log(
    JSON.stringify(
      {
        mode: 'check',
        projectId: PROJECT_ID,
        credentialSource: resolved.source,
        sourceSha256,
        issues: compilation.issues || [],
      },
      null,
      2
    )
  )
  process.exit(0)
}

if (args.testSecurity || args.testSimulation) {
  const simulation = args.testSimulation
    ? await getRelease(SIMULATION_DATABASE_ID)
    : null
  const testTarget = simulation?.rulesetName || `projects/${PROJECT_ID}`
  const security = await executeSecurityTests(testTarget, !simulation)
  await printJson({
    mode: args.testSimulation ? 'test-simulation' : 'test-security',
    projectId: PROJECT_ID,
    databaseId: PRODUCTION_DATABASE_ID,
    credentialSource: resolved.source,
    sourceSha256,
    ...(simulation ? { rulesetName: simulation.rulesetName } : {}),
    issues: security.issues,
    testsPassed: security.tests.length,
    testEvidenceSha256: sha256(JSON.stringify(security.tests)),
    fixtureEvidence: security.fixtureEvidence,
  })
  process.exit(0)
}

const releaseBackup = await backupReleases()

if (args.deploySimulation) {
  const ruleset = await api(`projects/${PROJECT_ID}/rulesets`, {
    method: 'POST',
    body: { source },
  })
  const release = await pointRelease(SIMULATION_DATABASE_ID, ruleset.name)
  await verifyRelease(SIMULATION_DATABASE_ID, ruleset.name, sourceSha256)
  console.log(
    JSON.stringify(
      {
        mode: 'deploy-simulation',
        projectId: PROJECT_ID,
        databaseId: SIMULATION_DATABASE_ID,
        credentialSource: resolved.source,
        sourceSha256,
        rulesetName: ruleset.name,
        release,
        releaseBackup,
        issues: compilation.issues || [],
      },
      null,
      2
    )
  )
  process.exit(0)
}

if (args.promoteProduction) {
  if (BLOCKED_PRODUCTION_ROOTS.length) {
    throw new Error(
      'Production promotion is intentionally blocked until positive route/API ' +
        `contracts replace raw Firestore reads for: ${BLOCKED_PRODUCTION_ROOTS.join(', ')}.`
    )
  }
  const migrationPrerequisites = await assertProductionMigrationPrerequisites()
  const simulation = await getRelease(SIMULATION_DATABASE_ID)
  const ruleset = await getRuleset(simulation.rulesetName)
  const simulationContent = ruleset.source?.files?.find(
    (file) => file.name === 'firestore.rules'
  )?.content
  if (sha256(simulationContent || '') !== sourceSha256) {
    throw new Error(
      'Simulation does not point to the current rules source; deploy and test simulation again.'
    )
  }
  const security = await executeSecurityTests(ruleset.name, false)
  const confirmedPrerequisites = await assertProductionMigrationPrerequisites()
  if (
    JSON.stringify(confirmedPrerequisites) !==
    JSON.stringify(migrationPrerequisites)
  ) {
    throw new Error(
      'Migration prerequisites changed during production verification.'
    )
  }
  const release = await pointRelease(PRODUCTION_DATABASE_ID, ruleset.name)
  await verifyRelease(PRODUCTION_DATABASE_ID, ruleset.name, sourceSha256)
  console.log(
    JSON.stringify(
      {
        mode: 'promote-production',
        projectId: PROJECT_ID,
        databaseId: PRODUCTION_DATABASE_ID,
        credentialSource: resolved.source,
        sourceSha256,
        rulesetName: ruleset.name,
        release,
        releaseBackup,
        issues: compilation.issues || [],
        securityTestsPassed: security.tests.length,
        migrationPrerequisites,
      },
      null,
      2
    )
  )
  process.exit(0)
}

async function assertProductionMigrationPrerequisites() {
  const currentProfileState = await assertCurrentProductionProfileShapes()
  const [
    privateMarker,
    boundaryMarker,
    profileShapeMarker,
    profileIntegrityMarker,
    handleMarker,
  ] = await Promise.all([
    firestoreMaybeGet('security-migrations/user-private-v1'),
    firestoreMaybeGet('security-migrations/user-profile-boundary-v4'),
    firestoreMaybeGet('security-migrations/user-profile-canonical-shape-v1'),
    firestoreMaybeGet('security-migrations/user-profile-integrity-v1'),
    firestoreMaybeGet('user-handle-state/canonical'),
  ])
  const decoded = {
    private: decodeFirestoreFields(privateMarker?.fields || {}),
    boundary: decodeFirestoreFields(boundaryMarker?.fields || {}),
    profileShape: decodeFirestoreFields(profileShapeMarker?.fields || {}),
    profileIntegrity: decodeFirestoreFields(
      profileIntegrityMarker?.fields || {}
    ),
    handles: decodeFirestoreFields(handleMarker?.fields || {}),
    currentProfileState,
  }
  const profileIntegrityPlaces = await Promise.all(
    PROFILE_INTEGRITY_PLACE_IDS.map((placeId) =>
      firestoreMaybeGet(`places/${placeId}`)
    )
  )
  const failures = []
  if (
    decoded.private.schema_version !== 1 ||
    decoded.private.complete !== true ||
    decoded.private.identities_without_account_email !== 0 ||
    decoded.private.private_user_count !== decoded.private.user_count
  ) {
    failures.push('UserPrivate migration is missing or incomplete')
  }
  if (
    decoded.boundary.schema_version !== 4 ||
    decoded.boundary.complete !== true ||
    decoded.boundary.no_legacy_compatibility !== true ||
    !/^[a-f0-9]{64}$/.test(
      String(decoded.boundary.source_backup_sha256 || '')
    ) ||
    decoded.boundary.app_id !== 'misebox-app' ||
    decoded.boundary.user_count !== decoded.private.user_count ||
    decoded.boundary.app_user_count !== 26 ||
    decoded.boundary.root_profile_count !== 16 ||
    decoded.boundary.documents_updated !== 66 ||
    decoded.boundary.obsolete_fields_removed !== 83 ||
    decoded.boundary.embedded_notifications_deleted !== 22 ||
    decoded.boundary.canonical_notifications_migrated !== 23 ||
    !Array.isArray(decoded.boundary.notification_paths) ||
    decoded.boundary.notification_paths.length !== 23 ||
    decoded.boundary.historical_source_backup_sha256 !==
      '2ffee41f8e29581450ae44783e1944353e79d0d93069863100ba722e8731d0ee' ||
    decoded.boundary.historical_notifications_examined !== 23 ||
    decoded.boundary.historical_notifications_recovered !== 1 ||
    decoded.boundary.historical_bios_examined !== 2 ||
    decoded.boundary.historical_bios_applied !== 0 ||
    decoded.boundary.historical_bios_current_canonical_retained !== 2 ||
    !Array.isArray(decoded.boundary.historical_bio_decisions) ||
    decoded.boundary.historical_bio_decisions.length !== 2 ||
    decoded.boundary.historical_bio_reconciliation_sha256 !==
      'b00152772762d63969fee6074e39e9f1bee446ec7785be62c0a5a9e494db2d14' ||
    decoded.boundary.notification_payload_sha256 !==
      'b6f14795eb501f171344767e39e98291d424f9466d931b4d18adf646f3f00611' ||
    decoded.boundary.embedded_user_snapshots_deleted !== 33 ||
    decoded.boundary.chef_gallery_entries_migrated !== 6 ||
    decoded.boundary.chef_kitchen_ids_migrated !== 0 ||
    decoded.boundary.dangling_chef_kitchen_snapshots_deleted !== 1
  ) {
    failures.push(
      'no-legacy User/Profile boundary hardening is missing or stale'
    )
  }
  const expectedProfileShapeKeys = [
    'agent_documents_updated',
    'app_id',
    'chef_documents_updated',
    'complete',
    'completed_at',
    'database_id',
    'documents_updated',
    'experience_items_normalized',
    'fields_backfilled',
    'no_legacy_compatibility',
    'predecessor_marker_path',
    'predecessor_source_backup_sha256',
    'professional_documents_updated',
    'project_id',
    'schema_version',
    'source_backup_sha256',
  ]
  if (
    JSON.stringify(Object.keys(decoded.profileShape).sort()) !==
      JSON.stringify(expectedProfileShapeKeys) ||
    decoded.profileShape.schema_version !== 1 ||
    decoded.profileShape.complete !== true ||
    decoded.profileShape.no_legacy_compatibility !== true ||
    decoded.profileShape.project_id !== PROJECT_ID ||
    decoded.profileShape.database_id !== PRODUCTION_DATABASE_ID ||
    decoded.profileShape.app_id !== 'misebox-app' ||
    !Number.isFinite(Date.parse(decoded.profileShape.completed_at || '')) ||
    !/^[a-f0-9]{64}$/.test(
      String(decoded.profileShape.source_backup_sha256 || '')
    ) ||
    decoded.profileShape.predecessor_marker_path !==
      'security-migrations/user-profile-boundary-v4' ||
    decoded.profileShape.predecessor_source_backup_sha256 !==
      decoded.boundary.source_backup_sha256 ||
    decoded.profileShape.documents_updated !== 13 ||
    decoded.profileShape.fields_backfilled !== 48 ||
    decoded.profileShape.agent_documents_updated !== 2 ||
    decoded.profileShape.chef_documents_updated !== 3 ||
    decoded.profileShape.professional_documents_updated !== 8 ||
    decoded.profileShape.experience_items_normalized !== 27
  ) {
    failures.push('canonical root-profile shape migration is missing or stale')
  }
  const expectedProfileIntegrityKeys = [
    'app_id',
    'complete',
    'completed_at',
    'database_id',
    'documents_updated',
    'no_legacy_compatibility',
    'place_ids',
    'place_payload_sha256',
    'places_created',
    'predecessor_marker_path',
    'predecessor_source_backup_sha256',
    'project_id',
    'schema_version',
    'source_backup_sha256',
    'urls_normalized',
  ]
  const hasCompleteProfileIntegrityPlaces = profileIntegrityPlaces.every(
    (document, index) => {
      const placeId = PROFILE_INTEGRITY_PLACE_IDS[index]
      const data = decodeFirestoreFields(document?.fields || {})
      return (
        documentPath(document) === `places/${placeId}` &&
        !Object.hasOwn(data, 'id') &&
        typeof data.name === 'string' &&
        data.name.trim() !== '' &&
        typeof data.formatted_address === 'string' &&
        data.formatted_address.trim() !== '' &&
        Number.isFinite(data.lat) &&
        Number.isFinite(data.lng) &&
        (data.lat !== 0 || data.lng !== 0) &&
        data.source === 'fireux' &&
        data.place_type === 'physical' &&
        typeof data.slug === 'string' &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug) &&
        typeof data.default_currency_code === 'string' &&
        /^[A-Z]{3}$/.test(data.default_currency_code) &&
        isEmptyOrHttps(data.image_url) &&
        isEmptyOrHttps(data.cover_image) &&
        isEmptyOrHttps(data.website) &&
        isEmptyOrHttps(data.google_maps_url) &&
        Array.isArray(data.gallery_images) &&
        data.gallery_images.every(isNonEmptyHttps) &&
        isCanonicalMigrationStamp(data.created) &&
        isCanonicalMigrationStamp(data.updated)
      )
    }
  )
  const profileIntegrityPlacePayloadSha256 = hasCompleteProfileIntegrityPlaces
    ? profileIntegrityPlacePayloadDigest(profileIntegrityPlaces)
    : ''
  const profileIntegrityPlacesUntouched = profileIntegrityPlaces.every(
    (document) =>
      decodeFirestoreFields(document?.fields || {}).updated?.by ===
      'system:profile-integrity-v1'
  )
  if (
    JSON.stringify(Object.keys(decoded.profileIntegrity).sort()) !==
      JSON.stringify(expectedProfileIntegrityKeys) ||
    decoded.profileIntegrity.schema_version !== 1 ||
    decoded.profileIntegrity.complete !== true ||
    decoded.profileIntegrity.no_legacy_compatibility !== true ||
    decoded.profileIntegrity.project_id !== PROJECT_ID ||
    decoded.profileIntegrity.database_id !== PRODUCTION_DATABASE_ID ||
    decoded.profileIntegrity.app_id !== 'misebox-app' ||
    !Number.isFinite(Date.parse(decoded.profileIntegrity.completed_at || '')) ||
    !/^[a-f0-9]{64}$/.test(
      String(decoded.profileIntegrity.source_backup_sha256 || '')
    ) ||
    decoded.profileIntegrity.predecessor_marker_path !==
      'security-migrations/user-profile-canonical-shape-v1' ||
    decoded.profileIntegrity.predecessor_source_backup_sha256 !==
      decoded.profileShape.source_backup_sha256 ||
    decoded.profileIntegrity.documents_updated !== 1 ||
    decoded.profileIntegrity.urls_normalized !== 1 ||
    decoded.profileIntegrity.places_created !==
      PROFILE_INTEGRITY_PLACE_IDS.length ||
    JSON.stringify(decoded.profileIntegrity.place_ids) !==
      JSON.stringify(PROFILE_INTEGRITY_PLACE_IDS) ||
    !/^[a-f0-9]{64}$/.test(
      String(decoded.profileIntegrity.place_payload_sha256 || '')
    ) ||
    !hasCompleteProfileIntegrityPlaces ||
    (profileIntegrityPlacesUntouched &&
      decoded.profileIntegrity.place_payload_sha256 !==
        profileIntegrityPlacePayloadSha256)
  ) {
    failures.push(
      'canonical profile-integrity migration, Place payloads, or digest is missing or stale'
    )
  }
  if (
    decoded.handles.schema_version !== 1 ||
    decoded.handles.backfill_complete !== true ||
    decoded.handles.user_count !== decoded.private.user_count
  ) {
    failures.push('canonical User handle backfill is missing or stale')
  }
  if (failures.length) {
    throw new Error(
      `Production migration prerequisites failed:\n- ${failures.join('\n- ')}`
    )
  }
  return decoded
}

async function assertCurrentProductionProfileShapes() {
  const [users, agents, chefs, professionals] = await Promise.all([
    firestoreList('users'),
    firestoreList('agents'),
    firestoreList('chefs'),
    firestoreList('professionals'),
  ])
  const path = (value) =>
    `/databases/${PRODUCTION_DATABASE_ID}/documents/${value}`
  const documentsByPath = new Map(
    [...users, ...agents, ...chefs, ...professionals].map((document) => [
      documentPath(document),
      document,
    ])
  )
  const profileTests = [
    ['agent', agents],
    ['chef', chefs],
    ['professional', professionals],
  ].flatMap(([profileId, documents]) =>
    documents.map((document) => {
      const userId = documentId(document)
      const documentValue = documentPath(document)
      return {
        name: `${profileId}:${userId}`,
        testCase: {
          expectation: 'ALLOW',
          request: {
            auth: null,
            path: path(documentValue),
            method: 'get',
          },
          resource: firestoreRulesResource(document),
          functionMocks: canonicalUserMocks(userId, path, documentsByPath),
          pathEncoding: 'PLAIN',
          expressionReportLevel: 'VISITED',
        },
      }
    })
  )
  const result = await api(`projects/${PROJECT_ID}:test`, {
    method: 'POST',
    body: {
      source,
      testSuite: { testCases: profileTests.map(({ testCase }) => testCase) },
    },
  })
  const blockingIssues = (result.issues || []).filter(
    (issue) => issue.severity === 'ERROR' || issue.severity === 'WARNING'
  )
  const failures = profileTests
    .map((test, index) => ({
      name: test.name,
      state: result.testResults?.[index]?.state || 'MISSING',
    }))
    .filter((test) => test.state !== 'SUCCESS')
  if (blockingIssues.length || failures.length) {
    throw new Error(
      'Current production profile-shape validation failed:\n' +
        JSON.stringify({ blockingIssues, failures }, null, 2)
    )
  }

  const evidence = [...users, ...agents, ...chefs, ...professionals]
    .map((document) => [documentPath(document), document.updateTime || ''])
    .sort(([left], [right]) => left.localeCompare(right))
  return {
    userCount: users.length,
    agentCount: agents.length,
    chefCount: chefs.length,
    professionalCount: professionals.length,
    evidenceSha256: sha256(JSON.stringify(evidence)),
  }
}

const rollbackRuleset = await getRuleset(args.rollback.rulesetName)
const rollbackContent = rollbackRuleset.source?.files?.find(
  (file) => file.name === 'firestore.rules'
)?.content
if (!rollbackContent)
  throw new Error('Rollback ruleset has no firestore.rules.')
const rollbackRelease = await pointRelease(
  args.rollback.databaseId,
  rollbackRuleset.name
)
await verifyRelease(
  args.rollback.databaseId,
  rollbackRuleset.name,
  sha256(rollbackContent)
)
console.log(
  JSON.stringify(
    {
      mode: 'rollback',
      projectId: PROJECT_ID,
      databaseId: args.rollback.databaseId,
      credentialSource: resolved.source,
      rulesetName: rollbackRuleset.name,
      release: rollbackRelease,
      releaseBackup,
    },
    null,
    2
  )
)

function parseArgs(values) {
  const parsed = {
    help: false,
    check: false,
    testSecurity: false,
    testSimulation: false,
    deploySimulation: false,
    promoteProduction: false,
    rollback: null,
  }
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (value === '--help') parsed.help = true
    else if (value === '--check') parsed.check = true
    else if (value === '--test-security') parsed.testSecurity = true
    else if (value === '--test-simulation') parsed.testSimulation = true
    else if (value === '--deploy-simulation') parsed.deploySimulation = true
    else if (value === '--promote-production') parsed.promoteProduction = true
    else if (value === '--service-account') {
      parsed['service-account'] = values[index + 1]
      index += 1
      if (!parsed['service-account']) {
        throw new Error('--service-account requires a path.')
      }
    } else if (value === '--rollback') {
      const databaseId = values[index + 1]
      const rulesetName = values[index + 2]
      index += 2
      if (
        ![SIMULATION_DATABASE_ID, PRODUCTION_DATABASE_ID].includes(databaseId)
      ) {
        throw new Error(
          '--rollback database must be misebox-simulation or misebox.'
        )
      }
      if (!rulesetName?.startsWith(`projects/${PROJECT_ID}/rulesets/`)) {
        throw new Error('--rollback requires a full ruleset resource name.')
      }
      parsed.rollback = { databaseId, rulesetName }
    } else {
      throw new Error(`Unknown argument: ${value}`)
    }
  }
  return parsed
}

function readEnvValue(content, keys) {
  const allowed = new Set(keys)
  for (const line of String(content || '').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!match || !allowed.has(match[1])) continue

    const raw = match[2].trim()
    const quoted = raw.match(/^(['"])(.*)\1$/)
    return quoted ? quoted[2].trim() : raw.replace(/\s+#.*$/, '').trim()
  }
  return ''
}

async function buildSecurityTests() {
  const [
    users,
    appUsers,
    customers,
    appDrivers,
    publicDrivers,
    agents,
    chefs,
    professionals,
  ] = await Promise.all([
    firestoreList('users'),
    firestoreList('apps/misebox-app/users'),
    firestoreList('apps/misebox-app/customers'),
    firestoreList('apps/misebox-app/drivers'),
    firestoreList('drivers'),
    firestoreList('agents'),
    firestoreList('chefs'),
    firestoreList('professionals'),
  ])
  const publicUserId = documentId(users[0])
  const ecosystemAvatarUserId = documentId(
    users.find(
      (document) => document.fields?.avatar?.stringValue === ECOSYSTEM_AVATAR
    )
  )
  const ecosystemAvatarUserCount = users.filter(
    (document) => document.fields?.avatar?.stringValue === ECOSYSTEM_AVATAR
  ).length
  const privateDocuments = (
    await Promise.all(
      users.map((document) =>
        firestoreMaybeGet(`users/${documentId(document)}/private/account`)
      )
    )
  ).filter(Boolean)
  const privateOwnerId = privateDocuments.length
    ? documentPath(privateDocuments[0]).split('/')[1] || ''
    : ''
  const adminId = documentId(
    appUsers.find((document) => document.fields?.role?.stringValue === 'admin')
  )
  const regularId = documentId(
    appUsers.find((document) => documentId(document) !== adminId)
  )
  const customerId = documentId(customers[0])
  const driverId = documentId(appDrivers[0])
  const driverProfileId = documentId(publicDrivers[0])
  const agentProfileId = documentId(agents[0])
  const chefProfileId = documentId(chefs[0])
  const professionalProfileId = documentId(professionals[0])
  const appDocument = await firestoreGet('apps/misebox-app')
  for (const [label, value] of Object.entries({
    publicUserId,
    ecosystemAvatarUserId,
    adminId,
    regularId,
    customerId,
    driverId,
    driverProfileId,
    agentProfileId,
    chefProfileId,
    professionalProfileId,
  })) {
    if (!value) throw new Error(`Security test fixture is missing: ${label}.`)
  }
  const strangerId = 'security-rules-attacker'
  const missingOwnerId = 'security-rules-missing-owner'
  const bootstrapDeveloperId = BOOTSTRAP_DEVELOPER_ID
  const listProbeId = '__security_rules_list_probe__'
  const defaultDeniedRoots = [
    'blogs',
    'companies',
    'ecosystems',
    'ingredients',
    'jobs',
    'menus',
    'places',
    'portfolios',
    'products',
    'projects',
    'properties',
    'suppliers',
  ]
  const path = (value) =>
    `/databases/${PRODUCTION_DATABASE_ID}/documents/${value}`
  const writeTime = '2026-07-20T12:00:00Z'
  const updateTime = '2026-07-20T12:05:00Z'
  const auth = (uid, provider = 'password') => ({
    uid,
    token: {
      sub: uid,
      firebase: { sign_in_provider: provider },
    },
  })
  const documentsByPath = new Map(
    [
      ...users,
      ...appUsers,
      ...customers,
      ...appDrivers,
      ...publicDrivers,
      ...agents,
      ...chefs,
      ...professionals,
      appDocument,
      ...privateDocuments,
    ].map((document) => [documentPath(document), document])
  )
  const read = (
    name,
    expectation,
    value,
    uid,
    functionMocks = [],
    provider = 'password'
  ) => ({
    name,
    testCase: {
      expectation,
      request: {
        auth: uid ? auth(uid, provider) : null,
        path: path(value),
        method: 'get',
      },
      ...(documentsByPath.has(value)
        ? { resource: firestoreRulesResource(documentsByPath.get(value)) }
        : {}),
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  })
  const list = (
    name,
    expectation,
    value,
    uid,
    functionMocks = [],
    resourceData,
    requestQuery
  ) => ({
    name,
    testCase: {
      expectation,
      request: {
        auth: uid ? auth(uid) : null,
        path: path(`${String(value).replace(/\/+$/, '')}/${listProbeId}`),
        method: 'list',
        ...(requestQuery ? { query: requestQuery } : {}),
      },
      ...(resourceData ? { resource: { data: resourceData } } : {}),
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  })
  const readResource = (
    name,
    expectation,
    value,
    uid,
    resourceData,
    functionMocks = [],
    provider = 'password'
  ) => ({
    name,
    testCase: {
      expectation,
      request: {
        auth: uid ? auth(uid, provider) : null,
        path: path(value),
        method: 'get',
      },
      resource: { data: resourceData },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  })
  const deniedCreate = (
    name,
    value,
    uid,
    data,
    time = writeTime,
    functionMocks = []
  ) => ({
    name,
    testCase: {
      expectation: 'DENY',
      request: {
        auth: auth(uid),
        path: path(value),
        method: 'create',
        time,
        resource: { data },
      },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  })
  const allowedCreate = (name, value, uid, data, time, functionMocks = []) => ({
    name,
    testCase: {
      expectation: 'ALLOW',
      request: {
        auth: auth(uid),
        path: path(value),
        method: 'create',
        time,
        resource: { data },
      },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  })
  const deniedUpdate = (
    name,
    value,
    uid,
    currentData,
    nextData,
    functionMocks = [],
    time = updateTime
  ) => ({
    name,
    testCase: {
      expectation: 'DENY',
      request: {
        auth: auth(uid),
        path: path(value),
        method: 'update',
        time,
        resource: { data: nextData },
      },
      resource: { data: currentData },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  })
  const allowedUpdate = (
    name,
    value,
    uid,
    currentData,
    nextData,
    time,
    functionMocks = []
  ) => ({
    name,
    testCase: {
      expectation: 'ALLOW',
      request: {
        auth: auth(uid),
        path: path(value),
        method: 'update',
        time,
        resource: { data: nextData },
      },
      resource: { data: currentData },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  })
  const deniedDelete = (
    name,
    value,
    uid,
    currentData,
    functionMocks = [],
    time = updateTime
  ) => ({
    name,
    testCase: {
      expectation: 'DENY',
      request: {
        auth: auth(uid),
        path: path(value),
        method: 'delete',
        time,
      },
      resource: { data: currentData },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
    },
  })
  const allowedDelete = (
    name,
    value,
    uid,
    currentData,
    functionMocks = [],
    time = updateTime
  ) => ({
    name,
    testCase: {
      expectation: 'ALLOW',
      request: {
        auth: auth(uid),
        path: path(value),
        method: 'delete',
        time,
      },
      resource: { data: currentData },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  })
  const appDriverDocument = appDrivers.find(
    (document) => documentId(document) === driverId
  )
  const publicUserDocument = users.find(
    (document) => documentId(document) === publicUserId
  )
  const appDriverData = firestoreRulesResource(appDriverDocument).data
  const publicUserData = firestoreRulesResource(publicUserDocument).data
  const publicUserDataWithoutBio = Object.fromEntries(
    Object.entries(publicUserData).filter(([field]) => field !== 'bio')
  )
  const publicUserDataWithBio = {
    ...publicUserDataWithoutBio,
    bio: 'I build useful things.',
  }
  const forgedPublicUserProfiles =
    Array.isArray(publicUserData.profiles) &&
    publicUserData.profiles.includes('chef')
      ? publicUserData.profiles.filter((profileId) => profileId !== 'chef')
      : [
          ...(Array.isArray(publicUserData.profiles)
            ? publicUserData.profiles
            : []),
          'chef',
        ]
  const appData = firestoreRulesResource(appDocument).data
  const canonicalChefData = {
    title: '',
    summary: '',
    chef_bio: '',
    chef_image: '',
    chef_signature_dishes: [],
    chef_gallery: [],
    kitchen_ids: [],
    chef_organization_name: '',
    created: { at: writeTime, by: chefProfileId },
    updated: { at: writeTime, by: chefProfileId },
  }
  const canonicalAgentData = {
    title: '',
    summary: '',
    agent_bio: '',
    agent_image: '',
    agent_placement_types: [],
    agent_coverage_areas: [],
    agent_contact_email: '',
    agent_contact_phone: '',
    agent_website_url: '',
    subtitle: '',
    tagline: '',
    tags: [],
    created: { at: writeTime, by: agentProfileId },
    updated: { at: writeTime, by: agentProfileId },
  }
  const canonicalChefWithoutImage = { ...canonicalChefData }
  Reflect.deleteProperty(canonicalChefWithoutImage, 'chef_image')
  const canonicalExperienceItem = {
    role: 'Chef',
    from_month: 'Jan',
    from_year: '2024',
    to_month: '',
    to_year: '',
    ongoing: true,
    responsibilities: 'Leads service',
    place_id: 'security-place',
    place_collection: 'kitchens',
  }
  const canonicalProfessionalData = {
    title: '',
    subtitle: '',
    tagline: '',
    summary: '',
    bio: '',
    image: '',
    positions: [],
    tags: [],
    relevant_experience: [],
    other_experience: [],
    languages: [],
    certifications: [],
    education: [],
    volunteering: [],
    projects: [],
    created: { at: writeTime, by: professionalProfileId },
    updated: { at: writeTime, by: professionalProfileId },
  }
  const canonicalProfessionalItems = {
    relevant_experience: [canonicalExperienceItem],
    other_experience: [canonicalExperienceItem],
    languages: [{ language: 'English', proficiency: 'Fluent' }],
    certifications: [
      {
        name: 'Food safety',
        year: '2025',
        place_name: '',
        formatted_address: '',
        document_url: 'https://example.invalid/certificates/food-safety.pdf',
        image_url: 'https://example.invalid/certificates/food-safety.jpg',
      },
    ],
    education: [
      {
        institution: 'Culinary school',
        degree: 'Diploma',
        start_year: '2020',
        end_year: '2022',
        ongoing: false,
        formatted_address: '',
        document_url: 'https://example.invalid/education/diploma.pdf',
        image_url: 'https://example.invalid/education/diploma.jpg',
      },
    ],
    volunteering: [
      {
        organization: 'Community kitchen',
        role: 'Cook',
        from_year: '2023',
        to_year: null,
        ongoing: true,
        responsibilities: '',
      },
    ],
    projects: [
      {
        name: 'Pop-up',
        role: 'Lead',
        from_year: '2024',
        to_year: null,
        ongoing: true,
        responsibilities: '',
      },
    ],
  }
  const aggregateLimitProfessionalData = {
    ...canonicalProfessionalData,
    relevant_experience: Array.from(
      { length: 12 },
      () => canonicalExperienceItem
    ),
    other_experience: Array.from({ length: 12 }, () => canonicalExperienceItem),
  }
  const experienceWithoutCollection = { ...canonicalExperienceItem }
  Reflect.deleteProperty(experienceWithoutCollection, 'place_collection')
  const invalidProfessionalPatches = [
    ['a non-string position', { positions: [42] }],
    [
      'an experience snapshot alias',
      {
        relevant_experience: [
          { ...canonicalExperienceItem, place_draft: { name: 'Legacy' } },
        ],
      },
    ],
    [
      'a missing experience field',
      { relevant_experience: [experienceWithoutCollection] },
    ],
    ['an incomplete language item', { languages: [{ language: 'English' }] }],
    [
      'an invalid certification year shape',
      {
        certifications: [
          { ...canonicalProfessionalItems.certifications[0], year: {} },
        ],
      },
    ],
    [
      'a numeric certification year',
      {
        certifications: [
          { ...canonicalProfessionalItems.certifications[0], year: 2025 },
        ],
      },
    ],
    [
      'an invalid experience month',
      {
        relevant_experience: [
          { ...canonicalExperienceItem, from_month: 'Jax' },
        ],
      },
    ],
    [
      'a numeric experience year',
      {
        relevant_experience: [{ ...canonicalExperienceItem, from_year: 2024 }],
      },
    ],
    [
      'an unsafe Firestore place id',
      {
        relevant_experience: [
          { ...canonicalExperienceItem, place_id: 'unsafe/place' },
        ],
      },
    ],
    [
      'a noncanonical Place collection',
      {
        relevant_experience: [
          { ...canonicalExperienceItem, place_collection: 'places' },
        ],
      },
    ],
    [
      'a non-HTTPS certification document URL',
      {
        certifications: [
          {
            ...canonicalProfessionalItems.certifications[0],
            document_url: 'ftp://example.invalid/certificate.pdf',
          },
        ],
      },
    ],
    [
      'a non-HTTPS education image URL',
      {
        education: [
          {
            ...canonicalProfessionalItems.education[0],
            image_url: 'http://example.invalid/education/diploma.jpg',
          },
        ],
      },
    ],
    ['a non-HTTPS profile image', { image: 'javascript:alert(1)' }],
    [
      'a non-boolean education state',
      {
        education: [
          { ...canonicalProfessionalItems.education[0], ongoing: 'yes' },
        ],
      },
    ],
    [
      'an extra volunteering field',
      {
        volunteering: [
          { ...canonicalProfessionalItems.volunteering[0], legacy: true },
        ],
      },
    ],
    [
      'an oversized project responsibility',
      {
        projects: [
          {
            ...canonicalProfessionalItems.projects[0],
            responsibilities: 'x'.repeat(4_001),
          },
        ],
      },
    ],
  ]
  const validChefGallery = Array.from({ length: 6 }, (_, index) => ({
    name: `Signature plate ${index + 1}`,
    image_url: `https://example.invalid/plate-${index + 1}.jpg`,
  }))
  const canonicalNotificationData = {
    message: 'Server-published notification',
    scope: 'ecosystem',
    created: { at: writeTime, app_id: '' },
    read: false,
  }
  const invalidChefGalleries = [
    [
      'more than 6 items',
      Array.from({ length: 7 }, (_, index) => ({
        name: `Plate ${index + 1}`,
        image_url: `https://example.invalid/plate-${index + 1}.jpg`,
      })),
    ],
    ['a non-map item', ['https://example.invalid/plate.jpg']],
    ['a missing name', [{ image_url: 'https://example.invalid/plate.jpg' }]],
    ['a missing image_url', [{ name: 'Signature plate' }]],
    [
      'an extra field',
      [
        {
          name: 'Signature plate',
          image_url: 'https://example.invalid/plate.jpg',
          caption: 'Not canonical',
        },
      ],
    ],
    [
      'an overlong name',
      [
        {
          name: 'x'.repeat(241),
          image_url: 'https://example.invalid/plate.jpg',
        },
      ],
    ],
    ['an empty image_url', [{ name: 'Signature plate', image_url: '' }]],
    [
      'an overlong image_url',
      [
        {
          name: 'Signature plate',
          image_url: `https://example.invalid/${'x'.repeat(2025)}`,
        },
      ],
    ],
  ]
  const canonicalAppCreateData = {
    project_id: 'misebox',
    ecosystem_id: 'misebox',
    database_id: 'misebox',
    slug: 'misebox-app',
    status: 'active',
    app_name: 'Misebox',
    app_short_name: 'Misebox',
    role: 'global',
    social_links: { website: 'https://misebox.app' },
    derived: { user_count: 0 },
    fireux_native: true,
    fireux_size: 'big',
    fireux_repo: {
      key: 'misebox',
      workspace: 'projects/misebox/misebox-app',
      launch_order: 1,
      console_families: ['kitchen', 'supplier'],
      database_id: 'misebox',
    },
    self_join_enabled: true,
    moderation_state: '',
    ban_reasons: [],
    created: { at: writeTime, by: bootstrapDeveloperId },
    updated: { at: writeTime, by: bootstrapDeveloperId },
  }
  const canonicalEcosystemCreateData = {
    id: 'misebox',
    project_id: 'misebox',
    name: 'Misebox',
    slug: 'misebox',
    description: '',
    image_url: 'https://misebox.app/img/logo.png',
    website_url: 'https://misebox.app',
    status: 'active',
    created: {
      at: writeTime,
      by: 'misebox-app',
      app_id: 'misebox-app',
    },
    updated: { at: writeTime, by: 'misebox-app' },
  }
  const rootKitchenProbePath = 'kitchens/security-rules-probe'
  const rootKitchenProbeData = {
    app_scope: {
      state: 'tenant_app',
      app_id: 'security-rules-tenant',
    },
  }
  const parentRootKitchenProbeData = {
    app_scope: {
      state: 'parent_app',
      app_id: 'misebox-app',
    },
  }
  const appKitchenProbePath =
    'apps/misebox-app/kitchens/security-rules-authority-probe'
  const appKitchenProbeData = {
    operator_ids: [adminId],
    team_ids: [adminId],
    join_requests: [],
  }
  const teamKitchenSupportData = {
    operator_ids: [],
    team_ids: [regularId],
    join_requests: [],
  }
  const kitchenChildProbePath =
    'apps/misebox-app/kitchens/security-rules-probe/team-members/member-probe'
  const kitchenChildProbeData = {
    display_name: 'Rules Team Member',
    active: true,
  }
  const activeIngredientId = 'security-rules-active-ingredient'
  const inactiveIngredientId = 'security-rules-inactive-ingredient'
  const rootIngredientProbeData = {
    schema_version: 2,
    name: 'Rules Ingredient',
    slug: activeIngredientId,
    aliases: [],
    category: 'other',
    kind: 'base',
    status: 'active',
    image_url: '',
  }
  const kitchenIngredientProbePath =
    `apps/misebox-app/kitchens/security-rules-probe/ingredients/${activeIngredientId}`
  const kitchenIngredientData = (userId, ingredientId = activeIngredientId) => ({
    ingredient_id: ingredientId,
    created: {
      at: writeTime,
      by: userId,
      app_id: 'misebox-app',
    },
    updated: {
      at: writeTime,
      by: userId,
    },
  })
  const appSupplierProbePath =
    'apps/misebox-app/suppliers/security-rules-supplier-probe'
  const teamSupplierSupportData = {
    operator_ids: [],
    team_ids: [regularId],
    join_requests: [],
  }
  const appSupplierProbeData = {
    operator_ids: [adminId],
    team_ids: [adminId],
    join_requests: [],
  }
  const supplierChildProbePath =
    `${appSupplierProbePath}/catalogue/item-probe`
  const supplierChildProbeData = {
    name: 'Rules Catalogue Item',
    active: true,
  }
  const saleProbePath =
    'apps/misebox-app/kitchens/security-rules-probe/sales/sale-probe'
  const saleProbeData = {
    id: 'sale-probe',
    schema_version: 1,
    app_id: 'misebox-app',
    kitchen_id: 'security-rules-probe',
    order_id: 'sale-probe',
    amount_minor: 2500,
    currency_code: 'CHF',
  }
  const financialFactProbePath =
    'apps/misebox-app/financial-facts/fact-v1-security-probe'
  const financialFactProbeData = {
    id: 'fact-v1-security-probe',
    schema_version: 1,
    app_id: 'misebox-app',
    kind: 'gross_sale',
    amount_minor: 2500,
    currency_code: 'CHF',
  }
  const sparseMembershipProbePath =
    'apps/misebox-app/users/security-rules-sparse-membership'
  const sparseMembershipProbeData = {
    role: 'user',
    is_premium: false,
    console_enabled: false,
    onboarding_status: 'pending',
    created: {
      at: writeTime,
      by: adminId,
      app_id: 'misebox-app',
    },
    updated: { at: writeTime, by: adminId },
  }
  const partialTargetMembershipProbeData = {
    ...sparseMembershipProbeData,
    console_enabled: true,
    console_targets: {
      kitchen_ids: ['security-rules-probe'],
    },
  }
  const tests = [
    list(
      'raw public User collection listing uses projection API',
      'DENY',
      'users'
    ),
    list(
      'raw public App collection listing uses projection API',
      'DENY',
      'apps'
    ),
    list(
      'bootstrap developer cannot list canonical App truth',
      'DENY',
      'apps',
      bootstrapDeveloperId
    ),
    read(
      'bootstrap developer can inspect the Misebox App',
      'ALLOW',
      'apps/misebox-app',
      bootstrapDeveloperId
    ),
    read(
      'bootstrap developer cannot inspect another App',
      'DENY',
      'apps/security-other-app',
      bootstrapDeveloperId
    ),
    allowedCreate(
      'bootstrap developer can create a canonical App',
      'apps/misebox-app',
      bootstrapDeveloperId,
      canonicalAppCreateData,
      writeTime
    ),
    deniedCreate(
      'non-developer cannot create a canonical App',
      'apps/misebox-app',
      strangerId,
      canonicalAppCreateData
    ),
    ...[
      ['project_id', 'other-project'],
      ['ecosystem_id', 'other-ecosystem'],
      ['database_id', 'other-database'],
      ['slug', 'other-app'],
      ['status', 'draft'],
      ['role', 'tenant'],
      ['self_join_enabled', false],
    ].map(([field, forgedValue]) =>
      deniedCreate(
        `bootstrap developer cannot forge App ${field}`,
        'apps/misebox-app',
        bootstrapDeveloperId,
        { ...canonicalAppCreateData, [field]: forgedValue }
      )
    ),
    deniedCreate(
      'bootstrap developer cannot create another App id',
      'apps/security-other-app',
      bootstrapDeveloperId,
      canonicalAppCreateData
    ),
    allowedCreate(
      'bootstrap developer can create the canonical Ecosystem',
      'ecosystems/misebox',
      bootstrapDeveloperId,
      canonicalEcosystemCreateData,
      writeTime
    ),
    deniedCreate(
      'non-developer cannot create the canonical Ecosystem',
      'ecosystems/misebox',
      strangerId,
      canonicalEcosystemCreateData
    ),
    allowedUpdate(
      'bootstrap developer can update allowlisted Ecosystem content',
      'ecosystems/misebox',
      bootstrapDeveloperId,
      canonicalEcosystemCreateData,
      {
        ...canonicalEcosystemCreateData,
        name: 'Misebox rules probe',
        updated: { at: updateTime, by: 'misebox-app' },
      },
      updateTime
    ),
    ...[
      ['id', 'other-ecosystem'],
      ['project_id', 'other-project'],
      ['slug', 'other-ecosystem'],
      ['created', { at: writeTime, by: 'other-app', app_id: 'other-app' }],
    ].map(([field, forgedValue]) =>
      deniedUpdate(
        `bootstrap developer cannot forge Ecosystem ${field}`,
        'ecosystems/misebox',
        bootstrapDeveloperId,
        canonicalEcosystemCreateData,
        {
          ...canonicalEcosystemCreateData,
          updated: { at: updateTime, by: 'misebox-app' },
          [field]: forgedValue,
        }
      )
    ),
    read(
      'owner can get missing User before trusted create',
      'ALLOW',
      `users/${missingOwnerId}`,
      missingOwnerId
    ),
    read(
      'owner can get missing UserPrivate before trusted create',
      'ALLOW',
      `users/${missingOwnerId}/private/account`,
      missingOwnerId
    ),
    read(
      'owner can get missing UserApp before trusted create',
      'ALLOW',
      `apps/misebox-app/users/${missingOwnerId}`,
      missingOwnerId
    ),
    read(
      'owner can get missing join request before trusted create',
      'ALLOW',
      `apps/misebox-app/join-requests/${missingOwnerId}`,
      missingOwnerId
    ),
    ...['customers', 'drivers', 'agents', 'chefs', 'professionals'].map(
      (collectionName) =>
        read(
          `owner can get missing App ${collectionName} row before create`,
          'ALLOW',
          `apps/misebox-app/${collectionName}/${missingOwnerId}`,
          missingOwnerId,
          appMemberMocks(missingOwnerId, path)
        )
    ),
    ...['drivers', 'agents', 'chefs', 'professionals'].map((collectionName) =>
      read(
        `owner can get missing root ${collectionName} profile before create`,
        'ALLOW',
        `${collectionName}/${missingOwnerId}`,
        missingOwnerId
      )
    ),
    ...users.map((document) => {
      const userId = documentId(document)
      return read(
        `anonymous can read strict public User ${userId}`,
        'ALLOW',
        `users/${userId}`
      )
    }),
    ...privateDocuments.map((document) => {
      const userId = documentPath(document).split('/')[1] || ''
      return read(
        `owner can read strict UserPrivate ${userId}`,
        'ALLOW',
        `users/${userId}/private/account`,
        userId
      )
    }),
    ...(privateOwnerId
      ? [
          read(
            'anonymous-provider token cannot read own UserPrivate',
            'DENY',
            `users/${privateOwnerId}/private/account`,
            privateOwnerId,
            [],
            'anonymous'
          ),
        ]
      : []),
    read(
      'anonymous cannot read UserPrivate',
      'DENY',
      `users/${privateOwnerId || publicUserId}/private/account`
    ),
    read(
      'another user cannot read UserPrivate',
      'DENY',
      `users/${privateOwnerId || publicUserId}/private/account`,
      strangerId
    ),
    read(
      'handle reservations are never client-readable',
      'DENY',
      'user-handles/security-rules-probe',
      publicUserId
    ),
    read(
      'handle backfill state is never client-readable',
      'DENY',
      'user-handle-state/canonical',
      publicUserId
    ),
    read(
      'security migration evidence is never client-readable',
      'DENY',
      'security-migrations/user-profile-boundary-v4',
      publicUserId
    ),
    ...appUsers.map((document) => {
      const userId = documentId(document)
      return read(
        `owner can read strict UserApp membership ${userId}`,
        'ALLOW',
        `apps/misebox-app/users/${userId}`,
        userId
      )
    }),
    read(
      'another member cannot read UserApp membership',
      'DENY',
      `apps/misebox-app/users/${regularId}`,
      strangerId
    ),
    read(
      'canonical admin can read another UserApp membership',
      'ALLOW',
      `apps/misebox-app/users/${regularId}`,
      adminId,
      appAdminMocks(adminId, path)
    ),
    readResource(
      'canonical admin can read sparse UserApp membership',
      'ALLOW',
      sparseMembershipProbePath,
      adminId,
      sparseMembershipProbeData,
      appAdminMocks(adminId, path)
    ),
    readResource(
      'canonical admin can read partial UserApp Console targets',
      'ALLOW',
      sparseMembershipProbePath,
      adminId,
      partialTargetMembershipProbeData,
      appAdminMocks(adminId, path)
    ),
    readResource(
      'canonical admin cannot read invalid UserApp onboarding status',
      'DENY',
      sparseMembershipProbePath,
      adminId,
      {
        ...sparseMembershipProbeData,
        onboarding_status: 'forged',
      },
      appAdminMocks(adminId, path)
    ),
    readResource(
      'canonical admin cannot read unknown UserApp Console target family',
      'DENY',
      sparseMembershipProbePath,
      adminId,
      {
        ...sparseMembershipProbeData,
        console_targets: { forged_ids: [] },
      },
      appAdminMocks(adminId, path)
    ),
    readResource(
      'canonical admin cannot read malformed UserApp Console target list',
      'DENY',
      sparseMembershipProbePath,
      adminId,
      {
        ...sparseMembershipProbeData,
        console_targets: { kitchen_ids: 'not-a-list' },
      },
      appAdminMocks(adminId, path)
    ),
    list(
      'canonical admin can list bounded sparse UserApp memberships',
      'ALLOW',
      'apps/misebox-app/users',
      adminId,
      appAdminMocks(adminId, path),
      sparseMembershipProbeData,
      { limit: 100 }
    ),
    list(
      'canonical admin cannot list unbounded UserApp memberships',
      'DENY',
      'apps/misebox-app/users',
      adminId,
      appAdminMocks(adminId, path),
      sparseMembershipProbeData,
      { limit: 101 }
    ),
    ...customers.map((document) => {
      const userId = documentId(document)
      return read(
        `Customer can read strict own private profile ${userId}`,
        'ALLOW',
        `apps/misebox-app/customers/${userId}`,
        userId,
        appMemberMocks(userId, path)
      )
    }),
    read(
      'removed Customer cannot keep reading App-private profile',
      'DENY',
      `apps/misebox-app/customers/${customerId}`,
      customerId
    ),
    read(
      'another user cannot read Customer private profile',
      'DENY',
      `apps/misebox-app/customers/${customerId}`,
      strangerId
    ),
    ...appDrivers.map((document) => {
      const userId = documentId(document)
      return read(
        `Driver can read strict own operational profile ${userId}`,
        'ALLOW',
        `apps/misebox-app/drivers/${userId}`,
        userId,
        appMemberMocks(userId, path)
      )
    }),
    read(
      'removed Driver cannot keep reading operational grants',
      'DENY',
      `apps/misebox-app/drivers/${driverId}`,
      driverId
    ),
    read(
      'another user cannot read Driver private operational profile',
      'DENY',
      `apps/misebox-app/drivers/${driverId}`,
      strangerId
    ),
    deniedUpdate(
      'Driver cannot self-grant Kitchen authority',
      `apps/misebox-app/drivers/${driverId}`,
      driverId,
      appDriverData,
      {
        ...appDriverData,
        active_kitchen_ids: ['security-rules-probe'],
        kitchen_links: ['security-rules-probe'],
        updated: { at: updateTime, by: driverId },
      },
      appMemberMocks(driverId, path)
    ),
    ...publicDrivers.map((document) => {
      const userId = documentId(document)
      return read(
        `anonymous can read strict public Driver ${userId}`,
        'ALLOW',
        `drivers/${userId}`,
        undefined,
        canonicalUserMocks(userId, path, documentsByPath)
      )
    }),
    list('raw Driver listing uses projection API', 'DENY', 'drivers'),
    ...[
      ['agents', agents],
      ['chefs', chefs],
      ['professionals', professionals],
    ].flatMap(([collectionName, documents]) => [
      ...documents.map((document) => {
        const userId = documentId(document)
        return read(
          `anonymous raw ${collectionName}/${userId} detail uses the public projection API`,
          'DENY',
          `${collectionName}/${userId}`
        )
      }),
      ...documents.map((document) => {
        const userId = documentId(document)
        return read(
          `owner can read canonical raw ${collectionName}/${userId}`,
          'ALLOW',
          `${collectionName}/${userId}`,
          userId
        )
      }),
      list(
        `raw ${collectionName} listing uses projection API`,
        'DENY',
        collectionName
      ),
    ]),
    allowedUpdate(
      'Agent owner can store canonical HTTPS image and website fields',
      `agents/${agentProfileId}`,
      agentProfileId,
      canonicalAgentData,
      {
        ...canonicalAgentData,
        agent_image: 'https://example.invalid/agents/rules-agent.jpg',
        agent_website_url: 'https://example.invalid/agents/rules-agent',
        updated: { at: updateTime, by: agentProfileId },
      },
      updateTime,
      canonicalUserMocks(agentProfileId, path, documentsByPath)
    ),
    ...[
      ['an HTTP image', { agent_image: 'http://example.invalid/agent.jpg' }],
      [
        'a mailto website',
        { agent_website_url: 'mailto:agent@example.invalid' },
      ],
    ].map(([label, invalidPatch]) =>
      deniedUpdate(
        `Agent owner cannot store ${label}`,
        `agents/${agentProfileId}`,
        agentProfileId,
        canonicalAgentData,
        {
          ...canonicalAgentData,
          ...invalidPatch,
          updated: { at: updateTime, by: agentProfileId },
        },
        canonicalUserMocks(agentProfileId, path, documentsByPath)
      )
    ),
    allowedUpdate(
      'Chef owner can store a strictly shaped canonical gallery',
      `chefs/${chefProfileId}`,
      chefProfileId,
      canonicalChefData,
      {
        ...canonicalChefData,
        chef_image: 'https://example.invalid/chefs/rules-chef.jpg',
        chef_gallery: validChefGallery,
        updated: { at: updateTime, by: chefProfileId },
      },
      updateTime,
      canonicalUserMocks(chefProfileId, path, documentsByPath)
    ),
    deniedUpdate(
      'Chef owner cannot store a non-HTTPS root image',
      `chefs/${chefProfileId}`,
      chefProfileId,
      canonicalChefData,
      {
        ...canonicalChefData,
        chef_image: 'ftp://example.invalid/chef.jpg',
        updated: { at: updateTime, by: chefProfileId },
      },
      canonicalUserMocks(chefProfileId, path, documentsByPath)
    ),
    deniedUpdate(
      'Chef owner cannot delete a canonical profile field',
      `chefs/${chefProfileId}`,
      chefProfileId,
      canonicalChefData,
      {
        ...canonicalChefWithoutImage,
        updated: { at: updateTime, by: chefProfileId },
      },
      canonicalUserMocks(chefProfileId, path, documentsByPath)
    ),
    ...invalidChefGalleries.map(([label, chefGallery]) =>
      deniedUpdate(
        `Chef owner cannot store gallery with ${label}`,
        `chefs/${chefProfileId}`,
        chefProfileId,
        canonicalChefData,
        {
          ...canonicalChefData,
          chef_gallery: chefGallery,
          updated: { at: updateTime, by: chefProfileId },
        },
        canonicalUserMocks(chefProfileId, path, documentsByPath)
      )
    ),
    ...[
      [
        'image',
        {
          image: 'https://example.invalid/professionals/rules-professional.jpg',
        },
      ],
      ['positions', { positions: ['Chef'] }],
      ['tags', { tags: ['seasonal'] }],
      ...Object.entries(canonicalProfessionalItems).map(([field, value]) => [
        field,
        { [field]: value },
      ]),
    ].map(([field, patch]) =>
      allowedUpdate(
        `Professional owner can update canonical ${field} independently`,
        `professionals/${professionalProfileId}`,
        professionalProfileId,
        canonicalProfessionalData,
        {
          ...canonicalProfessionalData,
          ...patch,
          updated: { at: updateTime, by: professionalProfileId },
        },
        updateTime,
        canonicalUserMocks(professionalProfileId, path, documentsByPath)
      )
    ),
    deniedUpdate(
      'Professional owner cannot change multiple structured item families in one mutation',
      `professionals/${professionalProfileId}`,
      professionalProfileId,
      canonicalProfessionalData,
      {
        ...canonicalProfessionalData,
        relevant_experience: canonicalProfessionalItems.relevant_experience,
        languages: canonicalProfessionalItems.languages,
        updated: { at: updateTime, by: professionalProfileId },
      },
      canonicalUserMocks(professionalProfileId, path, documentsByPath)
    ),
    deniedUpdate(
      'Professional owner cannot exceed 24 structured items by changing one family',
      `professionals/${professionalProfileId}`,
      professionalProfileId,
      aggregateLimitProfessionalData,
      {
        ...aggregateLimitProfessionalData,
        languages: canonicalProfessionalItems.languages,
        updated: { at: updateTime, by: professionalProfileId },
      },
      canonicalUserMocks(professionalProfileId, path, documentsByPath)
    ),
    ...invalidProfessionalPatches.map(([label, invalidPatch]) =>
      deniedUpdate(
        `Professional owner cannot store ${label}`,
        `professionals/${professionalProfileId}`,
        professionalProfileId,
        canonicalProfessionalData,
        {
          ...canonicalProfessionalData,
          ...invalidPatch,
          updated: { at: updateTime, by: professionalProfileId },
        },
        canonicalUserMocks(professionalProfileId, path, documentsByPath)
      )
    ),
    read(
      'anonymous raw App detail uses the public projection API',
      'DENY',
      'apps/misebox-app'
    ),
    read(
      'App member can read canonical App truth',
      'ALLOW',
      'apps/misebox-app',
      regularId,
      appMemberMocks(regularId, path)
    ),
    readResource(
      'parent-App Kitchen operator can read exact root identity',
      'ALLOW',
      rootKitchenProbePath,
      regularId,
      parentRootKitchenProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      })
    ),
    readResource(
      'team-only Kitchen support can read exact root identity',
      'ALLOW',
      rootKitchenProbePath,
      regularId,
      parentRootKitchenProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    readResource(
      'App admin can read exact root Kitchen with same-id support',
      'ALLOW',
      rootKitchenProbePath,
      adminId,
      parentRootKitchenProbeData,
      scopedKitchenAuthorityMocks(adminId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        role: 'admin',
        operatorIds: [],
        teamIds: [],
      })
    ),
    readResource(
      'tenant-App Kitchen operator can read exact root identity',
      'ALLOW',
      rootKitchenProbePath,
      regularId,
      rootKitchenProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'security-rules-tenant',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      })
    ),
    readResource(
      'anonymous cannot read exact root Kitchen identity',
      'DENY',
      rootKitchenProbePath,
      undefined,
      rootKitchenProbeData
    ),
    readResource(
      'anonymous-provider auth cannot read exact root Kitchen identity',
      'DENY',
      rootKitchenProbePath,
      regularId,
      rootKitchenProbeData,
      [],
      'anonymous'
    ),
    readResource(
      'scoped App member without Kitchen authority cannot read root identity',
      'DENY',
      rootKitchenProbePath,
      regularId,
      rootKitchenProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'security-rules-tenant',
        kitchenId: 'security-rules-probe',
        operatorIds: ['another-user'],
        teamIds: [],
      })
    ),
    readResource(
      'UserApp Kitchen target alone cannot grant root identity access',
      'DENY',
      rootKitchenProbePath,
      regularId,
      rootKitchenProbeData,
      [
        ...miseboxKitchenTargetMocks(regularId, path, ['security-rules-probe']),
        ...missingKitchenSupportMocks(
          path,
          'security-rules-tenant',
          'security-rules-probe'
        ),
      ]
    ),
    readResource(
      'App admin cannot read root Kitchen without same-id support',
      'DENY',
      rootKitchenProbePath,
      adminId,
      rootKitchenProbeData,
      scopedKitchenAuthorityMocks(adminId, path, {
        appId: 'security-rules-tenant',
        kitchenId: 'security-rules-probe',
        role: 'admin',
        supportExists: false,
      })
    ),
    ...[
      ['root-only scope', { app_scope: { state: 'root_only' } }],
      [
        'flat legacy scope',
        {
          app_scope_state: 'tenant_app',
          app_scope_app_id: 'security-rules-tenant',
        },
      ],
      [
        'dedicated-App scope',
        {
          app_scope: {
            state: 'dedicated_app',
            app_id: 'security-rules-tenant',
          },
        },
      ],
      [
        'malformed App id',
        {
          app_scope: {
            state: 'tenant_app',
            app_id: 'invalid/app',
          },
        },
      ],
      [
        'extra App-scope keys',
        {
          app_scope: {
            state: 'tenant_app',
            app_id: 'security-rules-tenant',
            forged: true,
          },
        },
      ],
      [
        'conflicting nested and flat scope',
        {
          app_scope: {
            state: 'tenant_app',
            app_id: 'security-rules-tenant',
          },
          app_scope_state: 'parent_app',
          app_scope_app_id: 'misebox-app',
        },
      ],
    ].map(([label, resourceData]) =>
      readResource(
        `canonical Kitchen reader rejects ${label}`,
        'DENY',
        rootKitchenProbePath,
        regularId,
        resourceData
      )
    ),
    readResource(
      'Kitchen authority under another App cannot grant root identity access',
      'DENY',
      rootKitchenProbePath,
      regularId,
      rootKitchenProbeData,
      [
        ...missingKitchenSupportMocks(
          path,
          'security-rules-tenant',
          'security-rules-probe'
        ),
        ...scopedKitchenAuthorityMocks(regularId, path, {
          appId: 'security-rules-other-app',
          kitchenId: 'security-rules-probe',
          operatorIds: [regularId],
          teamIds: [],
        }),
      ]
    ),
    list(
      'authorized Kitchen operator cannot list raw root Kitchens',
      'DENY',
      'kitchens',
      regularId,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'security-rules-tenant',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      }),
      rootKitchenProbeData
    ),
    deniedCreate(
      'authorized Kitchen operator cannot create a root Kitchen in the browser',
      rootKitchenProbePath,
      regularId,
      rootKitchenProbeData,
      writeTime,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'security-rules-tenant',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      })
    ),
    deniedUpdate(
      'authorized Kitchen operator cannot update a root Kitchen in the browser',
      rootKitchenProbePath,
      regularId,
      rootKitchenProbeData,
      {
        ...rootKitchenProbeData,
        identity: { display_name: 'Forged Kitchen' },
      },
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'security-rules-tenant',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      })
    ),
    deniedDelete(
      'authorized Kitchen operator cannot delete a root Kitchen in the browser',
      rootKitchenProbePath,
      regularId,
      rootKitchenProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'security-rules-tenant',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      })
    ),
    read(
      'authorized Kitchen operator cannot read root Kitchen descendants',
      'DENY',
      `${rootKitchenProbePath}/private/secret`,
      regularId,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'security-rules-tenant',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      })
    ),
    read(
      'App admin must use the Ingredient projection API for root detail',
      'DENY',
      `ingredients/${activeIngredientId}`,
      adminId,
      appAdminMocks(adminId, path)
    ),
    list(
      'App admin must use the Ingredient projection API for root listing',
      'DENY',
      'ingredients',
      adminId,
      appAdminMocks(adminId, path)
    ),
    deniedCreate(
      'App admin cannot create a root Ingredient in the browser',
      `ingredients/${activeIngredientId}`,
      adminId,
      rootIngredientProbeData,
      writeTime,
      appAdminMocks(adminId, path)
    ),
    deniedUpdate(
      'App admin cannot update a root Ingredient in the browser',
      `ingredients/${activeIngredientId}`,
      adminId,
      rootIngredientProbeData,
      { ...rootIngredientProbeData, name: 'Forged Ingredient' },
      appAdminMocks(adminId, path)
    ),
    deniedDelete(
      'App admin cannot delete a root Ingredient in the browser',
      `ingredients/${activeIngredientId}`,
      adminId,
      rootIngredientProbeData,
      appAdminMocks(adminId, path)
    ),
    read(
      'root Ingredient descendants remain server-only',
      'DENY',
      `ingredients/${activeIngredientId}/private/secret`,
      adminId,
      appAdminMocks(adminId, path)
    ),
    allowedUpdate(
      'canonical App admin can update allowlisted App content',
      'apps/misebox-app',
      adminId,
      appData,
      {
        ...appData,
        tagline: 'Rules contract probe',
        updated: { at: updateTime, by: adminId },
      },
      updateTime,
      appAdminMocks(adminId, path)
    ),
    ...[
      ['project_id', 'other-project'],
      ['ecosystem_id', 'other-ecosystem'],
      ['database_id', 'other-database'],
      ['slug', 'other-app'],
      ['status', 'paused'],
      ['role', 'tenant'],
      ['self_join_enabled', false],
      ['derived', { user_count: 1 }],
      ['created', { at: writeTime, by: 'security-rules-attacker' }],
    ].map(([field, forgedValue]) =>
      deniedUpdate(
        `canonical App admin cannot forge App ${field}`,
        'apps/misebox-app',
        adminId,
        canonicalAppCreateData,
        {
          ...canonicalAppCreateData,
          updated: { at: updateTime, by: adminId },
          [field]: forgedValue,
        },
        appAdminMocks(adminId, path)
      )
    ),
    allowedCreate(
      'App admin can create a complete AppKitchen authority record',
      appKitchenProbePath,
      adminId,
      appKitchenProbeData,
      writeTime,
      appAdminMocks(adminId, path)
    ),
    ...['operator_ids', 'team_ids', 'join_requests'].map((field) => {
      const data = { ...appKitchenProbeData }
      delete data[field]
      return deniedCreate(
        `App admin cannot create AppKitchen without ${field}`,
        appKitchenProbePath,
        adminId,
        data,
        writeTime,
        appAdminMocks(adminId, path)
      )
    }),
    deniedCreate(
      'App admin cannot create AppKitchen with malformed join_requests',
      appKitchenProbePath,
      adminId,
      { ...appKitchenProbeData, join_requests: 'requester' },
      writeTime,
      appAdminMocks(adminId, path)
    ),
    deniedCreate(
      'App admin cannot create AppKitchen with oversized join_requests',
      appKitchenProbePath,
      adminId,
      {
        ...appKitchenProbeData,
        join_requests: Array.from({ length: 101 }, (_, index) => `user-${index}`),
      },
      writeTime,
      appAdminMocks(adminId, path)
    ),
    allowedUpdate(
      'App admin can update a complete AppKitchen authority record',
      appKitchenProbePath,
      adminId,
      appKitchenProbeData,
      { ...appKitchenProbeData, join_requests: ['requester'] },
      updateTime,
      appAdminMocks(adminId, path)
    ),
    deniedUpdate(
      'App admin cannot remove AppKitchen join_requests on update',
      appKitchenProbePath,
      adminId,
      appKitchenProbeData,
      {
        operator_ids: appKitchenProbeData.operator_ids,
        team_ids: appKitchenProbeData.team_ids,
      },
      appAdminMocks(adminId, path)
    ),
    deniedUpdate(
      'App admin cannot make AppKitchen join_requests malformed on update',
      appKitchenProbePath,
      adminId,
      appKitchenProbeData,
      { ...appKitchenProbeData, join_requests: 'requester' },
      appAdminMocks(adminId, path)
    ),
    deniedUpdate(
      'Kitchen operator cannot change AppKitchen join_requests',
      appKitchenProbePath,
      regularId,
      appKitchenProbeData,
      { ...appKitchenProbeData, join_requests: [regularId] },
      kitchenOperatorMocks(
        regularId,
        path,
        'security-rules-authority-probe'
      )
    ),
    readResource(
      'Kitchen team member can read exact AppKitchen support',
      'ALLOW',
      appKitchenProbePath,
      regularId,
      teamKitchenSupportData,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-authority-probe',
        teamIds: [regularId],
      })
    ),
    deniedUpdate(
      'Kitchen team member cannot mutate AppKitchen support',
      appKitchenProbePath,
      regularId,
      teamKitchenSupportData,
      { ...teamKitchenSupportData, label: 'forged' },
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-authority-probe',
        teamIds: [regularId],
      })
    ),
    readResource(
      'Kitchen team member can read a selected Ingredient reference',
      'ALLOW',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    list(
      'Kitchen team member can list selected Ingredient references',
      'ALLOW',
      'apps/misebox-app/kitchens/security-rules-probe/ingredients',
      regularId,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      }),
      kitchenIngredientData(regularId)
    ),
    allowedCreate(
      'Kitchen operator can select an active canonical Ingredient',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    allowedCreate(
      'App admin can select an active canonical Ingredient',
      kitchenIngredientProbePath,
      adminId,
      kitchenIngredientData(adminId),
      writeTime,
      [
        ...appAdminMocks(adminId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedCreate(
      'Kitchen team member cannot select an Ingredient',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      writeTime,
      [
        ...targetAuthorityMocks(regularId, path, {
          collectionName: 'kitchens',
          targetId: 'security-rules-probe',
          teamIds: [regularId],
        }),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedCreate(
      'Kitchen operator cannot select a missing canonical Ingredient',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId, { exists: false }),
      ]
    ),
    deniedCreate(
      'Kitchen operator cannot select an inactive canonical Ingredient',
      `apps/misebox-app/kitchens/security-rules-probe/ingredients/${inactiveIngredientId}`,
      regularId,
      kitchenIngredientData(regularId, inactiveIngredientId),
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, inactiveIngredientId, {
          status: 'deprecated',
        }),
      ]
    ),
    deniedCreate(
      'Kitchen Ingredient id must match its document id',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId, inactiveIngredientId),
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedCreate(
      'Kitchen Ingredient cannot duplicate root identity',
      kitchenIngredientProbePath,
      regularId,
      {
        ...kitchenIngredientData(regularId),
        name: 'Forged root name',
      },
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedCreate(
      'Kitchen Ingredient requires a complete update stamp',
      kitchenIngredientProbePath,
      regularId,
      Object.fromEntries(
        Object.entries(kitchenIngredientData(regularId))
          .filter(([field]) => field !== 'updated')
      ),
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedCreate(
      'Kitchen Ingredient cannot forge its App stamp',
      kitchenIngredientProbePath,
      regularId,
      {
        ...kitchenIngredientData(regularId),
        created: {
          ...kitchenIngredientData(regularId).created,
          app_id: 'security-other-app',
        },
      },
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedCreate(
      'Kitchen Ingredient cannot forge its creator',
      kitchenIngredientProbePath,
      regularId,
      {
        ...kitchenIngredientData(regularId),
        created: {
          ...kitchenIngredientData(regularId).created,
          by: 'security-rules-victim',
        },
      },
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedCreate(
      'Kitchen Ingredient cannot forge its updater',
      kitchenIngredientProbePath,
      regularId,
      {
        ...kitchenIngredientData(regularId),
        updated: {
          ...kitchenIngredientData(regularId).updated,
          by: 'security-rules-victim',
        },
      },
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedCreate(
      'Kitchen Ingredient stamps must use request time',
      kitchenIngredientProbePath,
      regularId,
      {
        ...kitchenIngredientData(regularId),
        created: {
          ...kitchenIngredientData(regularId).created,
          at: updateTime,
        },
        updated: {
          ...kitchenIngredientData(regularId).updated,
          at: updateTime,
        },
      },
      writeTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    allowedUpdate(
      'Kitchen operator can refresh only the selected Ingredient update stamp',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      {
        ...kitchenIngredientData(regularId),
        updated: { at: updateTime, by: regularId },
      },
      updateTime,
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedUpdate(
      'Kitchen Ingredient update cannot change its canonical reference',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      {
        ...kitchenIngredientData(regularId),
        ingredient_id: inactiveIngredientId,
        updated: { at: updateTime, by: regularId },
      },
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedUpdate(
      'Kitchen Ingredient update cannot reset its creation stamp',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      {
        ...kitchenIngredientData(regularId),
        created: {
          ...kitchenIngredientData(regularId).created,
          at: updateTime,
        },
        updated: { at: updateTime, by: regularId },
      },
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedUpdate(
      'Kitchen Ingredient update cannot add scoped payload fields',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      {
        ...kitchenIngredientData(regularId),
        note: 'forged',
        updated: { at: updateTime, by: regularId },
      },
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId),
      ]
    ),
    deniedUpdate(
      'Kitchen Ingredient update requires an active canonical root',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      {
        ...kitchenIngredientData(regularId),
        updated: { at: updateTime, by: regularId },
      },
      [
        ...kitchenOperatorMocks(regularId, path),
        ...ingredientRootMocks(path, activeIngredientId, {
          status: 'merged',
        }),
      ]
    ),
    allowedDelete(
      'Kitchen operator can remove a stale selected Ingredient reference',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      kitchenOperatorMocks(regularId, path)
    ),
    deniedDelete(
      'Kitchen team member cannot remove a selected Ingredient reference',
      kitchenIngredientProbePath,
      regularId,
      kitchenIngredientData(regularId),
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    read(
      'Kitchen Ingredient nested documents are denied',
      'DENY',
      `${kitchenIngredientProbePath}/private/secret`,
      regularId
    ),
    deniedCreate(
      'Kitchen operator cannot create nested Ingredient data',
      `${kitchenIngredientProbePath}/private/secret`,
      regularId,
      { note: 'forged' },
      writeTime,
      kitchenOperatorMocks(regularId, path)
    ),
    readResource(
      'Kitchen team member can read ordinary Kitchen child data',
      'ALLOW',
      kitchenChildProbePath,
      regularId,
      kitchenChildProbeData,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    deniedCreate(
      'Kitchen team member cannot create ordinary Kitchen child data',
      `${kitchenChildProbePath}-create`,
      regularId,
      kitchenChildProbeData,
      writeTime,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    deniedUpdate(
      'Kitchen team member cannot update ordinary Kitchen child data',
      kitchenChildProbePath,
      regularId,
      kitchenChildProbeData,
      { ...kitchenChildProbeData, active: false },
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    deniedDelete(
      'Kitchen team member cannot delete ordinary Kitchen child data',
      kitchenChildProbePath,
      regularId,
      kitchenChildProbeData,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    allowedCreate(
      'Kitchen operator can create ordinary Kitchen child data',
      `${kitchenChildProbePath}-operator-create`,
      regularId,
      kitchenChildProbeData,
      writeTime,
      kitchenOperatorMocks(regularId, path)
    ),
    allowedCreate(
      'App admin can create ordinary Kitchen child data without target membership',
      `${kitchenChildProbePath}-admin-create`,
      adminId,
      kitchenChildProbeData,
      writeTime,
      appAdminMocks(adminId, path)
    ),
    // Rules REST cannot encode Firestore where/array-contains constraints. This
    // proves the per-resource operator predicate; real query admissibility
    // belongs in a Firebase Emulator client-query integration test.
    list(
      'Kitchen operator can list only matching target rows',
      'ALLOW',
      'apps/misebox-app/kitchens',
      regularId,
      appMemberMocks(regularId, path),
      { operator_ids: [regularId], team_ids: [] }
    ),
    list(
      'Kitchen team member can list matching target rows',
      'ALLOW',
      'apps/misebox-app/kitchens',
      regularId,
      appMemberMocks(regularId, path),
      { operator_ids: [], team_ids: [regularId] }
    ),
    list(
      'Kitchen member cannot list nonmatching target rows',
      'DENY',
      'apps/misebox-app/kitchens',
      regularId,
      appMemberMocks(regularId, path),
      { operator_ids: ['another-user'], team_ids: [] }
    ),
    read(
      'granted Driver cannot read full Kitchen order documents',
      'DENY',
      'apps/misebox-app/kitchens/security-rules-probe/orders/private-order',
      driverId,
      appMemberMocks(driverId, path)
    ),
    read(
      'Kitchen team member cannot read full Kitchen order documents',
      'DENY',
      'apps/misebox-app/kitchens/security-rules-probe/orders/private-order',
      regularId,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    readResource(
      'Kitchen team member cannot read immutable Sales',
      'DENY',
      saleProbePath,
      regularId,
      saleProbeData,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    read(
      'Kitchen operator can read an immutable Sale',
      'ALLOW',
      saleProbePath,
      regularId,
      kitchenOperatorMocks(regularId, path)
    ),
    list(
      'Kitchen operator can list immutable Sales',
      'ALLOW',
      'apps/misebox-app/kitchens/security-rules-probe/sales',
      regularId,
      kitchenOperatorMocks(regularId, path)
    ),
    read(
      'anonymous cannot read an immutable Sale',
      'DENY',
      saleProbePath
    ),
    deniedCreate(
      'Kitchen operator cannot create an immutable Sale in the browser',
      saleProbePath,
      regularId,
      saleProbeData,
      writeTime,
      kitchenOperatorMocks(regularId, path)
    ),
    deniedUpdate(
      'Kitchen operator cannot update an immutable Sale in the browser',
      saleProbePath,
      regularId,
      saleProbeData,
      { ...saleProbeData, amount_minor: 2600 },
      kitchenOperatorMocks(regularId, path)
    ),
    deniedDelete(
      'Kitchen operator cannot delete an immutable Sale in the browser',
      saleProbePath,
      regularId,
      saleProbeData,
      kitchenOperatorMocks(regularId, path)
    ),
    deniedCreate(
      'Kitchen operator cannot use a nested Sale path to bypass immutability',
      `${saleProbePath}/private/probe`,
      regularId,
      { forged: true },
      writeTime,
      kitchenOperatorMocks(regularId, path)
    ),
    readResource(
      'Supplier team member can read exact AppSupplier support',
      'ALLOW',
      appSupplierProbePath,
      regularId,
      teamSupplierSupportData,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'suppliers',
        targetId: 'security-rules-supplier-probe',
        teamIds: [regularId],
      })
    ),
    allowedCreate(
      'App admin can create a complete AppSupplier authority record',
      `${appSupplierProbePath}-create`,
      adminId,
      appSupplierProbeData,
      writeTime,
      appAdminMocks(adminId, path)
    ),
    ...['operator_ids', 'team_ids', 'join_requests'].map((field) => {
      const data = { ...appSupplierProbeData }
      delete data[field]
      return deniedCreate(
        `App admin cannot create AppSupplier without ${field}`,
        `${appSupplierProbePath}-missing-${field}`,
        adminId,
        data,
        writeTime,
        appAdminMocks(adminId, path)
      )
    }),
    deniedCreate(
      'App admin cannot create AppSupplier with malformed join_requests',
      `${appSupplierProbePath}-malformed-joins`,
      adminId,
      { ...appSupplierProbeData, join_requests: 'requester' },
      writeTime,
      appAdminMocks(adminId, path)
    ),
    deniedCreate(
      'App admin cannot create AppSupplier with oversized join_requests',
      `${appSupplierProbePath}-oversized-joins`,
      adminId,
      {
        ...appSupplierProbeData,
        join_requests: Array.from({ length: 101 }, (_, index) => `user-${index}`),
      },
      writeTime,
      appAdminMocks(adminId, path)
    ),
    allowedUpdate(
      'App admin can update a complete AppSupplier authority record',
      appSupplierProbePath,
      adminId,
      appSupplierProbeData,
      { ...appSupplierProbeData, join_requests: ['requester'] },
      updateTime,
      appAdminMocks(adminId, path)
    ),
    deniedUpdate(
      'Supplier operator cannot change AppSupplier join_requests',
      appSupplierProbePath,
      regularId,
      {
        operator_ids: [regularId],
        team_ids: [regularId],
        join_requests: [],
      },
      {
        operator_ids: [regularId],
        team_ids: [regularId],
        join_requests: ['requester'],
      },
      targetAuthorityMocks(regularId, path, {
        collectionName: 'suppliers',
        targetId: 'security-rules-supplier-probe',
        operatorIds: [regularId],
      })
    ),
    deniedUpdate(
      'Supplier team member cannot mutate AppSupplier support',
      appSupplierProbePath,
      regularId,
      teamSupplierSupportData,
      { ...teamSupplierSupportData, label: 'forged' },
      targetAuthorityMocks(regularId, path, {
        collectionName: 'suppliers',
        targetId: 'security-rules-supplier-probe',
        teamIds: [regularId],
      })
    ),
    readResource(
      'Supplier team member can read ordinary Supplier child data',
      'ALLOW',
      supplierChildProbePath,
      regularId,
      supplierChildProbeData,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'suppliers',
        targetId: 'security-rules-supplier-probe',
        teamIds: [regularId],
      })
    ),
    deniedCreate(
      'Supplier team member cannot create ordinary Supplier child data',
      `${supplierChildProbePath}-create`,
      regularId,
      supplierChildProbeData,
      writeTime,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'suppliers',
        targetId: 'security-rules-supplier-probe',
        teamIds: [regularId],
      })
    ),
    allowedCreate(
      'Supplier operator can create ordinary Supplier child data',
      `${supplierChildProbePath}-operator-create`,
      regularId,
      supplierChildProbeData,
      writeTime,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'suppliers',
        targetId: 'security-rules-supplier-probe',
        operatorIds: [regularId],
      })
    ),
    allowedCreate(
      'App admin can create ordinary Supplier child data without target membership',
      `${supplierChildProbePath}-admin-create`,
      adminId,
      supplierChildProbeData,
      writeTime,
      appAdminMocks(adminId, path)
    ),
    read(
      'App admin cannot read raw FinancialFacts',
      'DENY',
      financialFactProbePath,
      adminId,
      appAdminMocks(adminId, path)
    ),
    deniedCreate(
      'App admin cannot create raw FinancialFacts in the browser',
      financialFactProbePath,
      adminId,
      financialFactProbeData,
      writeTime,
      appAdminMocks(adminId, path)
    ),
    deniedUpdate(
      'App admin cannot update raw FinancialFacts in the browser',
      financialFactProbePath,
      adminId,
      financialFactProbeData,
      { ...financialFactProbeData, amount_minor: 2600 },
      appAdminMocks(adminId, path)
    ),
    deniedDelete(
      'App admin cannot delete raw FinancialFacts in the browser',
      financialFactProbePath,
      adminId,
      financialFactProbeData,
      appAdminMocks(adminId, path)
    ),
    read(
      'guest cannot read a raw marketplace Store',
      'DENY',
      'apps/misebox-app/marketplace-stores/security-store'
    ),
    read(
      'Store member cannot read raw private Store authority',
      'DENY',
      'apps/misebox-app/marketplace-stores/security-store',
      regularId
    ),
    list(
      'App admin must use the marketplace administration API',
      'DENY',
      'apps/misebox-app/marketplace-stores',
      adminId
    ),
    deniedCreate(
      'Store member cannot create a raw Store',
      'apps/misebox-app/marketplace-stores/security-store',
      regularId,
      { owner_ids: [regularId], publication_state: 'draft' }
    ),
    deniedUpdate(
      'App admin cannot bypass Store lifecycle endpoints',
      'apps/misebox-app/marketplace-stores/security-store',
      adminId,
      { publication_state: 'pending_review' },
      { publication_state: 'published' }
    ),
    read(
      'guest cannot read a raw published Offer',
      'DENY',
      'apps/misebox-app/marketplace-stores/security-store/offers/security-offer'
    ),
    deniedCreate(
      'Store member cannot create a raw Offer',
      'apps/misebox-app/marketplace-stores/security-store/offers/security-offer',
      regularId,
      { state: 'draft' }
    ),
    list(
      'Store member must use the managed Offer API',
      'DENY',
      'apps/misebox-app/marketplace-stores/security-store/offers',
      regularId
    ),
    read(
      'buyer cannot read a raw marketplace Order',
      'DENY',
      'apps/misebox-app/marketplace-orders/security-order',
      regularId
    ),
    deniedCreate(
      'buyer cannot create a raw marketplace Order',
      'apps/misebox-app/marketplace-orders/security-order',
      regularId,
      { buyer_uid: regularId, status: 'requested' }
    ),
    deniedUpdate(
      'Store member cannot bypass Order lifecycle endpoints',
      'apps/misebox-app/marketplace-orders/security-order',
      regularId,
      { status: 'requested' },
      { status: 'completed' }
    ),
    read(
      'cross-App user cannot read another App marketplace Store',
      'DENY',
      'apps/security-other-app/marketplace-stores/security-store',
      regularId
    ),
    read(
      'membership blocks remain server-only',
      'DENY',
      `apps/misebox-app/membership-blocks/${regularId}`,
      regularId
    ),
    read(
      'root Customer documents remain server-only',
      'DENY',
      'customers/probe'
    ),
    read(
      'unknown collections remain default-denied',
      'DENY',
      'security-probes/probe',
      strangerId
    ),
    ...defaultDeniedRoots.flatMap((collectionName) => [
      read(
        `raw ${collectionName} documents are default-denied`,
        'DENY',
        `${collectionName}/security-probe`
      ),
      list(
        `raw ${collectionName} collections are default-denied`,
        'DENY',
        collectionName
      ),
    ]),
    read(
      'default-denied roots do not expose descendants',
      'DENY',
      'properties/security-probe/private/secret'
    ),
    deniedCreate(
      'client cannot self-create admin membership',
      'apps/misebox-app/users/security-rules-attacker',
      strangerId,
      { role: 'admin' }
    ),
    deniedCreate(
      'browser cannot bypass trusted root Driver provisioning',
      `drivers/${driverProfileId}`,
      driverProfileId,
      {
        title: '',
        subtitle: '',
        tagline: '',
        tags: [],
        coverage: { radius_m: 1500 },
        created: {
          at: '2026-07-20T12:00:00Z',
          by: driverProfileId,
        },
        updated: {
          at: '2026-07-20T12:00:00Z',
          by: driverProfileId,
        },
      }
    ),
    deniedCreate(
      'browser cannot bypass trusted App profile provisioning',
      `apps/misebox-app/chefs/${regularId}`,
      regularId,
      {
        created: { at: writeTime, by: regularId, app_id: 'misebox-app' },
        updated: { at: writeTime, by: regularId },
      }
    ),
    deniedCreate(
      'browser cannot bypass trusted App Customer provisioning',
      `apps/misebox-app/customers/${regularId}`,
      regularId,
      {}
    ),
    deniedCreate(
      'browser cannot bypass trusted App Driver provisioning',
      `apps/misebox-app/drivers/${regularId}`,
      regularId,
      {}
    ),
    deniedCreate(
      'browser cannot publish its own notification',
      `users/${publicUserId}/notifications/security-rules-probe`,
      publicUserId,
      {
        message: 'Self-authored notification',
        scope: 'ecosystem',
        created: { at: writeTime, app_id: '' },
        read: false,
      }
    ),
    list(
      'owner can list at most 50 notifications',
      'ALLOW',
      `users/${publicUserId}/notifications`,
      publicUserId,
      [],
      canonicalNotificationData,
      { limit: 50 }
    ),
    list(
      'owner cannot list more than 50 notifications',
      'DENY',
      `users/${publicUserId}/notifications`,
      publicUserId,
      [],
      canonicalNotificationData,
      { limit: 51 }
    ),
    list(
      'another user cannot list owner notifications',
      'DENY',
      `users/${publicUserId}/notifications`,
      strangerId,
      [],
      canonicalNotificationData,
      { limit: 50 }
    ),
    deniedCreate(
      'client cannot bypass trusted public User provisioning',
      `users/${strangerId}`,
      strangerId,
      {
        display_name: 'Attacker',
        avatar: '/img/ecosystem/avatar.png',
        handle: 'security-rules-attacker',
        app_ids: [],
        profiles: [],
        created: {},
        updated: {},
      }
    ),
    allowedUpdate(
      'owner can store a canonical HTTPS public User avatar',
      `users/${publicUserId}`,
      publicUserId,
      publicUserData,
      {
        ...publicUserData,
        avatar: 'https://example.invalid/avatars/rules-user.jpg',
        updated: { at: updateTime, by: publicUserId },
      },
      updateTime
    ),
    ...[
      '',
      'http://example.invalid/avatar.jpg',
      'mailto:user@example.invalid',
    ].map((avatar) =>
      deniedUpdate(
        `owner cannot store an invalid public User avatar (${avatar ? avatar.split(':')[0] : 'empty'})`,
        `users/${publicUserId}`,
        publicUserId,
        publicUserData,
        {
          ...publicUserData,
          avatar,
          updated: { at: updateTime, by: publicUserId },
        }
      )
    ),
    allowedUpdate(
      'owner can update allowlisted public User presentation',
      `users/${publicUserId}`,
      publicUserId,
      publicUserData,
      {
        ...publicUserData,
        display_name: 'Rules User',
        updated: { at: updateTime, by: publicUserId },
      },
      updateTime
    ),
    allowedUpdate(
      'owner can add a bounded public User bio',
      `users/${publicUserId}`,
      publicUserId,
      publicUserDataWithoutBio,
      {
        ...publicUserDataWithoutBio,
        bio: 'I build useful things.',
        updated: { at: updateTime, by: publicUserId },
      },
      updateTime
    ),
    allowedUpdate(
      'owner can store a 280-character public User bio',
      `users/${publicUserId}`,
      publicUserId,
      publicUserDataWithoutBio,
      {
        ...publicUserDataWithoutBio,
        bio: 'b'.repeat(280),
        updated: { at: updateTime, by: publicUserId },
      },
      updateTime
    ),
    allowedUpdate(
      'owner can remove optional public User bio',
      `users/${publicUserId}`,
      publicUserId,
      publicUserDataWithBio,
      {
        ...publicUserDataWithoutBio,
        updated: { at: updateTime, by: publicUserId },
      },
      updateTime
    ),
    deniedUpdate(
      'owner cannot exceed the public User bio limit',
      `users/${publicUserId}`,
      publicUserId,
      publicUserDataWithoutBio,
      {
        ...publicUserDataWithoutBio,
        bio: 'b'.repeat(281),
        updated: { at: updateTime, by: publicUserId },
      }
    ),
    ...[
      ['number', 42],
      ['list', []],
      ['map', {}],
      ['boolean', true],
      ['null', null],
    ].map(([label, bio]) =>
      deniedUpdate(
        `owner cannot store a ${label} public User bio`,
        `users/${publicUserId}`,
        publicUserId,
        publicUserDataWithoutBio,
        {
          ...publicUserDataWithoutBio,
          bio,
          updated: { at: updateTime, by: publicUserId },
        }
      )
    ),
    deniedUpdate(
      'owner cannot self-assign or remove a canonical profile tag',
      `users/${publicUserId}`,
      publicUserId,
      publicUserData,
      {
        ...publicUserData,
        profiles: forgedPublicUserProfiles,
        updated: { at: updateTime, by: publicUserId },
      }
    ),
    allowedUpdate(
      'owner can acknowledge a server-published notification',
      `users/${publicUserId}/notifications/security-rules-probe`,
      publicUserId,
      canonicalNotificationData,
      {
        ...canonicalNotificationData,
        read: true,
      },
      updateTime
    ),
    deniedCreate(
      'client cannot create a root profile without canonical User identity',
      `professionals/${strangerId}`,
      strangerId,
      { created: {}, updated: {} }
    ),
    deniedCreate(
      'client cannot create an App profile overlay without membership',
      `apps/misebox-app/professionals/${strangerId}`,
      strangerId,
      { created: {}, updated: {} }
    ),
    deniedCreate(
      'client cannot forge another User private account',
      'users/victim/private/account',
      strangerId,
      { email: 'attacker@example.invalid' }
    ),
    deniedCreate(
      'unowned authenticated user cannot write compatibility roots',
      'blogs/security-rules-probe',
      strangerId,
      {}
    ),
    deniedCreate(
      'self-authored compatibility documents remain server-only',
      'blogs/security-rules-self-authored',
      strangerId,
      { created: { by: strangerId } }
    ),
    deniedCreate(
      'client cannot forge a join request for another user',
      'apps/misebox-app/join-requests/victim',
      strangerId,
      { user_id: 'victim' }
    ),
  ]
  return {
    tests,
    fixtureEvidence: {
      persistedUserEcosystemAvatar: {
        avatar: ECOSYSTEM_AVATAR,
        matchingDocuments: ecosystemAvatarUserCount,
        fixturePathSha256: sha256(`users/${ecosystemAvatarUserId}`),
      },
    },
  }
}

async function executeSecurityTests(testTarget, includeSource) {
  const { tests: securityTests, fixtureEvidence } = await buildSecurityTests()
  const batchSize = 25
  const batches = Array.from(
    { length: Math.ceil(securityTests.length / batchSize) },
    (_, index) =>
      securityTests.slice(index * batchSize, (index + 1) * batchSize)
  )
  const batchResults = await Promise.all(
    batches.map((batch) =>
      api(`${testTarget}:test`, {
        method: 'POST',
        body: {
          ...(includeSource ? { source } : {}),
          testSuite: {
            testCases: batch.map(({ testCase }) => testCase),
          },
        },
      })
    )
  )
  const issues = batchResults.flatMap((result) => result.issues || [])
  const rawResults = batchResults.flatMap((result) => result.testResults || [])
  const testResults = securityTests.map((test, index) => {
    const raw = rawResults[index] || {}
    const state = raw.state || 'MISSING'
    return {
      name: test.name,
      expectation: test.testCase.expectation,
      state,
      ...(state === 'SUCCESS'
        ? {}
        : {
            debugMessages: raw.debugMessages || [],
            visitedExpressions: raw.visitedExpressions || [],
            failedExpressions: (raw.visitedExpressions || [])
              .filter((expression) => expression.value === false)
              .map((expression) => expression.sourcePosition),
          }),
    }
  })
  const failures = testResults.filter((test) => test.state !== 'SUCCESS')
  if (failures.length) {
    throw new Error(
      `Security tests failed:\n${JSON.stringify(failures, null, 2)}`
    )
  }
  return { issues, tests: testResults, fixtureEvidence }
}

function appAdminMocks(adminId, path) {
  const membershipPath = path(`apps/misebox-app/users/${adminId}`)
  return [
    {
      function: 'exists',
      args: [{ exactValue: membershipPath }],
      result: { value: true },
    },
    {
      function: 'get',
      args: [{ exactValue: membershipPath }],
      result: { value: { data: { role: 'admin' } } },
    },
  ]
}

function appMemberMocks(userId, path) {
  const membershipPath = path(`apps/misebox-app/users/${userId}`)
  return [
    {
      function: 'exists',
      args: [{ exactValue: membershipPath }],
      result: { value: true },
    },
    {
      function: 'get',
      args: [{ exactValue: membershipPath }],
      result: { value: { data: { role: 'user' } } },
    },
  ]
}

function miseboxKitchenTargetMocks(userId, path, kitchenIds) {
  const membershipPath = path(`apps/misebox-app/users/${userId}`)
  return [
    {
      function: 'exists',
      args: [{ exactValue: membershipPath }],
      result: { value: true },
    },
    {
      function: 'get',
      args: [{ exactValue: membershipPath }],
      result: {
        value: {
          data: {
            role: 'user',
            console_targets: { kitchen_ids: kitchenIds },
          },
        },
      },
    },
  ]
}

function scopedKitchenAuthorityMocks(userId, path, options) {
  const appId = String(options.appId || '').trim()
  const kitchenId = String(options.kitchenId || '').trim()
  const role = options.role === 'admin' ? 'admin' : 'user'
  const supportExists = options.supportExists !== false
  const membershipPath = path(`apps/${appId}/users/${userId}`)
  const kitchenPath = path(`apps/${appId}/kitchens/${kitchenId}`)
  const supportData = {
    ...(Array.isArray(options.operatorIds)
      ? { operator_ids: options.operatorIds }
      : {}),
    ...(Array.isArray(options.teamIds) ? { team_ids: options.teamIds } : {}),
  }
  return [
    {
      function: 'exists',
      args: [{ exactValue: membershipPath }],
      result: { value: true },
    },
    {
      function: 'get',
      args: [{ exactValue: membershipPath }],
      result: { value: { data: { role } } },
    },
    {
      function: 'exists',
      args: [{ exactValue: kitchenPath }],
      result: { value: supportExists },
    },
    ...(supportExists
      ? [
          {
            function: 'get',
            args: [{ exactValue: kitchenPath }],
            result: { value: { data: supportData } },
          },
        ]
      : []),
  ]
}

function missingKitchenSupportMocks(path, appId, kitchenId) {
  return [
    {
      function: 'exists',
      args: [{ exactValue: path(`apps/${appId}/kitchens/${kitchenId}`) }],
      result: { value: false },
    },
  ]
}

function ingredientRootMocks(path, ingredientId, options = {}) {
  const ingredientPath = path(`ingredients/${ingredientId}`)
  const exists = options.exists !== false
  return [
    {
      function: 'exists',
      args: [{ exactValue: ingredientPath }],
      result: { value: exists },
    },
    ...(exists
      ? [
          {
            function: 'get',
            args: [{ exactValue: ingredientPath }],
            result: {
              value: {
                data: {
                  status: String(options.status || 'active'),
                },
              },
            },
          },
        ]
      : []),
  ]
}

function kitchenOperatorMocks(userId, path, kitchenId = 'security-rules-probe') {
  const kitchenPath = path(`apps/misebox-app/kitchens/${kitchenId}`)
  return [
    ...appMemberMocks(userId, path),
    {
      function: 'get',
      args: [{ exactValue: kitchenPath }],
      result: {
        value: {
          data: {
            operator_ids: [userId],
            team_ids: [],
          },
        },
      },
    },
  ]
}

function targetAuthorityMocks(userId, path, options) {
  const appId = String(options.appId || 'misebox-app').trim()
  const collectionName = String(options.collectionName || '').trim()
  const targetId = String(options.targetId || '').trim()
  const targetPath = path(`apps/${appId}/${collectionName}/${targetId}`)
  return [
    ...appMemberMocks(userId, path),
    {
      function: 'get',
      args: [{ exactValue: targetPath }],
      result: {
        value: {
          data: {
            operator_ids: Array.isArray(options.operatorIds)
              ? options.operatorIds
              : [],
            team_ids: Array.isArray(options.teamIds) ? options.teamIds : [],
          },
        },
      },
    },
  ]
}

function canonicalUserMocks(userId, path, documentsByPath) {
  const userPath = `users/${userId}`
  const document = documentsByPath.get(userPath)
  if (!document) return []
  const rulesPath = path(userPath)
  return [
    {
      function: 'exists',
      args: [{ exactValue: rulesPath }],
      result: { value: true },
    },
    {
      function: 'get',
      args: [{ exactValue: rulesPath }],
      result: { value: firestoreRulesResource(document) },
    },
  ]
}

async function firestoreList(collectionPath) {
  const documents = []
  let pageToken = ''
  do {
    const query = new URLSearchParams({ pageSize: '100' })
    if (pageToken) query.set('pageToken', pageToken)
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
      `/databases/${PRODUCTION_DATABASE_ID}/documents/${collectionPath}?${query}`
    const payload = await googleJson(url)
    documents.push(...(payload.documents || []))
    pageToken = String(payload.nextPageToken || '')
  } while (pageToken)
  return documents
}

async function firestoreGet(documentPath) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/${PRODUCTION_DATABASE_ID}/documents/${documentPath}`
  return googleJson(url)
}

async function firestoreMaybeGet(documentPath) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/${PRODUCTION_DATABASE_ID}/documents/${documentPath}`
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  })
  if (response.status === 404) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      `Could not inspect Firestore fixture (HTTP ${response.status}): ` +
        JSON.stringify(payload)
    )
  }
  return payload
}

async function googleJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      `Google API GET failed (HTTP ${response.status}): ${JSON.stringify(payload)}`
    )
  }
  return payload
}

function documentId(document) {
  return (
    String(document?.name || '')
      .split('/')
      .at(-1) || ''
  )
}

function documentPath(document) {
  const marker = `/databases/${PRODUCTION_DATABASE_ID}/documents/`
  return String(document?.name || '').split(marker)[1] || ''
}

function firestoreRulesResource(document) {
  return { data: decodeFirestoreFields(document?.fields || {}) }
}

function decodeFirestoreFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => {
      const decoded = decodeFirestoreValue(value)
      // The generic Rules REST Value decoder treats slash-prefixed JSON strings
      // as Rules paths. Firestore itself stores these avatar fallbacks as
      // strings, so use a type-equivalent URL in this isolated test fixture.
      const fixtureValue =
        key === 'avatar' &&
        typeof decoded === 'string' &&
        decoded.startsWith('/')
          ? `https://example.invalid${decoded}`
          : decoded
      return [key, fixtureValue]
    })
  )
}

function profileIntegrityPlacePayloadDigest(documents) {
  const payload = documents
    .map((document) => ({
      path: documentPath(document),
      data: canonicalize(decodeFirestorePayloadFields(document?.fields || {})),
    }))
    .sort((left, right) => left.path.localeCompare(right.path))
  return sha256(JSON.stringify(payload))
}

function isNonEmptyHttps(value) {
  if (typeof value !== 'string' || !value || value.length > 2_048) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isEmptyOrHttps(value) {
  return value === '' || isNonEmptyHttps(value)
}

function isCanonicalMigrationStamp(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Number.isFinite(Date.parse(value.at || '')) &&
    typeof value.by === 'string' &&
    value.by.length > 0 &&
    value.by.length <= 1_500
  )
}

function decodeFirestorePayloadFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      decodeFirestorePayloadValue(value),
    ])
  )
}

function decodeFirestorePayloadValue(value) {
  if ('nullValue' in value) return null
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('timestampValue' in value) {
    const matched = String(value.timestampValue).match(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,9}))?Z$/
    )
    if (!matched) {
      throw new Error(
        `Unsupported Firestore timestamp payload: ${value.timestampValue}`
      )
    }
    const seconds = Date.parse(`${matched[1]}Z`) / 1_000
    if (!Number.isInteger(seconds)) {
      throw new Error(
        `Invalid Firestore timestamp payload: ${value.timestampValue}`
      )
    }
    return {
      __type: 'firestore/timestamp',
      seconds,
      nanoseconds: Number((matched[2] || '').padEnd(9, '0')),
    }
  }
  if ('stringValue' in value) return value.stringValue
  if ('bytesValue' in value) return value.bytesValue
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(decodeFirestorePayloadValue)
  }
  if ('mapValue' in value) {
    return decodeFirestorePayloadFields(value.mapValue.fields || {})
  }
  throw new Error(
    `Unsupported Firestore Place payload value: ${JSON.stringify(value)}`
  )
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])])
  )
}

function decodeFirestoreValue(value) {
  if ('nullValue' in value) return null
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('timestampValue' in value) return value.timestampValue
  if ('stringValue' in value) return value.stringValue
  if ('bytesValue' in value) return value.bytesValue
  if ('referenceValue' in value) return value.referenceValue
  if ('geoPointValue' in value) return value.geoPointValue
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(decodeFirestoreValue)
  }
  if ('mapValue' in value) {
    return decodeFirestoreFields(value.mapValue.fields || {})
  }
  throw new Error(`Unsupported Firestore REST value: ${JSON.stringify(value)}`)
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
    body: {
      release: { name, rulesetName },
      updateMask: 'rulesetName',
    },
  })
}

async function verifyRelease(databaseId, expectedRuleset, expectedSha256) {
  const release = await getRelease(databaseId)
  if (release.rulesetName !== expectedRuleset) {
    throw new Error(
      `${databaseId} release did not retain the expected ruleset.`
    )
  }
  const ruleset = await getRuleset(release.rulesetName)
  const deployedContent = ruleset.source?.files?.find(
    (file) => file.name === 'firestore.rules'
  )?.content
  if (sha256(deployedContent || '') !== expectedSha256) {
    throw new Error(`${databaseId} release source hash does not match.`)
  }
}

async function backupReleases() {
  const releases = await Promise.all(
    [SIMULATION_DATABASE_ID, PRODUCTION_DATABASE_ID].map(async (databaseId) => {
      const release = await getRelease(databaseId)
      const ruleset = await getRuleset(release.rulesetName)
      return { databaseId, release, ruleset }
    })
  )
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const path = `/private/tmp/fireux-misebox-firestore-rules-${stamp}.json`
  const backup = await writeProtectedJsonArtifact({
    path,
    payload: {
      format: 'fireux-misebox-rules-backup/1',
      createdAt: new Date().toISOString(),
      projectId: PROJECT_ID,
      releases,
    },
  })
  return backup.path
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function printJson(value) {
  const output = `${JSON.stringify(value, null, 2)}\n`
  return new Promise((resolve) => process.stdout.write(output, resolve))
}

function formatIssues(issues) {
  return issues
    .map((issue) => {
      const position = issue.sourcePosition || {}
      return `${position.fileName || 'firestore.rules'}:${position.line || '?'}:${position.column || '?'} ${issue.description}`
    })
    .join('\n')
}
