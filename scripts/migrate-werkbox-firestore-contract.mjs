#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-21
// usage_note: validate or explicitly apply a protected Werkbox canonical-data plan before strict Firestore Rules are released.
// Concurrent edit — 2026-07-21 14:40 CEST — Werkbox Firebase hardening: require live trusted APIs and deny-all quarantine before an inventory-verified canonical migration.

import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import {
  FieldValue,
  getFirestore,
  Timestamp,
} from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { buildWerkboxServerSourceEvidence } from './_lib/werkbox-security-contract.mjs'

const PROJECT_ID = 'cleanbox-f15bc'
const DATABASE_ID = 'cleanbox'
const TARGET_CONFIRMATION = `${PROJECT_ID}/${DATABASE_ID}`
const CUTOVER_CONFIRMATION = 'werkbox-server-api-v1'
const SERVER_API_BASE_URL = 'https://cleanbox.web.app'
const PLAN_FORMAT = 'fireux-werkbox-firestore-migration-plan/1'
const MIGRATION_MARKER_PATH =
  'security-migrations/werkbox-firestore-rules-v1'
const SERVER_API_CUTOVERS = Object.freeze({
  jobs: 'trusted-api-v1',
  places: 'trusted-api-v1',
  companies: 'trusted-api-v1',
  products: 'disabled-v1',
  blogs: 'disabled-v1',
  professional_structured_experience: 'trusted-api-v1',
  app_admin_people: 'trusted-api-v1',
})
const ALLOWED_ROOTS = new Set([
  'agents',
  'apps',
  'security-migrations',
  'user-handles',
  'user-handle-state',
  'users',
])
const ALLOWED_ARGS = new Set([
  'apply',
  'backup',
  'confirm',
  'confirm-cutovers',
  'database',
  'help',
  'plan',
  'project',
  'service-account',
])
const execFileAsync = promisify(execFile)
const RULES_API = 'https://firebaserules.googleapis.com/v1'
const REPO_ROOT = fileURLToPath(new URL('../', import.meta.url))
const PLANNER_PATH = fileURLToPath(
  new URL('./plan-werkbox-firestore-migration.mjs', import.meta.url)
)
const CANDIDATE_RULES_PATH = fileURLToPath(
  new URL('./firebase/werkbox/firestore.rules', import.meta.url)
)
const QUARANTINE_RULES_PATH = fileURLToPath(
  new URL('./firebase/werkbox/firestore-quarantine.rules', import.meta.url)
)
const SERVER_API_PROBES = [
  {
    baseUrl: 'https://cleanbox.web.app',
    method: 'GET',
    path: '/api/internal/jobs',
  },
  {
    baseUrl: 'https://cleanbox.web.app',
    method: 'POST',
    path: '/api/places/ensure',
  },
  {
    baseUrl: 'https://cleanbox.web.app',
    method: 'POST',
    path: '/api/companies/materialize',
  },
  {
    baseUrl: 'https://cleanbox.web.app',
    method: 'PATCH',
    path: '/api/internal/profiles/professional/structured',
  },
  ...['https://cleanbox.web.app', 'https://richies-reinigung.web.app'].flatMap(
    (baseUrl) => [
      { baseUrl, method: 'POST', path: '/api/internal/app/membership' },
      { baseUrl, method: 'POST', path: '/api/internal/user/account' },
      { baseUrl, method: 'POST', path: '/api/internal/user/handle' },
      { baseUrl, method: 'GET', path: '/api/internal/app/people' },
    ]
  ),
]
const SERVER_CONTRACT_HOSTS = Object.freeze({
  'https://cleanbox.web.app': 'cleanbox-app',
  'https://richies-reinigung.web.app': 'richies-reinigung',
})
const KNOWN_DESCENDANT_COLLECTION_IDS = Object.freeze([
  'users',
  'agents',
  'professionals',
  'private',
  'notifications',
  'join-requests',
  'membership-blocks',
])

const args = parseArgs(process.argv.slice(2))
for (const token of process.argv.slice(2)) {
  if (!token.startsWith('--')) continue
  const key = token.slice(2).split('=')[0]
  if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option: --${key}`)
}

if (args.help) {
  console.log(`
Validate or apply a protected Werkbox Firestore migration plan.

Dry-run validation (remote reads only):
  node scripts/migrate-werkbox-firestore-contract.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} \\
    --plan /private/tmp/werkbox-firestore-plan.json

