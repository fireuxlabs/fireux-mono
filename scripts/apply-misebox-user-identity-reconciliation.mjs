#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-23
// usage_note: validate or explicitly apply the protected Misebox User identity reconciliation plan with a complete Firestore and Storage preimage.

import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const APP_ID = 'misebox-app'
const STORAGE_BUCKET = 'misebox-78f9c.appspot.com'
const TARGET_CONFIRMATION = `${PROJECT_ID}/${DATABASE_ID}`
const PLAN_FORMAT = 'fireux-misebox-user-identity-plan/1'
const RECONCILIATION_MARKER =
  'security-migrations/user-identity-reconciliation-v1'
const ALLOWED_MARKERS = new Set([
  'security-migrations/user-private-v1',
  RECONCILIATION_MARKER,
  'user-handle-state/canonical',
])
const ALLOWED_ROOTS = new Set([
  'agents',
  'apps',
  'chefs',
  'core-users',
  'customers',
  'drivers',
  'kitchens',
  'professionals',
  'security-migrations',
  'user-handles',
  'user-handle-state',
  'users',
])
const ALLOWED_ARGS = new Set([
  'apply',
  'backup',
  'confirm',
  'confirm-plan',
  'database',
  'help',
  'plan',
  'project',
  'service-account',
])
const execFileAsync = promisify(execFile)
const PLANNER_PATH = fileURLToPath(
  new URL('./plan-misebox-user-identity-reconciliation.mjs', import.meta.url)
)

const args = parseArgs(process.argv.slice(2))
for (const token of process.argv.slice(2)) {
  if (!token.startsWith('--')) continue
  const key = token.slice(2).split('=')[0]
  if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option: --${key}`)
}

if (args.help) {
  console.log(`
Validate or apply a protected Misebox User identity reconciliation plan.

Read-only validation:
  node scripts/apply-misebox-user-identity-reconciliation.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} \\
    --plan /private/tmp/misebox-user-identity-plan.json

Explicit apply:
  node scripts/apply-misebox-user-identity-reconciliation.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} \\
    --plan /private/tmp/misebox-user-identity-plan.json \\
    --apply --confirm ${TARGET_CONFIRMATION} \\
    --confirm-plan <finalPlanSha256> \\
    --backup /private/tmp/misebox-user-identity-preimage.json

Apply re-derives the fixed planner with the reviewed retain/delete decisions,
requires an exact plan/hash match, writes a new mode-0600 Firestore and Storage
preimage, rechecks every version inside one Firestore transaction, applies only
the planner operation grammar, deletes only backed-up Storage objects, and
verifies every result.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const projectId = exactTarget('project', PROJECT_ID)
const databaseId = exactTarget('database', DATABASE_ID)
const planPath = privateTmpPath('plan', args.plan)
const apply = args.apply === true
const backupPath = apply ? privateTmpPath('backup', args.backup) : ''
if (apply && String(args.confirm ?? '').trim() !== TARGET_CONFIRMATION) {
  throw new Error(`Apply requires --confirm ${TARGET_CONFIRMATION}.`)
}

const plan = validatePlan(JSON.parse(await readFile(planPath, 'utf8')))
if (
  apply &&
  String(args['confirm-plan'] ?? '').trim() !== plan.finalPlanSha256
) {
  throw new Error(
    `Apply requires --confirm-plan ${plan.finalPlanSha256}.`
  )
}
if (
  !apply &&
  (args.confirm !== undefined ||
    args['confirm-plan'] !== undefined ||
    args.backup !== undefined)
) {
  throw new Error(
    '--confirm, --confirm-plan, and --backup are accepted only with --apply.'
  )
}
const freshPlan = await deriveFreshPlan(plan.decisions)
if (
  freshPlan.finalPlanSha256 !== plan.finalPlanSha256 ||
  freshPlan.operationSetSha256 !== plan.operationSetSha256
) {
  throw new Error(
    'Protected plan no longer matches a fresh canonical derivation; generate and review a new plan.'
  )
}

const resolved = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId,
})
const adminApp = initializeApp(
  {
    credential: resolved.credential,
    projectId,
    storageBucket: STORAGE_BUCKET,
  },
  `misebox-user-identity-apply-${Date.now()}`
)
const db = getFirestore(adminApp, databaseId)
const bucket = getStorage(adminApp).bucket(STORAGE_BUCKET)

