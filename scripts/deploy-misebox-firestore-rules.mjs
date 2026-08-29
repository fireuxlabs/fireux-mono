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
// Concurrent edit — 2026-07-21 20:42 CEST — Kitchen target reads: adversarially prove exact-root Workspace access without raw listing.
// Concurrent edit — 2026-07-21 21:41 CEST — AppKitchen authority arrays: reject missing, malformed, and oversized write shapes.
// Concurrent edit — 2026-07-21 23:02 CEST — Workspace authority alignment: prove team membership cannot exercise operator mutations.
// Concurrent edit — 2026-07-21 23:16 CEST — Workspace authority hardening: trace deny failures and prove complete Supplier support cannot bypass validation.
// Concurrent edit — 2026-07-22 15:55 CEST — Developer identity migration: pin Misebox bootstrap authority to Daniel's retained Firebase identity.
// Concurrent edit — 2026-07-26 — Ingredient authority: release the API-projected root while red-teaming Kitchen references.

import process from 'node:process'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
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
const BLOCKED_PRODUCTION_ROOTS = []
const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(`
Compile and promote Misebox Firestore Security Rules.

Usage:
  node scripts/deploy-misebox-firestore-rules.mjs --check
  node scripts/deploy-misebox-firestore-rules.mjs --test-security
  node scripts/deploy-misebox-firestore-rules.mjs --test-simulation
  node scripts/deploy-misebox-firestore-rules.mjs --deploy-simulation
  node scripts/deploy-misebox-firestore-rules.mjs --promote-production \
    --entity-evidence /private/tmp/<fresh-entity-canon-evidence>.json
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
  const [currentProfileState, users, entityCanon] = await Promise.all([
    assertCurrentProductionProfileShapes(),
    firestoreList('users'),
    readEntityCanonEvidence(args['entity-evidence']),
  ])
  const privateAccounts = (
    await Promise.all(
      users.map((document) =>
        firestoreMaybeGet(`users/${documentId(document)}/private/account`)
      )
    )
  ).filter(Boolean)
  const handleOwners = new Map()
  const invalidUsers = users.flatMap((document) => {
    const userId = documentId(document)
    const user = decodeFirestoreFields(document.fields || {})
    const handle = String(user.handle || '').trim()
    if (!/^[a-z0-9][a-z0-9-]{2,29}$/.test(handle)) return [userId]
    const owner = handleOwners.get(handle)
    if (owner && owner !== userId) return [userId, owner]
    handleOwners.set(handle, userId)
    return []
  })
  const failures = []
  if (!users.length || privateAccounts.length !== users.length) {
    failures.push('every canonical User must own a private account record')
  }
  if (invalidUsers.length) {
    failures.push(
      `canonical User handles are invalid or duplicated for: ${[...new Set(invalidUsers)].join(', ')}`
    )
  }
  if (failures.length) {
    throw new Error(
      `Production migration prerequisites failed:\n- ${failures.join('\n- ')}`
    )
  }
  const userEvidence = users
    .map((document) => [documentPath(document), document.updateTime || ''])
    .sort(([left], [right]) => left.localeCompare(right))
  return {
    entityCanon,
    currentProfileState,
    userCount: users.length,
    privateAccountCount: privateAccounts.length,
    canonicalHandleCount: handleOwners.size,
    userEvidenceSha256: sha256(JSON.stringify(userEvidence)),
  }
}

async function readEntityCanonEvidence(evidencePath) {
  const path = String(evidencePath || '').trim()
  if (!path.startsWith('/private/tmp/') || !path.endsWith('.json')) {
    throw new Error(
      'Production promotion requires --entity-evidence /private/tmp/<fresh-evidence>.json.'
    )
  }
  const [source, metadata] = await Promise.all([
    readFile(path, 'utf8'),
    stat(path),
  ])
  if ((metadata.mode & 0o077) !== 0) {
    throw new Error('Entity Canon evidence must use mode 0600.')
  }
  const evidence = JSON.parse(source)
  const capturedAt = Date.parse(evidence.capturedAt || '')
  const ageMs = Date.now() - capturedAt
  if (
    evidence.format !== 'fireux-firestore-entity-canon-evidence/1' ||
    evidence.ecosystem !== 'misebox' ||
    evidence.projectId !== PROJECT_ID ||
    evidence.databaseId !== PRODUCTION_DATABASE_ID ||
    evidence.phase !== 'copy' ||
    !/^[a-f0-9]{64}$/.test(String(evidence.planSha256 || '')) ||
    evidence.creates !== 0 ||
    evidence.updates !== 0 ||
    evidence.retireUpdates !== 0 ||
    !Number.isInteger(evidence.retireDeletes) ||
    evidence.retireDeletes < 1 ||
    !Number.isInteger(evidence.verified) ||
    evidence.verified < 1 ||
    !/^[a-f0-9]{64}$/.test(String(evidence.verifiedSha256 || '')) ||
    !Array.isArray(evidence.blockers) ||
    evidence.blockers.length !== 0 ||
    !String(evidence.exportUri || '').startsWith(
      'gs://misebox-78f9c-firestore-migrations/entity-canon-'
    ) ||
    !Number.isFinite(capturedAt) ||
    ageMs < -300_000 ||
    ageMs > 21_600_000
  ) {
    throw new Error('Entity Canon evidence is missing, stale, or invalid.')
  }
  return { ...evidence, evidenceSha256: sha256(source) }
}

async function assertCurrentProductionProfileShapes() {
  const users = await firestoreList('users')
  const [agents, chefs, professionals] = await Promise.all([
    readUserProfiles(users, 'agent'),
    readUserProfiles(users, 'chef'),
    readUserProfiles(users, 'professional'),
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
      const userId = profileOwnerId(document)
      const documentValue = documentPath(document)
      return {
        name: `${profileId}:${userId}`,
        testCase: {
          expectation: 'ALLOW',
          request: {
            auth: {
              uid: userId,
              token: {
                sub: userId,
                firebase: { sign_in_provider: 'password' },
              },
            },
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
    else if (value === '--entity-evidence') {
      parsed['entity-evidence'] = values[index + 1]
      index += 1
      if (!parsed['entity-evidence']) {
        throw new Error('--entity-evidence requires a path.')
      }
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
  const users = await firestoreList('users')
  const [
    appUsers,
    customers,
    appDrivers,
    driverProfiles,
    agents,
    chefs,
    professionals,
  ] = await Promise.all([
    firestoreList('apps/misebox-app/users'),
    readUserProfiles(users, 'customer'),
    readUserProfileAppStates(users, 'driver', 'misebox-app'),
    readUserProfiles(users, 'driver'),
    readUserProfiles(users, 'agent'),
    readUserProfiles(users, 'chef'),
    readUserProfiles(users, 'professional'),
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
    appUsers.find((document) =>
      ['admin', 'dev'].includes(document.fields?.role?.stringValue)
    )
  )
  const regularId = documentId(
    appUsers.find((document) => document.fields?.role?.stringValue === 'user')
  )
  const customerId = profileOwnerId(customers[0])
  const driverId = profileOwnerId(appDrivers[0])
  const driverProfileId = profileOwnerId(driverProfiles[0])
  const agentProfileId = profileOwnerId(agents[0])
  const chefProfileId = profileOwnerId(chefs[0])
  const professionalProfileId = profileOwnerId(professionals[0])
  const appDocument = await firestoreGet('apps/misebox-app')
  for (const [label, value] of Object.entries({
    publicUserId,
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
      ...driverProfiles,
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
    (document) => profileOwnerId(document) === driverId
  )
  const publicUserDocument = users.find(
    (document) => documentId(document) === publicUserId
  )
  const appDriverData = {
    ...firestoreRulesResource(appDriverDocument).data,
    profile_kind: 'driver',
    app_id: 'misebox-app',
  }
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
    kind: 'chef',
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
    kind: 'agent',
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
    kind: 'professional',
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
      workspace_families: ['kitchen', 'supplier'],
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
    management: {
      mode: 'app',
      app_id: 'security-rules-tenant',
    },
  }
  const parentRootKitchenProbeData = {
    management: {
      mode: 'workspace',
    },
  }
  const appKitchenProbePath = 'kitchens/security-rules-authority-probe'
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
    'kitchens/security-rules-probe/team-members/member-probe'
  const kitchenChildProbeData = {
    display_name: 'Rules Team Member',
    active: true,
  }
  const kitchenStationProbePath = 'kitchens/security-rules-probe/stations/grill'
  const kitchenStationProbeData = {
    kitchen_id: 'security-rules-probe',
    name: 'Grill',
    description: 'Hot line',
    active: true,
    sort_order: 1,
    created: { at: writeTime, by: regularId, app_id: 'misebox-app' },
    updated: { at: writeTime, by: regularId },
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
  const kitchenIngredientProbePath = `kitchens/security-rules-probe/ingredients/${activeIngredientId}`
  const kitchenIngredientData = (
    userId,
    ingredientId = activeIngredientId
  ) => ({
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
  const appSupplierProbePath = 'suppliers/security-rules-supplier-probe'
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
  const supplierChildProbePath = `${appSupplierProbePath}/catalogue/item-probe`
  const supplierChildProbeData = {
    name: 'Rules Catalogue Item',
    active: true,
  }
  const saleProbePath = 'kitchens/security-rules-probe/sales/sale-probe'
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
    subscription: 'free',
    onboarding_status: 'pending',
    created: {
      at: writeTime,
      by: adminId,
      app_id: 'misebox-app',
    },
    updated: { at: writeTime, by: adminId },
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
      'owner can get missing AppUser before trusted create',
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
    ...['driver', 'agent', 'chef', 'professional'].map((profileKind) =>
      read(
        `owner can get missing ${profileKind} Profile before trusted create`,
        'ALLOW',
        `users/${missingOwnerId}/profiles/${profileKind}`,
        missingOwnerId
      )
    ),
    read(
      'Customer Profile creation remains trusted-server owned',
      'DENY',
      `users/${missingOwnerId}/profiles/customer`,
      missingOwnerId
    ),
    read(
      'Driver App state creation remains trusted-server owned',
      'DENY',
      `users/${missingOwnerId}/profiles/driver/app-state/misebox-app`,
      missingOwnerId,
      appMemberMocks(missingOwnerId, path)
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
        `owner can read strict AppUser membership ${userId}`,
        'ALLOW',
        `apps/misebox-app/users/${userId}`,
        userId
      )
    }),
    read(
      'another member cannot read AppUser membership',
      'DENY',
      `apps/misebox-app/users/${regularId}`,
      strangerId
    ),
    read(
      'canonical admin can read another AppUser membership',
      'ALLOW',
      `apps/misebox-app/users/${regularId}`,
      adminId,
      appAdminMocks(adminId, path)
    ),
    readResource(
      'canonical admin can read sparse AppUser membership',
      'ALLOW',
      sparseMembershipProbePath,
      adminId,
      sparseMembershipProbeData,
      appAdminMocks(adminId, path)
    ),
    readResource(
      'canonical admin can read partial AppUser Workspace targets',
      'ALLOW',
      sparseMembershipProbePath,
      adminId,
      sparseMembershipProbeData,
      appAdminMocks(adminId, path)
    ),
    readResource(
      'canonical admin cannot read invalid AppUser onboarding status',
      'DENY',
      sparseMembershipProbePath,
      adminId,
      {
        ...sparseMembershipProbeData,
        onboarding_status: 'forged',
      },
      appAdminMocks(adminId, path)
    ),
    list(
      'canonical admin can list bounded sparse AppUser memberships',
      'ALLOW',
      'apps/misebox-app/users',
      adminId,
      appAdminMocks(adminId, path),
      sparseMembershipProbeData,
      { limit: 100 }
    ),
    list(
      'canonical admin cannot list unbounded AppUser memberships',
      'DENY',
      'apps/misebox-app/users',
      adminId,
      appAdminMocks(adminId, path),
      sparseMembershipProbeData,
      { limit: 101 }
    ),
    ...customers.map((document) => {
      const userId = profileOwnerId(document)
      return readResource(
        `Customer can read their own Customer Profile ${userId}`,
        'ALLOW',
        `users/${userId}/profiles/customer`,
        userId,
        {
          ...firestoreRulesResource(document).data,
          kind: 'customer',
        }
      )
    }),
    read(
      'another user cannot read a Customer Profile',
      'DENY',
      `users/${customerId}/profiles/customer`,
      strangerId
    ),
    ...appDrivers.map((document) => {
      const userId = profileOwnerId(document)
      return readResource(
        `Driver can read their own App state ${userId}`,
        'ALLOW',
        `users/${userId}/profiles/driver/app-state/misebox-app`,
        userId,
        {
          ...firestoreRulesResource(document).data,
          profile_kind: 'driver',
          app_id: 'misebox-app',
        },
        appMemberMocks(userId, path)
      )
    }),
    read(
      'removed Driver cannot keep reading Driver App state',
      'DENY',
      `users/${driverId}/profiles/driver/app-state/misebox-app`,
      driverId
    ),
    read(
      'another user cannot read Driver App state',
      'DENY',
      `users/${driverId}/profiles/driver/app-state/misebox-app`,
      strangerId
    ),
    deniedUpdate(
      'Driver cannot self-grant Kitchen authority',
      `users/${driverId}/profiles/driver/app-state/misebox-app`,
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
    ...driverProfiles.map((document) => {
      const userId = profileOwnerId(document)
      return readResource(
        `anonymous can read an exact Driver Profile ${userId}`,
        'ALLOW',
        `users/${userId}/profiles/driver`,
        undefined,
        {
          ...firestoreRulesResource(document).data,
          kind: 'driver',
        },
        canonicalUserMocks(userId, path, documentsByPath)
      )
    }),
    list('retired root Driver listing remains denied', 'DENY', 'drivers'),
    ...[
      ['agents', agents],
      ['chefs', chefs],
      ['professionals', professionals],
    ].flatMap(([collectionName, documents]) => [
      ...documents.map((document) => {
        const userId = profileOwnerId(document)
        return readResource(
          `anonymous cannot read exact ${collectionName}/${userId} Profile`,
          'DENY',
          `users/${userId}/profiles/${collectionName.slice(0, -1)}`,
          undefined,
          {
            ...firestoreRulesResource(document).data,
            kind: collectionName.slice(0, -1),
          }
        )
      }),
      ...documents.map((document) => {
        const userId = profileOwnerId(document)
        return readResource(
          `owner can read their ${collectionName}/${userId} Profile`,
          'ALLOW',
          `users/${userId}/profiles/${collectionName.slice(0, -1)}`,
          userId,
          {
            ...firestoreRulesResource(document).data,
            kind: collectionName.slice(0, -1),
          }
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
      `users/${agentProfileId}/profiles/agent`,
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
        `users/${agentProfileId}/profiles/agent`,
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
      `users/${chefProfileId}/profiles/chef`,
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
      `users/${chefProfileId}/profiles/chef`,
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
      `users/${chefProfileId}/profiles/chef`,
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
        `users/${chefProfileId}/profiles/chef`,
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
        `users/${professionalProfileId}/profiles/professional`,
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
      `users/${professionalProfileId}/profiles/professional`,
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
      `users/${professionalProfileId}/profiles/professional`,
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
        `users/${professionalProfileId}/profiles/professional`,
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
      'Kitchen Team without managing App membership cannot read the Kitchen',
      'DENY',
      rootKitchenProbePath,
      regularId,
      rootKitchenProbeData,
      workspaceAuthorityMocks(regularId, path, {
        appId: 'security-rules-tenant',
        collectionName: 'kitchens',
        workspaceId: 'security-rules-probe',
        membershipExists: false,
        teamRole: 'operator',
      })
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
        app_name: 'Misebox',
        app_short_name: 'Misebox',
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
    deniedCreate(
      'App admin cannot create a Kitchen root in the browser',
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
        join_requests: Array.from(
          { length: 101 },
          (_, index) => `user-${index}`
        ),
      },
      writeTime,
      appAdminMocks(adminId, path)
    ),
    deniedUpdate(
      'App admin cannot update a Kitchen root in the browser',
      appKitchenProbePath,
      adminId,
      appKitchenProbeData,
      { ...appKitchenProbeData, join_requests: ['requester'] },
      appAdminMocks(adminId, path),
      updateTime
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
      kitchenOperatorMocks(regularId, path, 'security-rules-authority-probe')
    ),
    readResource(
      'Kitchen Team member can read the exact Kitchen root',
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
      'Kitchen Team member cannot mutate the Kitchen root',
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
      'kitchens/security-rules-probe/ingredients',
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
      `kitchens/security-rules-probe/ingredients/${inactiveIngredientId}`,
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
        Object.entries(kitchenIngredientData(regularId)).filter(
          ([field]) => field !== 'updated'
        )
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
      'Kitchen team member can read a Station from their Kitchen',
      'ALLOW',
      kitchenStationProbePath,
      regularId,
      kitchenStationProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    allowedCreate(
      'Kitchen operator can create a valid Station',
      kitchenStationProbePath,
      regularId,
      kitchenStationProbeData,
      writeTime,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      })
    ),
    ...[
      ['schema pollution', { ...kitchenStationProbeData, forged: true }],
      [
        'oversized description',
        { ...kitchenStationProbeData, description: 'x'.repeat(2001) },
      ],
      ['invalid sort type', { ...kitchenStationProbeData, sort_order: '1' }],
      [
        'forged Kitchen scope',
        { ...kitchenStationProbeData, kitchen_id: 'another-kitchen' },
      ],
      [
        'forged create time',
        {
          ...kitchenStationProbeData,
          created: { ...kitchenStationProbeData.created, at: updateTime },
        },
      ],
    ].map(([label, data]) =>
      deniedCreate(
        `Kitchen operator cannot create a Station with ${label}`,
        `${kitchenStationProbePath}-${String(label).replaceAll(' ', '-')}`,
        regularId,
        data,
        writeTime,
        scopedKitchenAuthorityMocks(regularId, path, {
          appId: 'misebox-app',
          kitchenId: 'security-rules-probe',
          operatorIds: [regularId],
          teamIds: [],
        })
      )
    ),
    deniedCreate(
      'Kitchen team member cannot create a Station',
      `${kitchenStationProbePath}-team`,
      regularId,
      kitchenStationProbeData,
      writeTime,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    deniedCreate(
      'Kitchen operator cannot create a Station below a missing AppKitchen',
      `${kitchenStationProbePath}-orphan`,
      regularId,
      kitchenStationProbeData,
      writeTime,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
        supportExists: false,
      })
    ),
    allowedUpdate(
      'Kitchen operator can update mutable Station fields',
      kitchenStationProbePath,
      regularId,
      kitchenStationProbeData,
      {
        ...kitchenStationProbeData,
        name: 'Main grill',
        updated: { at: updateTime, by: regularId },
      },
      updateTime,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      })
    ),
    ...[
      [
        'created stamp',
        {
          ...kitchenStationProbeData,
          created: { ...kitchenStationProbeData.created, by: strangerId },
          updated: { at: updateTime, by: regularId },
        },
      ],
      [
        'schema pollution',
        {
          ...kitchenStationProbeData,
          forged: true,
          updated: { at: updateTime, by: regularId },
        },
      ],
      [
        'oversized name',
        {
          ...kitchenStationProbeData,
          name: 'x'.repeat(121),
          updated: { at: updateTime, by: regularId },
        },
      ],
    ].map(([label, data]) =>
      deniedUpdate(
        `Kitchen operator cannot update Station ${label}`,
        kitchenStationProbePath,
        regularId,
        kitchenStationProbeData,
        data,
        scopedKitchenAuthorityMocks(regularId, path, {
          appId: 'misebox-app',
          kitchenId: 'security-rules-probe',
          operatorIds: [regularId],
          teamIds: [],
        })
      )
    ),
    allowedDelete(
      'Kitchen operator can delete a Station from their Kitchen',
      kitchenStationProbePath,
      regularId,
      kitchenStationProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        teamIds: [],
      })
    ),
    deniedDelete(
      'Kitchen team member cannot delete a Station',
      kitchenStationProbePath,
      regularId,
      kitchenStationProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    readResource(
      'Kitchen team member can read a Prep Item from their Kitchen',
      'ALLOW',
      kitchenPrepItemProbePath,
      regularId,
      kitchenPrepItemProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    allowedCreate(
      'Kitchen operator can create a valid Prep Item',
      kitchenPrepItemProbePath,
      regularId,
      kitchenPrepItemProbeData,
      writeTime,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
      })
    ),
    ...[
      ['schema pollution', { ...kitchenPrepItemProbeData, forged: true }],
      [
        'missing slug',
        Object.fromEntries(
          Object.entries(kitchenPrepItemProbeData).filter(
            ([field]) => field !== 'slug'
          )
        ),
      ],
      [
        'forged Kitchen scope',
        {
          ...kitchenPrepItemProbeData,
          kitchen_id: 'another-kitchen',
        },
      ],
      [
        'malformed input',
        {
          ...kitchenPrepItemProbeData,
          inputs: [
            {
              ingredient_id: 'onion',
              quantity: -1,
              unit: 'g',
              preparation: '',
            },
          ],
        },
      ],
      [
        'invalid input unit',
        {
          ...kitchenPrepItemProbeData,
          inputs: [
            {
              ingredient_id: 'onion',
              quantity: 1,
              unit: 'kg',
              preparation: '',
            },
          ],
        },
      ],
      [
        'too many inputs',
        {
          ...kitchenPrepItemProbeData,
          inputs: Array.from({ length: 13 }, (_, index) => ({
            ingredient_id: `ingredient-${index}`,
            quantity: 1,
            unit: 'g',
            preparation: '',
          })),
        },
      ],
      [
        'malformed yield',
        {
          ...kitchenPrepItemProbeData,
          yield: { quantity: '850', unit: 'g' },
        },
      ],
      [
        'oversized method',
        {
          ...kitchenPrepItemProbeData,
          method: Array.from({ length: 21 }, () => 'Prepare safely.'),
        },
      ],
      [
        'empty method step',
        {
          ...kitchenPrepItemProbeData,
          method: [''],
        },
      ],
      [
        'forged create time',
        {
          ...kitchenPrepItemProbeData,
          created: { ...kitchenPrepItemProbeData.created, at: updateTime },
        },
      ],
    ].map(([label, data]) =>
      deniedCreate(
        `Kitchen operator cannot create a Prep Item with ${label}`,
        kitchenPrepItemProbePath,
        regularId,
        data,
        writeTime,
        scopedKitchenAuthorityMocks(regularId, path, {
          appId: 'misebox-app',
          kitchenId: 'security-rules-probe',
          operatorIds: [regularId],
        })
      )
    ),
    deniedCreate(
      'Kitchen team member cannot create a Prep Item',
      kitchenPrepItemProbePath,
      regularId,
      kitchenPrepItemProbeData,
      writeTime,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    deniedCreate(
      'Kitchen operator cannot create a Prep Item below a missing AppKitchen',
      kitchenPrepItemProbePath,
      regularId,
      kitchenPrepItemProbeData,
      writeTime,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
        supportExists: false,
      })
    ),
    allowedUpdate(
      'Kitchen operator can update mutable Prep Item fields',
      kitchenPrepItemProbePath,
      regularId,
      kitchenPrepItemProbeData,
      {
        ...kitchenPrepItemProbeData,
        method: [...kitchenPrepItemProbeData.method, 'Hold chilled.'],
        updated: { at: updateTime, by: regularId },
      },
      updateTime,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
      })
    ),
    ...[
      [
        'created stamp',
        {
          ...kitchenPrepItemProbeData,
          created: { ...kitchenPrepItemProbeData.created, by: strangerId },
          updated: { at: updateTime, by: regularId },
        },
      ],
      [
        'schema pollution',
        {
          ...kitchenPrepItemProbeData,
          forged: true,
          updated: { at: updateTime, by: regularId },
        },
      ],
    ].map(([label, data]) =>
      deniedUpdate(
        `Kitchen operator cannot update Prep Item ${label}`,
        kitchenPrepItemProbePath,
        regularId,
        kitchenPrepItemProbeData,
        data,
        scopedKitchenAuthorityMocks(regularId, path, {
          appId: 'misebox-app',
          kitchenId: 'security-rules-probe',
          operatorIds: [regularId],
        })
      )
    ),
    allowedDelete(
      'Kitchen operator can delete a Prep Item from their Kitchen',
      kitchenPrepItemProbePath,
      regularId,
      kitchenPrepItemProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        operatorIds: [regularId],
      })
    ),
    deniedDelete(
      'Kitchen team member cannot delete a Prep Item',
      kitchenPrepItemProbePath,
      regularId,
      kitchenPrepItemProbeData,
      scopedKitchenAuthorityMocks(regularId, path, {
        appId: 'misebox-app',
        kitchenId: 'security-rules-probe',
        teamIds: [regularId],
      })
    ),
    read(
      'Prep Item nested documents are denied',
      'DENY',
      `${kitchenPrepItemProbePath}/private/secret`,
      regularId
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
    list(
      'Kitchen operator cannot list raw Kitchen roots',
      'DENY',
      'kitchens',
      regularId,
      kitchenOperatorMocks(regularId, path),
      rootKitchenProbeData
    ),
    list(
      'Kitchen Team member cannot list raw Kitchen roots',
      'DENY',
      'kitchens',
      regularId,
      targetAuthorityMocks(regularId, path, {
        collectionName: 'kitchens',
        targetId: 'security-rules-probe',
        teamIds: [regularId],
      }),
      rootKitchenProbeData
    ),
    list(
      'Kitchen member cannot list nonmatching target rows',
      'DENY',
      'kitchens',
      regularId,
      appMemberMocks(regularId, path),
      rootKitchenProbeData
    ),
    read(
      'granted Driver cannot read full Kitchen order documents',
      'DENY',
      'kitchens/security-rules-probe/orders/private-order',
      driverId,
      appMemberMocks(driverId, path)
    ),
    read(
      'Kitchen team member cannot read full Kitchen order documents',
      'DENY',
      'kitchens/security-rules-probe/orders/private-order',
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
      'kitchens/security-rules-probe/sales',
      regularId,
      kitchenOperatorMocks(regularId, path)
    ),
    read('anonymous cannot read an immutable Sale', 'DENY', saleProbePath),
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
      'Supplier Team member can read the exact Supplier root',
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
    deniedCreate(
      'App admin cannot create a Supplier root in the browser',
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
        join_requests: Array.from(
          { length: 101 },
          (_, index) => `user-${index}`
        ),
      },
      writeTime,
      appAdminMocks(adminId, path)
    ),
    deniedUpdate(
      'App admin cannot update a Supplier root in the browser',
      appSupplierProbePath,
      adminId,
      appSupplierProbeData,
      { ...appSupplierProbeData, join_requests: ['requester'] },
      appAdminMocks(adminId, path),
      updateTime
    ),
    deniedUpdate(
      'Supplier operator cannot mutate the Supplier root',
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
      'Supplier Team member cannot mutate the Supplier root',
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
    readResource(
      'existing Place exact read is available without authentication',
      'ALLOW',
      'places/security-probe',
      '',
      { name: 'Security probe', place_type: 'physical' }
    ),
    read(
      'missing Place exact read remains denied',
      'DENY',
      'places/security-missing'
    ),
    list('Place collection list remains denied', 'DENY', 'places'),
    deniedCreate(
      'browser cannot create a Place',
      'places/security-probe',
      strangerId,
      { name: 'Forged Place', place_type: 'physical' }
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
      },
      updateTime
    ),
    allowedUpdate(
      'owner can remove optional public User bio',
      `users/${publicUserId}`,
      publicUserId,
      publicUserDataWithBio,
      publicUserDataWithoutBio,
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
        fixturePathSha256: ecosystemAvatarUserId
          ? sha256(`users/${ecosystemAvatarUserId}`)
          : null,
      },
    },
  }
}

async function executeSecurityTests(testTarget, includeSource) {
  const { tests: securityTests, fixtureEvidence } = await buildSecurityTests()
  for (const test of securityTests) {
    const mocks = test.testCase.functionMocks || []
    if (
      !Array.isArray(mocks) ||
      mocks.some(
        (mock) =>
          !mock ||
          typeof mock !== 'object' ||
          typeof mock.function !== 'string' ||
          !Array.isArray(mock.args)
      )
    ) {
      throw new Error(
        `Invalid Rules function mocks in ${test.name}: ${JSON.stringify(mocks)}`
      )
    }
  }
  const batchSize = 25
  const batches = Array.from(
    { length: Math.ceil(securityTests.length / batchSize) },
    (_, index) =>
      securityTests.slice(index * batchSize, (index + 1) * batchSize)
  )
  const batchResults = []
  for (const batch of batches) {
    batchResults.push(
      await api(`${testTarget}:test`, {
        method: 'POST',
        body: {
          ...(includeSource ? { source } : {}),
          testSuite: {
            testCases: batch.map(({ testCase }) => testCase),
          },
        },
      })
    )
  }
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
  const workspaceRoots = [
    'kitchens/security-rules-probe',
    'suppliers/security-rules-supplier-probe',
  ]
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
    ...workspaceRoots.flatMap((workspacePath) => {
      const rootPath = path(workspacePath)
      const [collectionName, workspaceId] = workspacePath.split('/')
      const teamPath = path(`${collectionName}/${workspaceId}/team/${adminId}`)
      return [
        {
          function: 'exists',
          args: [{ exactValue: rootPath }],
          result: { value: true },
        },
        {
          function: 'get',
          args: [{ exactValue: rootPath }],
          result: { value: { data: { management: { mode: 'workspace' } } } },
        },
        {
          function: 'get',
          args: [{ exactValue: teamPath }],
          result: { value: { data: {} } },
        },
      ]
    }),
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

function workspaceAuthorityMocks(userId, path, options) {
  const appId = String(options.appId || 'misebox-app').trim()
  const collectionName = String(options.collectionName || '').trim()
  const workspaceId = String(
    options.workspaceId || options.targetId || ''
  ).trim()
  const rootExists = options.rootExists !== false
  const membershipExists = options.membershipExists !== false
  const teamRole = String(options.teamRole || '').trim()
  const membershipRole = options.appRole === 'admin' ? 'admin' : 'user'
  const membershipPath = path(`apps/${appId}/users/${userId}`)
  const rootPath = path(`${collectionName}/${workspaceId}`)
  const teamPath = path(`${collectionName}/${workspaceId}/team/${userId}`)
  const management =
    appId === 'misebox-app'
      ? { mode: 'workspace' }
      : { mode: 'app', app_id: appId }
  return [
    {
      function: 'exists',
      args: [{ exactValue: rootPath }],
      result: { value: rootExists },
    },
    {
      function: 'get',
      args: [{ exactValue: rootPath }],
      result: { value: { data: rootExists ? { management } : {} } },
    },
    {
      function: 'exists',
      args: [{ exactValue: membershipPath }],
      result: { value: membershipExists },
    },
    {
      function: 'get',
      args: [{ exactValue: membershipPath }],
      result: {
        value: { data: membershipExists ? { role: membershipRole } : {} },
      },
    },
    {
      function: 'exists',
      args: [{ exactValue: teamPath }],
      result: { value: Boolean(teamRole) },
    },
    {
      function: 'get',
      args: [{ exactValue: teamPath }],
      result: {
        value: {
          data: teamRole
            ? {
                user_id: userId,
                role: teamRole,
                permissions: [],
                status: 'active',
              }
            : {},
        },
      },
    },
  ]
}

function scopedKitchenAuthorityMocks(userId, path, options) {
  const operatorIds = Array.isArray(options.operatorIds)
    ? options.operatorIds
    : []
  const teamIds = Array.isArray(options.teamIds) ? options.teamIds : []
  return workspaceAuthorityMocks(userId, path, {
    appId: options.appId,
    appRole: options.role,
    collectionName: 'kitchens',
    workspaceId: options.kitchenId,
    rootExists: options.supportExists,
    teamRole: operatorIds.includes(userId)
      ? 'operator'
      : teamIds.includes(userId)
        ? 'member'
        : '',
  })
}

function missingKitchenSupportMocks(path, appId, kitchenId) {
  return workspaceAuthorityMocks('missing-workspace-user', path, {
    appId,
    collectionName: 'kitchens',
    workspaceId: kitchenId,
    rootExists: false,
  })
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

function kitchenOperatorMocks(
  userId,
  path,
  kitchenId = 'security-rules-probe'
) {
  return workspaceAuthorityMocks(userId, path, {
    collectionName: 'kitchens',
    workspaceId: kitchenId,
    teamRole: 'operator',
  })
}

function targetAuthorityMocks(userId, path, options) {
  const operatorIds = Array.isArray(options.operatorIds)
    ? options.operatorIds
    : []
  const teamIds = Array.isArray(options.teamIds) ? options.teamIds : []
  return workspaceAuthorityMocks(userId, path, {
    appId: options.appId,
    collectionName: options.collectionName,
    workspaceId: options.targetId,
    teamRole: operatorIds.includes(userId)
      ? 'operator'
      : teamIds.includes(userId)
        ? 'member'
        : '',
  })
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

async function readUserProfiles(users, kind) {
  return (
    await Promise.all(
      users.map((document) =>
        firestoreMaybeGet(`users/${documentId(document)}/profiles/${kind}`)
      )
    )
  ).filter(Boolean)
}

async function readUserProfileAppStates(users, kind, appId) {
  return (
    await Promise.all(
      users.map((document) =>
        firestoreMaybeGet(
          `users/${documentId(document)}/profiles/${kind}/app-state/${appId}`
        )
      )
    )
  ).filter(Boolean)
}

function profileOwnerId(document) {
  const segments = documentPath(document).split('/')
  if (segments[0] !== 'users' || !segments[1]) {
    throw new Error(
      `Profile fixture is not User-owned: ${documentPath(document)}`
    )
  }
  return segments[1]
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