Explicit apply (remote writes; requires separate approval):
  node scripts/migrate-werkbox-firestore-contract.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} \\
    --plan /private/tmp/werkbox-firestore-plan.json \\
    --apply --confirm ${TARGET_CONFIRMATION} \\
    --confirm-cutovers ${CUTOVER_CONFIRMATION} \\
    --backup /private/tmp/werkbox-firestore-preimage.json

The executor accepts only create/replace operations from the fixed planner. An
apply additionally proves that production is on the tracked deny-all quarantine
source, verifies the deployed trusted APIs twice, binds a local source manifest,
writes a new mode-0600 full preimage, applies only canonical data in one
transaction, verifies the complete Firestore/Auth inventory, and creates the
release marker last in a separate transaction. A failed gate leaves no marker,
so strict Rules cannot be promoted accidentally.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const projectId = requireExactTarget('project', PROJECT_ID)
const databaseId = requireExactTarget('database', DATABASE_ID)
const apply = args.apply === true
const planPath = requirePrivateTmpPath('plan', args.plan)
const backupPath = apply
  ? requirePrivateTmpPath('backup', args.backup)
  : optionalPrivateTmpPath('backup', args.backup)

if (apply && String(args.confirm ?? '').trim() !== TARGET_CONFIRMATION) {
  throw new Error(`--confirm ${TARGET_CONFIRMATION} is required for --apply.`)
}
if (
  apply &&
  String(args['confirm-cutovers'] ?? '').trim() !== CUTOVER_CONFIRMATION
) {
  throw new Error(
    `--confirm-cutovers ${CUTOVER_CONFIRMATION} is required after the trusted server routes are deployed.`
  )
}
if (!apply && (args.confirm || args['confirm-cutovers'] || args.backup)) {
  throw new Error(
    '--confirm, --confirm-cutovers, and --backup are accepted only with --apply.'
  )
}

const plan = parseAndValidatePlan(await readFile(planPath, 'utf8'))
const freshPlan = await deriveFreshPlan()
if (
  freshPlan.artifactSha256 !== plan.artifactSha256 ||
  freshPlan.finalPlanSha256 !== plan.finalPlanSha256 ||
  freshPlan.operationSetSha256 !== plan.operationSetSha256
) {
  throw new Error(
    'Protected plan no longer matches a fresh canonical derivation; generate and review a new plan.'
  )
}
const resolved = await resolveFirebaseAdminCredential({
  args,
  scope: 'werkbox',
  projectId,
})
const adminApp = initializeApp(
  { credential: resolved.credential, projectId },
  `werkbox-firestore-migrate-${Date.now()}`
)
const db = getFirestore(adminApp, databaseId)