try {
  const firestoreOperations = plan.operations.filter(
    (operation) => operation.target === 'firestore'
  )
  const storageOperations = plan.operations.filter(
    (operation) => operation.target === 'storage'
  )
  const current = await readFirestorePreimage(firestoreOperations)
  const stale = comparePreconditions(firestoreOperations, current)
  if (stale.length) {
    throw new Error(
      `Plan is stale for ${stale.length} Firestore document(s); generate a new protected plan.`
    )
  }
  const storagePreimage = await readStoragePreimage(storageOperations)

  if (!apply) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          readOnly: true,
          target: { projectId, databaseId, appId: APP_ID },
          finalPlanSha256: plan.finalPlanSha256,
          firestoreOperations: firestoreOperations.length,
          storageOperations: storageOperations.length,
          preconditionsCurrent: true,
          productionMutated: false,
        },
        null,
        2
      )
    )
    process.exit(0)
  }

  const backupPayload = {
    format: 'fireux-misebox-user-identity-preimage/1',
    target: {
      projectId,
      databaseId,
      appId: APP_ID,
      storageBucket: STORAGE_BUCKET,
    },
    capturedAt: new Date().toISOString(),
    plan: {
      path: planPath,
      operationSetSha256: plan.operationSetSha256,
      finalPlanSha256: plan.finalPlanSha256,
      decisions: plan.decisions,
    },
    firestore: current,
    storage: storagePreimage,
  }
  assertCredentialFreeBackup(backupPayload)
  const backupArtifact = await writeProtectedJsonArtifact({
    path: backupPath,
    payload: backupPayload,
  })

  await applyFirestoreTransaction(
    firestoreOperations,
    backupArtifact.sha256
  )
  await applyStorageDeletes(storageOperations, storagePreimage)
  const verification = await verifyResults(plan.operations)
  if (!verification.ok) {
    throw new Error(
      `Post-write verification failed for ${verification.failures.length} operation(s). Recovery evidence: ${backupArtifact.path}`
    )
  }

  console.log(
    JSON.stringify(
      {
        mode: 'apply',
        target: { projectId, databaseId, appId: APP_ID },
        finalPlanSha256: plan.finalPlanSha256,
        operationSetSha256: plan.operationSetSha256,
        firestoreOperations: firestoreOperations.length,
        storageDeletes: storageOperations.length,
        backupArtifact,
        postWriteVerified: true,
        handleState: 'user-handle-state/canonical',
        reconciliationMarker: RECONCILIATION_MARKER,
      },
      null,
      2
    )
  )
} finally {
  await deleteApp(adminApp)
}

function exactTarget(key, expected) {
  const value = String(args[key] ?? '').trim()
  if (!value) throw new Error(`--${key} ${expected} is required.`)
  if (value !== expected) {
    throw new Error(`This executor only supports --${key} ${expected}.`)
  }
  return value
}

function privateTmpPath(key, value) {
  const resolved = path.resolve(String(value ?? ''))
  if (!value || !resolved.startsWith('/private/tmp/')) {
    throw new Error(`--${key} /private/tmp/<new-file>.json is required.`)
  }
  return resolved
}

function validatePlan(value) {
  if (
    value?.format !== PLAN_FORMAT ||
    value?.readOnly !== true ||
    value?.target?.projectId !== PROJECT_ID ||
    value?.target?.databaseId !== DATABASE_ID ||
    value?.target?.appId !== APP_ID ||
    value?.target?.storageBucket !== STORAGE_BUCKET
  ) {
    throw new Error('--plan is not for the fixed Misebox identity target.')
  }
  if (
    value.safety?.status !== 'ready-for-apply-review' ||
    value.safety?.blockers?.length !== 0
  ) {
    throw new Error('--plan is not blocker-free and ready for apply review.')
  }
  if (
    !Array.isArray(value.operations) ||
    value.operations.length < 1 ||
    value.operations.length > 450
  ) {
    throw new Error('--plan operation count is outside the reviewed boundary.')
  }
  const operations = value.operations.map(validateOperation)
  if (new Set(operations.map(operationKey)).size !== operations.length) {
    throw new Error('--plan contains duplicate operation targets.')
  }
  if (
    operations.filter(
      (operation) =>
        operation.target === 'firestore' &&
        operation.path === RECONCILIATION_MARKER
    ).length !== 1
  ) {
    throw new Error('--plan must contain exactly one reconciliation marker.')
  }
  if (sha256(operations) !== value.finalPlanSha256) {
    throw new Error('--plan finalPlanSha256 does not match its operations.')
  }
  const preMarker = operations.filter(
    (operation) =>
      !(
        operation.target === 'firestore' &&
        operation.path === RECONCILIATION_MARKER
      )
  )
  const operationSetSha256 = sha256({
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID, appId: APP_ID },
    decisions: value.decisions,
    operations: preMarker,
  })
  if (operationSetSha256 !== value.operationSetSha256) {
    throw new Error('--plan operationSetSha256 does not match its operations.')
  }
  return { ...value, operations }
}

