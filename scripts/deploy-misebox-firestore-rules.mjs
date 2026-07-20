#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: compile, back up, stage, promote, or roll back Misebox named-database Firestore Security Rules through the Firebase Rules REST API.
// Concurrent edit — 2026-07-20 12:41 CEST — Security spine: gate promotion on exhaustive public fixtures, query cases, and private authority attacks.
// Concurrent edit — 2026-07-20 13:44 CEST — User/profile security pass: exercise trusted-only identity, handle, overlay, grant, and full-order boundaries.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: cover owner get-before-create and canonical User profile binding.
// Concurrent edit — 2026-07-20 13:42 CEST — Security rollout gate: require migration evidence and block unproven raw-root cutovers.

import process from 'node:process'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const PROJECT_ID = 'misebox-78f9c'
const SIMULATION_DATABASE_ID = 'misebox-simulation'
const PRODUCTION_DATABASE_ID = 'misebox'
const RULES_PATH = new URL(
  './firebase/misebox/firestore.rules',
  import.meta.url
)
const API = 'https://firebaserules.googleapis.com/v1'
const BLOCKED_PRODUCTION_ROOTS = [
  'blogs',
  'companies',
  'ecosystems',
  'ingredients',
  'jobs',
  'kitchens',
  'menus',
  'places',
  'portfolios',
  'products',
  'properties',
  'suppliers',
]
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

const resolved = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const access = await resolved.credential.getAccessToken()
const accessToken = String(access?.access_token || '').trim()
if (!accessToken) throw new Error('Firebase credential returned no access token.')

const content = await readFile(RULES_PATH, 'utf8')
const source = { files: [{ name: 'firestore.rules', content }] }
const sourceSha256 = sha256(content)
const compilation = await api(`projects/${PROJECT_ID}:test`, {
  method: 'POST',
  body: { source, testSuite: { testCases: [] } },
})
const errors = (compilation.issues || []).filter(
  (issue) => issue.severity === 'ERROR'
)
if (errors.length) {
  throw new Error(`Rules compilation failed:\n${formatIssues(errors)}`)
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
  console.log(
    JSON.stringify(
      {
        mode: args.testSimulation ? 'test-simulation' : 'test-security',
        projectId: PROJECT_ID,
        databaseId: PRODUCTION_DATABASE_ID,
        credentialSource: resolved.source,
        sourceSha256,
        ...(simulation ? { rulesetName: simulation.rulesetName } : {}),
        issues: security.issues,
        tests: security.tests,
      },
      null,
      2
    )
  )
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
    throw new Error('Migration prerequisites changed during production verification.')
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
  const [privateMarker, recoveryMarker, boundaryMarker, handleMarker] =
    await Promise.all([
      firestoreMaybeGet('security-migrations/user-private-v1'),
      firestoreMaybeGet('security-migrations/user-profile-recovery-v1'),
      firestoreMaybeGet('security-migrations/user-profile-boundary-v3'),
      firestoreMaybeGet('user-handle-state/canonical'),
    ])
  const decoded = {
    private: decodeFirestoreFields(privateMarker?.fields || {}),
    recovery: decodeFirestoreFields(recoveryMarker?.fields || {}),
    boundary: decodeFirestoreFields(boundaryMarker?.fields || {}),
    handles: decodeFirestoreFields(handleMarker?.fields || {}),
  }
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
    decoded.recovery.schema_version !== 1 ||
    decoded.recovery.complete !== true ||
    decoded.recovery.notification_count !== 23 ||
    decoded.recovery.meaningful_bio_count !== 2 ||
    !/^[a-f0-9]{64}$/.test(String(decoded.recovery.source_backup_sha256 || ''))
  ) {
    failures.push('legacy notification/profile recovery is missing or incomplete')
  }
  if (
    decoded.boundary.schema_version !== 3 ||
    decoded.boundary.complete !== true ||
    decoded.boundary.app_id !== 'misebox-app' ||
    decoded.boundary.user_count !== decoded.private.user_count
  ) {
    failures.push('User/Profile boundary hardening is missing or stale')
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

const rollbackRuleset = await getRuleset(args.rollback.rulesetName)
const rollbackContent = rollbackRuleset.source?.files?.find(
  (file) => file.name === 'firestore.rules'
)?.content
if (!rollbackContent) throw new Error('Rollback ruleset has no firestore.rules.')
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
      if (![SIMULATION_DATABASE_ID, PRODUCTION_DATABASE_ID].includes(databaseId)) {
        throw new Error('--rollback database must be misebox-simulation or misebox.')
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
  ] =
    await Promise.all([
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
  const privateDocuments = (await Promise.all(
    users.map((document) =>
      firestoreMaybeGet(`users/${documentId(document)}/private/account`)
    )
  )).filter(Boolean)
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
  const appDocument = await firestoreGet('apps/misebox-app')
  for (const [label, value] of Object.entries({
    publicUserId,
    adminId,
    regularId,
    customerId,
    driverId,
  })) {
    if (!value) throw new Error(`Security test fixture is missing: ${label}.`)
  }
  const strangerId = 'security-rules-attacker'
  const missingOwnerId = 'security-rules-missing-owner'
  const defaultDeniedRoots = [
    'blogs',
    'companies',
    'ecosystems',
    'ingredients',
    'jobs',
    'kitchens',
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
    ]
      .map((document) => [documentPath(document), document])
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
        ...(uid ? { auth: auth(uid, provider) } : {}),
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
  const list = (name, expectation, value, uid, functionMocks = []) => ({
    name,
    testCase: {
      expectation,
      request: {
        ...(uid ? { auth: auth(uid) } : {}),
        path: path(value),
        method: 'list',
      },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
      expressionReportLevel: 'VISITED',
    },
  })
  const deniedCreate = (name, value, uid, data) => ({
    name,
    testCase: {
      expectation: 'DENY',
      request: {
        auth: auth(uid),
        path: path(value),
        method: 'create',
        resource: { data },
      },
      pathEncoding: 'PLAIN',
    },
  })
  const allowedCreate = (
    name,
    value,
    uid,
    data,
    time,
    functionMocks = []
  ) => ({
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
    },
  })
  const deniedUpdate = (name, value, uid, currentData, nextData, functionMocks = []) => ({
    name,
    testCase: {
      expectation: 'DENY',
      request: {
        auth: auth(uid),
        path: path(value),
        method: 'update',
        resource: { data: nextData },
      },
      resource: { data: currentData },
      ...(functionMocks.length ? { functionMocks } : {}),
      pathEncoding: 'PLAIN',
    },
  })
  const appDriverDocument = appDrivers.find(
    (document) => documentId(document) === driverId
  )
  const appDriverData = firestoreRulesResource(appDriverDocument).data
  return [
    list('raw public User collection listing uses projection API', 'DENY', 'users'),
    list('raw public App collection listing uses projection API', 'DENY', 'apps'),
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
      (collectionName) => read(
        `owner can get missing App ${collectionName} row before create`,
        'ALLOW',
        `apps/misebox-app/${collectionName}/${missingOwnerId}`,
        missingOwnerId,
        appMemberMocks(missingOwnerId, path)
      )
    ),
    ...['drivers', 'agents', 'chefs', 'professionals'].map(
      (collectionName) => read(
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
      'security-migrations/user-profile-boundary-v3',
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
    list(
      'canonical admin can list UserApp memberships',
      'ALLOW',
      'apps/misebox-app/users',
      adminId,
      appAdminMocks(adminId, path)
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
          `anonymous can read strict public ${collectionName}/${userId}`,
          'ALLOW',
          `${collectionName}/${userId}`,
          undefined,
          canonicalUserMocks(userId, path, documentsByPath)
        )
      }),
      list(
        `raw ${collectionName} listing uses projection API`,
        'DENY',
        collectionName
      ),
    ]),
    read('anonymous can read strict public App', 'ALLOW', 'apps/misebox-app'),
    read(
      'granted Driver cannot read full Kitchen order documents',
      'DENY',
      'apps/misebox-app/kitchens/security-rules-probe/orders/private-order',
      driverId,
      appMemberMocks(driverId, path)
    ),
    read(
      'membership blocks remain server-only',
      'DENY',
      `apps/misebox-app/membership-blocks/${regularId}`,
      regularId
    ),
    read('root Customer documents remain server-only', 'DENY', 'customers/probe'),
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
    allowedCreate(
      'owner can create domain-only Driver after canonical User exists',
      `drivers/${publicUserId}`,
      publicUserId,
      {
        title: '',
        subtitle: '',
        tagline: '',
        tags: [],
        coverage: { radius_m: 1500 },
        created: {
          at: '2026-07-20T12:00:00Z',
          by: publicUserId,
        },
        updated: {
          at: '2026-07-20T12:00:00Z',
          by: publicUserId,
        },
      },
      '2026-07-20T12:00:00Z',
      canonicalUserMocks(publicUserId, path, documentsByPath)
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
}