try {
  const before = await readCurrentOperations(plan.operations)
  const stale = comparePreconditions(plan.operations, before)
  if (stale.length) {
    throw new Error(
      `Plan is stale for ${stale.length} document(s); generate a new protected plan.`
    )
  }

  if (!apply) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          readOnly: true,
          target: { projectId, databaseId },
          planPath,
          finalPlanSha256: plan.finalPlanSha256,
          operations: plan.operations.length,
          preconditionsCurrent: true,
          productionMutated: false,
          nextGate:
            `Stage and test the candidate, deploy the trusted server routes, quarantine ${TARGET_CONFIRMATION}, then run --apply only with explicit approval, --confirm ${TARGET_CONFIRMATION}, --confirm-cutovers ${CUTOVER_CONFIRMATION}, and a new /private/tmp backup path.`,
        },
        null,
        2
      )
    )
  } else {
    const markerOperation = plan.operations.find(
      (operation) => operation.path === MIGRATION_MARKER_PATH
    )
    const dataOperations = plan.operations.filter(
      (operation) => operation.path !== MIGRATION_MARKER_PATH
    )
    const sourceEvidence = await buildServerApiSourceEvidence()
    const candidateRulesSha256 = rawSha256(
      await readFile(CANDIDATE_RULES_PATH, 'utf8')
    )
    const quarantineRulesSha256 = rawSha256(
      await readFile(QUARANTINE_RULES_PATH, 'utf8')
    )
    const preProbe = await probeTrustedServerApis(sourceEvidence.sha256)
    const quarantineEvidence = await assertProductionQuarantine(
      quarantineRulesSha256
    )
    const preInventory = await captureAuthorityInventory()
    const backupPayload = {
      format: 'fireux-werkbox-firestore-preimage/1',
      target: { projectId, databaseId },
      capturedAt: new Date().toISOString(),
      plan: {
        path: planPath,
        operationSetSha256: plan.operationSetSha256,
        finalPlanSha256: plan.finalPlanSha256,
        artifactSha256: plan.artifactSha256,
      },
      prerequisites: {
        candidateRulesSha256,
        quarantineRulesSha256,
        quarantineRulesetName: quarantineEvidence.rulesetName,
        serverApiSourceSha256: sourceEvidence.sha256,
        serverApiProbeSha256: sha256(preProbe),
      },
      authorityInventory: preInventory,
      documents: before.map((entry) => ({
        path: entry.path,
        exists: entry.exists,
        createTime: entry.createTime,
        updateTime: entry.updateTime,
        data: entry.data,
      })),
    }
    const backupArtifact = await writeProtectedJsonArtifact({
      path: backupPath,
      payload: backupPayload,
    })

    await applyTransaction(dataOperations)
    const verification = await verifyResults(dataOperations)
    if (!verification.ok) {
      throw new Error(
        `Post-write verification failed for ${verification.failures.length} document(s). The protected preimage is ${backupArtifact.path}.`
      )
    }
    const postInventory = await captureAuthorityInventory()
    assertInventoryTransition(preInventory, postInventory, dataOperations)
    const postProbe = await probeTrustedServerApis(sourceEvidence.sha256)
    const finalQuarantineEvidence = await assertProductionQuarantine(
      quarantineRulesSha256
    )
    if (
      finalQuarantineEvidence.rulesetName !== quarantineEvidence.rulesetName
    ) {
      throw new Error('Production quarantine release changed during migration.')
    }
    const probeEvidence = {
      before: preProbe,
      after: postProbe,
    }
    const markerPayload = {
      ...markerOperation.payload,
      complete: true,
      completed_at: serverValue('timestamp'),
      source_backup_sha256: backupArtifact.sha256,
      plan_artifact_sha256: plan.artifactSha256,
      final_plan_sha256: plan.finalPlanSha256,
      post_migration_inventory_sha256: sha256(postInventory),
      known_descendant_collection_ids: KNOWN_DESCENDANT_COLLECTION_IDS,
      candidate_rules_sha256: candidateRulesSha256,
      quarantine_rules_sha256: quarantineRulesSha256,
      quarantine_ruleset_name: quarantineEvidence.rulesetName,
      server_api_cutover_version: 1,
      server_api_cutovers: SERVER_API_CUTOVERS,
      server_api_base_url: SERVER_API_BASE_URL,
      server_api_hosts: SERVER_CONTRACT_HOSTS,
      server_api_source_sha256: sourceEvidence.sha256,
      server_api_probe_sha256: sha256(probeEvidence),
      server_api_verified_at: serverValue('timestamp'),
    }
    await finalizeMigrationMarker({
      markerOperation,
      markerPayload,
      dataOperations,
    })
    const markerVerification = await verifyResults([
      { ...markerOperation, payload: markerPayload },
    ])
    if (!markerVerification.ok) {
      throw new Error(
        `Final migration marker verification failed. The protected preimage is ${backupArtifact.path}.`
      )
    }

    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          target: { projectId, databaseId },
          planPath,
          finalPlanSha256: plan.finalPlanSha256,
          dataOperations: dataOperations.length,
          backupArtifact,
          postWriteVerified: true,
          postMigrationInventorySha256: sha256(postInventory),
          serverApiProbeSha256: sha256(probeEvidence),
          serverApiSourceSha256: sourceEvidence.sha256,
          candidateRulesSha256,
          quarantineRulesSha256,
          migrationMarker: MIGRATION_MARKER_PATH,
          migrationMarkerFinalized: true,
          productionStillQuarantined: true,
          candidateRulesPromoted: false,
        },
        null,
        2
      )
    )
  }
} finally {
  await deleteApp(adminApp)
}