function validateOperation(raw, index) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Operation ${index} must be an object.`)
  }
  if (!['identity-cleanup', 'private-boundary', 'handle-backfill', 'migration-markers'].includes(raw.phase)) {
    throw new Error(`Operation ${index} has an unsupported phase.`)
  }
  if (raw.target === 'storage') {
    if (
      raw.action !== 'delete' ||
      !String(raw.path).startsWith(`gs://${STORAGE_BUCKET}/`) ||
      !raw.precondition?.generation ||
      !raw.precondition?.metageneration
    ) {
      throw new Error(`Operation ${index} is outside the Storage delete boundary.`)
    }
    return raw
  }
  if (raw.target !== 'firestore' || !['create', 'set', 'delete'].includes(raw.action)) {
    throw new Error(`Operation ${index} has an unsupported target or action.`)
  }
  const targetPath = String(raw.path ?? '').trim()
  const parts = targetPath.split('/').filter(Boolean)
  if (parts.length < 2 || parts.length % 2 !== 0 || !ALLOWED_ROOTS.has(parts[0])) {
    throw new Error(`Operation ${index} has an invalid Firestore path.`)
  }
  if (
    (parts[0] === 'security-migrations' ||
      parts[0] === 'user-handle-state') &&
    !ALLOWED_MARKERS.has(targetPath)
  ) {
    throw new Error(`Operation ${index} targets an unexpected marker.`)
  }
  if (
    raw.action !== 'delete' &&
    (!raw.payload || typeof raw.payload !== 'object' || Array.isArray(raw.payload))
  ) {
    throw new Error(`Operation ${index} requires a map payload.`)
  }
  if (!raw.precondition || typeof raw.precondition !== 'object') {
    throw new Error(`Operation ${index} requires a precondition.`)
  }
  return { ...raw, path: targetPath, payload: rehydrate(raw.payload) }
}

function operationKey(operation) {
  return `${operation.target}\u0000${operation.path}`
}

async function deriveFreshPlan(decisions) {
  const freshPath =
    `/private/tmp/misebox-user-identity-fresh-${process.pid}-${randomUUID()}.json`
  const plannerArgs = [
    PLANNER_PATH,
    '--project',
    PROJECT_ID,
    '--database',
    DATABASE_ID,
    '--app',
    APP_ID,
    '--delete-users',
    decisions.deleteUsers.join(','),
    '--retain-users',
    decisions.retainUsers.join(','),
    '--report',
    freshPath,
  ]
  if (args['service-account']) {
    plannerArgs.push('--service-account', String(args['service-account']))
  }
  try {
    await execFileAsync(process.execPath, plannerArgs, {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 4 * 1024 * 1024,
    })
    return validatePlan(JSON.parse(await readFile(freshPath, 'utf8')))
  } finally {
    await unlink(freshPath).catch(() => {})
  }
}

async function readFirestorePreimage(operations) {
  const snapshots = await db.getAll(
    ...operations.map((operation) => db.doc(operation.path))
  )
  return snapshots.map((snapshot) => ({
    path: snapshot.ref.path,
    exists: snapshot.exists,
    createTime: isoTimestamp(snapshot.createTime),
    updateTime: isoTimestamp(snapshot.updateTime),
    data: snapshot.exists ? snapshot.data() : null,
  }))
}

async function readStoragePreimage(operations) {
  const result = []
  for (const operation of operations) {
    const objectName = operation.path.slice(`gs://${STORAGE_BUCKET}/`.length)
    const file = bucket.file(objectName)
    const [metadata] = await file.getMetadata()
    assertStoragePrecondition(operation, metadata)
    const [content] = await file.download()
    result.push({
      objectName,
      generation: String(metadata.generation ?? ''),
      metageneration: String(metadata.metageneration ?? ''),
      contentType: String(metadata.contentType ?? ''),
      cacheControl: String(metadata.cacheControl ?? ''),
      metadata: sanitizeStorageMetadata(metadata.metadata),
      sha256: rawSha256(content),
      contentBase64: content.toString('base64'),
    })
  }
  return result
}

function sanitizeStorageMetadata(value) {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key]) => key.toLowerCase() !== 'firebasestoragedownloadtokens'
    )
  )
}

function comparePreconditions(operations, current) {
  const byPath = new Map(current.map((entry) => [entry.path, entry]))
  return operations.flatMap((operation) => {
    const entry = byPath.get(operation.path)
    if (!entry) return [rawSha256(operation.path)]
    if (operation.precondition.exists === false) {
      return entry.exists ? [rawSha256(operation.path)] : []
    }
    return entry.exists &&
      entry.updateTime === String(operation.precondition.updateTime)
      ? []
      : [rawSha256(operation.path)]
  })
}