async function executeSecurityTests(testTarget, includeSource) {
  const securityTests = await buildSecurityTests()
  const result = await api(`${testTarget}:test`, {
    method: 'POST',
    body: {
      ...(includeSource ? { source } : {}),
      testSuite: {
        testCases: securityTests.map(({ testCase }) => testCase),
      },
    },
  })
  const testResults = securityTests.map((test, index) => {
    const raw = result.testResults?.[index] || {}
    const state = raw.state || 'MISSING'
    return {
      name: test.name,
      expectation: test.testCase.expectation,
      state,
      ...(state === 'SUCCESS'
        ? {}
        : {
            debugMessages: raw.debugMessages || [],
            failedExpressions: (raw.visitedExpressions || [])
              .filter((expression) => expression.value === false)
              .map((expression) => expression.sourcePosition),
          }),
    }
  })
  const failures = testResults.filter((test) => test.state !== 'SUCCESS')
  if (failures.length) {
    throw new Error(`Security tests failed:\n${JSON.stringify(failures, null, 2)}`)
  }
  return { issues: result.issues || [], tests: testResults }
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
    throw new Error(`Google API GET failed (HTTP ${response.status}): ${JSON.stringify(payload)}`)
  }
  return payload
}

function documentId(document) {
  return String(document?.name || '').split('/').at(-1) || ''
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
        key === 'avatar' && typeof decoded === 'string' && decoded.startsWith('/')
          ? `https://example.invalid${decoded}`
          : decoded
      return [key, fixtureValue]
    })
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
    throw new Error(`${databaseId} release did not retain the expected ruleset.`)
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
  await writeFile(
    path,
    `${JSON.stringify(
      {
        format: 'fireux-misebox-rules-backup/1',
        createdAt: new Date().toISOString(),
        projectId: PROJECT_ID,
        releases,
      },
      null,
      2
    )}\n`,
    { flag: 'wx', mode: 0o600 }
  )
  return path
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function formatIssues(issues) {
  return issues
    .map((issue) => {
      const position = issue.sourcePosition || {}
      return `${position.fileName || 'firestore.rules'}:${position.line || '?'}:${position.column || '?'} ${issue.description}`
    })
    .join('\n')
}