async function buildServerApiSourceEvidence() {
  const evidence = await buildWerkboxServerSourceEvidence({
    repoRoot: REPO_ROOT,
  })
  const { files } = evidence
  const packageSources = [
    'projects/werkbox/werkbox-app/package.json',
    'projects/werkbox/richies-reinigung/package.json',
  ].map((targetPath) =>
    files.find((entry) => entry.path === targetPath)?.source
  )
  const nuxtSource = files.find(
    (entry) => entry.path === 'projects/werkbox/werkbox-app/nuxt.config.ts'
  )?.source
  if (packageSources.some((entry) => !entry) || !nuxtSource) {
    throw new Error('Werkbox source manifest is incomplete.')
  }
  for (const packageSource of packageSources) {
    const appPackage = JSON.parse(packageSource)
    for (const disabledPackage of ['fireux-products', 'fireux-blogs']) {
      if (appPackage.dependencies?.[disabledPackage]) {
        throw new Error(
          `Werkbox must remove disabled package ${disabledPackage} before migration.`
        )
      }
    }
  }
  for (const disabledPackage of ['fireux-products', 'fireux-blogs']) {
    if (nuxtSource.includes(`'${disabledPackage}'`)) {
      throw new Error(
        `Werkbox must not configure disabled module ${disabledPackage}.`
      )
    }
  }
  for (const requiredModule of [
    "'fireux-places'",
    "'fireux-companies'",
    "'fireux-jobs'",
  ]) {
    if (!nuxtSource.includes(requiredModule)) {
      throw new Error(`Werkbox source lost required module ${requiredModule}.`)
    }
  }
  return { files: evidence.manifest, sha256: evidence.sha256 }
}

async function probeTrustedServerApis(expectedSourceSha256) {
  const results = []
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
    if (response.status !== 401) {
      throw new Error(
        `Trusted API probe ${probe.method} ${probe.path} expected 401, received ${response.status}.`
      )
    }
    const contentType = String(response.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
    if (contentType !== 'application/json') {
      throw new Error(
        `Trusted API probe ${probe.method} ${probe.path} did not return JSON.`
      )
    }
    results.push({ ...probe, status: response.status, contentType })
  }
  for (const [baseUrl, appId] of Object.entries(SERVER_CONTRACT_HOSTS)) {
    const response = await fetch(
      `${baseUrl}/api/internal/werkbox/security-contract`,
      {
        headers: {
          accept: 'application/json',
          'cache-control': 'no-cache',
        },
        redirect: 'manual',
        signal: AbortSignal.timeout(15_000),
      }
    )
    const payload = await response.json().catch(() => ({}))
    if (
      response.status !== 200 ||
      payload.contract !== 'werkbox-firestore-v1' ||
      payload.source_sha256 !== expectedSourceSha256 ||
      payload.app_id !== appId ||
      payload.project_id !== 'cleanbox' ||
      payload.ecosystem_id !== 'cleanbox' ||
      payload.database_id !== 'cleanbox'
    ) {
      throw new Error(
        `Deployed security contract does not match reviewed source for ${baseUrl}.`
      )
    }
    results.push({
      baseUrl,
      method: 'GET',
      path: '/api/internal/werkbox/security-contract',
      status: response.status,
      appId,
      sourceSha256: expectedSourceSha256,
    })
  }
  return results
}

async function assertProductionQuarantine(expectedSha256) {
  const access = await resolved.credential.getAccessToken()
  const accessToken = String(access?.access_token || '').trim()
  if (!accessToken) throw new Error('Firebase credential returned no access token.')
  const releaseName =
    `projects/${PROJECT_ID}/releases/cloud.firestore/${DATABASE_ID}`
  const release = await rulesApi(releaseName, accessToken)
  const ruleset = await rulesApi(release.rulesetName, accessToken)
  const content = String(
    ruleset?.source?.files?.find((file) => file.name === 'firestore.rules')
      ?.content || ''
  )
  if (rawSha256(content) !== expectedSha256) {
    throw new Error(
      'Production is not on the tracked deny-all quarantine Rules source; migration writes are blocked.'
    )
  }
  return { rulesetName: ruleset.name, sourceSha256: expectedSha256 }
}