async function applyFirestoreTransaction(operations, backupSha256) {
  await db.runTransaction(async (transaction) => {
    const refs = operations.map((operation) => db.doc(operation.path))
    const snapshots = await transaction.getAll(...refs)
    const current = snapshots.map((snapshot) => ({
      path: snapshot.ref.path,
      exists: snapshot.exists,
      updateTime: isoTimestamp(snapshot.updateTime),
    }))
    if (comparePreconditions(operations, current).length) {
      throw new Error('Plan changed after backup; transaction aborted.')
    }
    for (const operation of operations) {
      const ref = db.doc(operation.path)
      if (operation.action === 'delete') transaction.delete(ref)
      else {
        const payload = materialize(operation.payload, backupSha256)
        if (operation.action === 'create') transaction.create(ref, payload)
        else transaction.set(ref, payload)
      }
    }
  })
}

async function applyStorageDeletes(operations, preimage) {
  const byName = new Map(preimage.map((entry) => [entry.objectName, entry]))
  for (const operation of operations) {
    const objectName = operation.path.slice(`gs://${STORAGE_BUCKET}/`.length)
    const backup = byName.get(objectName)
    if (!backup) throw new Error('Storage preimage is incomplete.')
    const file = bucket.file(objectName)
    const [metadata] = await file.getMetadata()
    assertStoragePrecondition(operation, metadata)
    await file.delete({ ifGenerationMatch: Number(backup.generation) })
  }
}

function assertStoragePrecondition(operation, metadata) {
  if (
    String(metadata.generation ?? '') !==
      String(operation.precondition.generation) ||
    String(metadata.metageneration ?? '') !==
      String(operation.precondition.metageneration)
  ) {
    throw new Error(`Storage object changed: ${rawSha256(operation.path)}`)
  }
}

async function verifyResults(operations) {
  const failures = []
  const firestore = operations.filter((operation) => operation.target === 'firestore')
  const snapshots = await db.getAll(
    ...firestore.map((operation) => db.doc(operation.path))
  )
  for (let index = 0; index < firestore.length; index += 1) {
    const operation = firestore[index]
    const snapshot = snapshots[index]
    if (operation.action === 'delete') {
      if (snapshot.exists) failures.push(rawSha256(operation.path))
    } else if (
      !snapshot.exists ||
      !matchesExpected(snapshot.data(), operation.payload)
    ) {
      failures.push(rawSha256(operation.path))
    }
  }
  for (const operation of operations.filter((entry) => entry.target === 'storage')) {
    const objectName = operation.path.slice(`gs://${STORAGE_BUCKET}/`.length)
    const [exists] = await bucket.file(objectName).exists()
    if (exists) failures.push(rawSha256(operation.path))
  }
  return { ok: failures.length === 0, failures }
}

function materialize(value, backupSha256) {
  if (Array.isArray(value)) return value.map((entry) => materialize(entry, backupSha256))
  if (!value || typeof value !== 'object' || value instanceof Timestamp) return value
  if (value.__operation === 'timestamp' && Object.keys(value).length === 1) {
    return FieldValue.serverTimestamp()
  }
  if (
    value.__operation === 'protected-backup-sha256' &&
    Object.keys(value).length === 1
  ) {
    return backupSha256
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      materialize(entry, backupSha256),
    ])
  )
}

function matchesExpected(actual, expected) {
  if (
    expected &&
    typeof expected === 'object' &&
    !Array.isArray(expected) &&
    expected.__operation === 'timestamp'
  ) {
    return actual instanceof Timestamp
  }
  if (
    expected &&
    typeof expected === 'object' &&
    !Array.isArray(expected) &&
    expected.__operation === 'protected-backup-sha256'
  ) {
    return typeof actual === 'string' && /^[a-f0-9]{64}$/.test(actual)
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
    const keys = Object.keys(expected).sort()
    return (
      JSON.stringify(keys) === JSON.stringify(Object.keys(actual).sort()) &&
      keys.every((key) => matchesExpected(actual[key], expected[key]))
    )
  }
  return Object.is(actual, expected)
}

function rehydrate(value) {
  if (Array.isArray(value)) return value.map(rehydrate)
  if (!value || typeof value !== 'object') return value
  if (
    Number.isInteger(value._seconds) &&
    Number.isInteger(value._nanoseconds)
  ) {
    return new Timestamp(value._seconds, value._nanoseconds)
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, rehydrate(entry)])
  )
}

function assertCredentialFreeBackup(value, location = '$') {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertCredentialFreeBackup(entry, `${location}[${index}]`)
    )
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, entry] of Object.entries(value)) {
    if (
      /^(private_key|access_token|refresh_token|client_secret|password)$/i.test(
        key
      )
    ) {
      throw new Error(`Credential-like backup key rejected at ${location}.${key}.`)
    }
    assertCredentialFreeBackup(entry, `${location}.${key}`)
  }
}

function isoTimestamp(value) {
  return value?.toDate?.().toISOString() ?? null
}

function rawSha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}