async function rulesApi(resourceName, accessToken) {
  const response = await fetch(`${RULES_API}/${resourceName}`, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      `Firebase Rules evidence read failed (HTTP ${response.status}): ${JSON.stringify(payload)}`
    )
  }
  return payload
}

async function captureAuthorityInventory() {
  const authUidHashes = []
  let pageToken
  do {
    const page = await getAuth(adminApp).listUsers(1000, pageToken)
    authUidHashes.push(...page.users.map((user) => rawSha256(user.uid)))
    pageToken = page.pageToken
  } while (pageToken)

  const rootCollections = await db.listCollections()
  const documents = []
  for (const collection of rootCollections) {
    await collectCollectionInventory(collection, documents)
  }
  for (const collectionId of KNOWN_DESCENDANT_COLLECTION_IDS) {
    const snapshot = await db.collectionGroup(collectionId).get()
    for (const document of snapshot.docs) {
      await collectDocumentInventory(document, documents)
    }
  }
  const uniqueDocuments = new Map(
    documents.map((entry) => [entry.path, entry])
  )
  documents.splice(0, documents.length, ...uniqueDocuments.values())
  documents.sort((left, right) => left.path.localeCompare(right.path))
  authUidHashes.sort()
  return {
    authUidHashes,
    rootCollections: rootCollections.map((entry) => entry.id).sort(),
    documents,
  }
}

async function collectCollectionInventory(collection, documents) {
  const snapshot = await collection.get()
  for (const document of snapshot.docs) {
    await collectDocumentInventory(document, documents)
  }
}

async function collectDocumentInventory(document, documents) {
  documents.push({
    path: document.ref.path,
    createTime: timestampToken(document.createTime),
    updateTime: timestampToken(document.updateTime),
  })
  const descendants = await document.ref.listCollections()
  for (const descendant of descendants) {
    await collectCollectionInventory(descendant, documents)
  }
}

function assertInventoryTransition(before, after, operations) {
  if (stableJson(before.authUidHashes) !== stableJson(after.authUidHashes)) {
    throw new Error('Firebase Auth identity inventory changed during migration.')
  }
  const createPaths = new Set(
    operations
      .filter((operation) => operation.action === 'create')
      .map((operation) => operation.path)
  )
  const operatedPaths = new Set(operations.map((operation) => operation.path))
  const expectedPaths = new Set(before.documents.map((entry) => entry.path))
  for (const targetPath of createPaths) expectedPaths.add(targetPath)
  const actualPaths = new Set(after.documents.map((entry) => entry.path))
  if (stableJson([...expectedPaths].sort()) !== stableJson([...actualPaths].sort())) {
    throw new Error('Firestore document inventory changed outside the reviewed plan.')
  }
  const expectedRoots = new Set(before.rootCollections)
  for (const targetPath of createPaths) expectedRoots.add(targetPath.split('/')[0])
  if (
    stableJson([...expectedRoots].sort()) !==
    stableJson(after.rootCollections)
  ) {
    throw new Error('Firestore root collection inventory changed unexpectedly.')
  }
  const afterByPath = new Map(after.documents.map((entry) => [entry.path, entry]))
  for (const entry of before.documents) {
    if (operatedPaths.has(entry.path)) continue
    const current = afterByPath.get(entry.path)
    if (
      !current ||
      stableJson(current.updateTime) !== stableJson(entry.updateTime)
    ) {
      throw new Error(
        `Untouched Firestore document changed during migration: ${rawSha256(entry.path)}.`
      )
    }
  }
}

async function finalizeMigrationMarker({
  markerOperation,
  markerPayload,
  dataOperations,
}) {
  await db.runTransaction(async (transaction) => {
    const markerRef = db.doc(markerOperation.path)
    const refs = [
      markerRef,
      ...dataOperations.map((operation) => db.doc(operation.path)),
    ]
    const snapshots = await transaction.getAll(...refs)
    const markerSnapshot = snapshots[0]
    if (markerSnapshot.exists) {
      throw new Error('Migration marker appeared before finalization.')
    }
    for (let index = 0; index < dataOperations.length; index += 1) {
      const operation = dataOperations[index]
      const snapshot = snapshots[index + 1]
      if (
        !snapshot.exists ||
        !matchesExpected(snapshot.data(), operation.payload)
      ) {
        throw new Error(
          `Canonical data changed before marker finalization: ${rawSha256(operation.path)}.`
        )
      }
    }
    transaction.create(markerRef, materializeServerValues(markerPayload))
  })
}

function requireExactTarget(key, expected) {
  const value = String(args[key] ?? '').trim()
  if (!value) throw new Error(`--${key} ${expected} is required.`)
  if (value !== expected) {
    throw new Error(`This executor only supports --${key} ${expected}.`)
  }
  return value
}

function requirePrivateTmpPath(key, value) {
  const resolvedPath = optionalPrivateTmpPath(key, value)
  if (!resolvedPath) throw new Error(`--${key} /private/tmp/<file>.json is required.`)
  return resolvedPath
}

function optionalPrivateTmpPath(key, value) {
  if (value == null || value === '') return ''
  const resolvedPath = path.resolve(String(value))
  if (!resolvedPath.startsWith('/private/tmp/')) {
    throw new Error(`--${key} must be a path under /private/tmp/.`)
  }
  return resolvedPath
}

function parseAndValidatePlan(source) {
  let value
  try {
    value = JSON.parse(source)
  } catch {
    throw new Error('--plan does not contain valid JSON.')
  }
  if (value?.format !== PLAN_FORMAT || value?.readOnly !== true) {
    throw new Error('--plan is not a Werkbox migration planner artifact.')
  }
  if (
    value.target?.projectId !== PROJECT_ID ||
    value.target?.databaseId !== DATABASE_ID
  ) {
    throw new Error('--plan target does not match the fixed Werkbox target.')
  }
  if (value.safety?.status !== 'ready-for-apply-executor-review') {
    throw new Error('--plan is not blocker-free and ready for executor review.')
  }
  if (!Array.isArray(value.operations) || value.operations.length < 1) {
    throw new Error('--plan has no operations.')
  }
  const operations = value.operations.map(validateOperation)
  const uniquePaths = new Set(operations.map((operation) => operation.path))
  if (uniquePaths.size !== operations.length) {
    throw new Error('--plan contains duplicate document paths.')
  }
  const markerOperations = operations.filter(
    (operation) => operation.path === MIGRATION_MARKER_PATH
  )
  if (markerOperations.length !== 1) {
    throw new Error('--plan must contain exactly one Werkbox migration marker.')
  }
  if (
    markerOperations[0].action !== 'create' ||
    markerOperations[0].precondition?.exists !== false
  ) {
    throw new Error(
      '--plan migration marker must be a first-run create with an absent precondition.'
    )
  }

  const finalPlanSha256 = sha256(operations.map(hashableOperation))
  if (finalPlanSha256 !== value.finalPlanSha256) {
    throw new Error('--plan finalPlanSha256 does not match its operations.')
  }
  const preMarkerOperations = operations.filter(
    (operation) => operation.path !== MIGRATION_MARKER_PATH
  )
  const operationSetSha256 = sha256({
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID },
    operations: preMarkerOperations.map(hashableOperation),
  })
  if (operationSetSha256 !== value.operationSetSha256) {
    throw new Error('--plan operationSetSha256 does not match its operations.')
  }
  const artifactSha256 = computeArtifactSha256({ ...value, operations })
  if (artifactSha256 !== value.artifactSha256) {
    throw new Error('--plan artifactSha256 does not cover its safety metadata and operations.')
  }

  return {
    ...value,
    operations,
    finalPlanSha256,
    operationSetSha256,
    artifactSha256,
  }
}

async function deriveFreshPlan() {
  const freshPath = `/private/tmp/werkbox-firestore-fresh-plan-${process.pid}-${randomUUID()}.json`
  const plannerArgs = [
    PLANNER_PATH,
    '--project',
    PROJECT_ID,
    '--database',
    DATABASE_ID,
    '--report',
    freshPath,
  ]
  if (args['service-account']) {
    plannerArgs.push('--service-account', String(args['service-account']))
  }
  try {
    await execFileAsync(process.execPath, plannerArgs, {
      cwd: process.cwd(),
      maxBuffer: 4 * 1024 * 1024,
      env: process.env,
    })
    return parseAndValidatePlan(await readFile(freshPath, 'utf8'))
  } catch (error) {
    throw new Error(
      `Fresh canonical plan derivation failed: ${error instanceof Error ? error.message : String(error)}`
    )
  } finally {
    await unlink(freshPath).catch(() => {})
  }
}

function validateOperation(raw, index) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Operation ${index} must be an object.`)
  }
  if (!['create', 'replace'].includes(raw.action)) {
    throw new Error(`Operation ${index} has unsupported action ${raw.action}.`)
  }
  const targetPath = String(raw.path ?? '').trim()
  const parts = targetPath.split('/').filter(Boolean)
  if (parts.length < 2 || parts.length % 2 !== 0) {
    throw new Error(`Operation ${index} has an invalid document path.`)
  }
  if (!ALLOWED_ROOTS.has(parts[0])) {
    throw new Error(`Operation ${index} targets a non-migration root.`)
  }
  if (targetPath.startsWith('apps/')) {
    if (!['cleanbox-app', 'richies-reinigung'].includes(parts[1])) {
      throw new Error(`Operation ${index} targets an unexpected App.`)
    }
    if (
      !(
        parts.length === 2 ||
        (parts.length === 4 &&
          ['users', 'agents', 'professionals'].includes(parts[2]))
      )
    ) {
      throw new Error(`Operation ${index} targets an unexpected App subcollection.`)
    }
  }
  if (targetPath.startsWith('users/') && parts.length > 2) {
    if (
      parts.length !== 4 ||
      !(
        (parts[2] === 'private' && parts[3] === 'account') ||
        (parts[2] === 'notifications' &&
          /^legacy-[a-f0-9]{24}$/.test(parts[3]))
      )
    ) {
      throw new Error(`Operation ${index} targets an unexpected User descendant.`)
    }
  }
  if (parts[0] === 'agents' && parts.length !== 2) {
    throw new Error(`Operation ${index} targets an unexpected Agent descendant.`)
  }
  if (parts[0] === 'user-handles' && parts.length !== 2) {
    throw new Error(`Operation ${index} targets an unexpected handle descendant.`)
  }
  if (
    parts[0] === 'user-handle-state' &&
    targetPath !== 'user-handle-state/canonical'
  ) {
    throw new Error(`Operation ${index} targets an unexpected handle state.`)
  }
  if (
    parts[0] === 'security-migrations' &&
    targetPath !== MIGRATION_MARKER_PATH
  ) {
    throw new Error(`Operation ${index} targets an unexpected migration marker.`)
  }
  if (!raw.payload || typeof raw.payload !== 'object' || Array.isArray(raw.payload)) {
    throw new Error(`Operation ${index} has no map payload.`)
  }
  if (!raw.precondition || typeof raw.precondition !== 'object') {
    throw new Error(`Operation ${index} has no precondition.`)
  }
  return {
    ...raw,
    path: targetPath,
    payload: rehydrate(raw.payload),
  }
}

function rehydrate(value) {
  if (Array.isArray(value)) return value.map(rehydrate)
  if (!value || typeof value !== 'object') return value
  if (
    Number.isInteger(value._seconds) &&
    Number.isInteger(value._nanoseconds) &&
    Object.keys(value).every((key) => ['_seconds', '_nanoseconds'].includes(key))
  ) {
    return new Timestamp(value._seconds, value._nanoseconds)
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, rehydrate(entry)])
  )
}

async function readCurrentOperations(operations) {
  const snapshots = await db.getAll(
    ...operations.map((operation) => db.doc(operation.path))
  )
  return snapshots.map((snapshot) => ({
    path: snapshot.ref.path,
    exists: snapshot.exists,
    createTime: timestampToken(snapshot.createTime),
    updateTime: timestampToken(snapshot.updateTime),
    data: snapshot.exists ? snapshot.data() : null,
  }))
}

function comparePreconditions(operations, current) {
  const byPath = new Map(current.map((entry) => [entry.path, entry]))
  return operations.flatMap((operation) => {
    const entry = byPath.get(operation.path)
    if (!entry) return [sha256(operation.path)]
    if (operation.precondition.exists === false) {
      return entry.exists ? [sha256(operation.path)] : []
    }
    if (!entry.exists) return [sha256(operation.path)]
    return stableJson(entry.updateTime) === stableJson(operation.precondition.updateTime)
      ? []
      : [sha256(operation.path)]
  })
}

async function applyTransaction(operations) {
  await db.runTransaction(async (transaction) => {
    const refs = operations.map((operation) => db.doc(operation.path))
    const snapshots = await transaction.getAll(...refs)
    const current = snapshots.map((snapshot) => ({
      path: snapshot.ref.path,
      exists: snapshot.exists,
      updateTime: timestampToken(snapshot.updateTime),
    }))
    const stale = comparePreconditions(operations, current)
    if (stale.length) {
      throw new Error('Migration plan changed after backup; transaction aborted.')
    }
    for (const operation of operations) {
      const ref = db.doc(operation.path)
      const payload = materializeServerValues(operation.payload)
      if (operation.action === 'create') transaction.create(ref, payload)
      else transaction.set(ref, payload)
    }
  })
}

function materializeServerValues(value) {
  if (Array.isArray(value)) return value.map(materializeServerValues)
  if (!value || typeof value !== 'object' || value instanceof Timestamp) return value
  if (
    value.__operation === 'timestamp' &&
    Object.keys(value).length === 1
  ) {
    return FieldValue.serverTimestamp()
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      materializeServerValues(entry),
    ])
  )
}

async function verifyResults(operations) {
  const snapshots = await db.getAll(
    ...operations.map((operation) => db.doc(operation.path))
  )
  const failures = []
  for (let index = 0; index < operations.length; index += 1) {
    const operation = operations[index]
    const snapshot = snapshots[index]
    if (!snapshot.exists || !matchesExpected(snapshot.data(), operation.payload)) {
      failures.push(sha256(operation.path))
    }
  }
  return { ok: failures.length === 0, failures }
}

function matchesExpected(actual, expected) {
  if (
    expected &&
    typeof expected === 'object' &&
    !Array.isArray(expected) &&
    expected.__operation === 'timestamp' &&
    Object.keys(expected).length === 1
  ) {
    return actual instanceof Timestamp
  }
  if (expected instanceof Timestamp) {
    return actual instanceof Timestamp && actual.isEqual(expected)
  }
  if (Array.isArray(expected)) {
    return (
      Array.isArray(actual) &&
      actual.length === expected.length &&
      expected.every((entry, index) => matchesExpected(actual[index], entry))
    )
  }
  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) return false
    const expectedKeys = Object.keys(expected).sort()
    const actualKeys = Object.keys(actual).sort()
    return (
      JSON.stringify(expectedKeys) === JSON.stringify(actualKeys) &&
      expectedKeys.every((key) => matchesExpected(actual[key], expected[key]))
    )
  }
  return Object.is(actual, expected)
}

function hashableOperation(operation) {
  return { ...operation, payload: normalizeForHash(operation.payload) }
}

function normalizeForHash(value) {
  if (value instanceof Timestamp) {
    return { __timestamp: timestampToken(value) }
  }
  if (Array.isArray(value)) return value.map(normalizeForHash)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => [key, normalizeForHash(entry)])
  )
}

function computeArtifactSha256(value) {
  return sha256({
    format: value.format,
    target: value.target,
    counts: value.counts,
    safety: value.safety,
    operationSetSha256: value.operationSetSha256,
    finalPlanSha256: value.finalPlanSha256,
    operations: value.operations.map(hashableOperation),
    migrationMarker: normalizeForHash(value.migrationMarker),
    applyBoundary: value.applyBoundary,
  })
}

function timestampToken(value) {
  return value instanceof Timestamp
    ? { seconds: value.seconds, nanoseconds: value.nanoseconds }
    : null
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (!value || typeof value !== 'object') return JSON.stringify(value)
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
    .join(',')}}`
}

function serverValue(kind) {
  return { __operation: kind }
}

function rawSha256(value) {
  return createHash('sha256').update(String(value)).digest('hex')
}

function sha256(value) {
  return createHash('sha256')
    .update(JSON.stringify(normalizeForHash(value)))
    .digest('hex')
}
