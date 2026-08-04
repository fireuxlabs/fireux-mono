#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-30
// usage_note: plan or explicitly provision and create-only migrate Misebox-owned Sproochli Menu caches and linked translation memory.

import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const SOURCE_PROJECT_ID = 'fireux-2005'
const TARGET_PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'sproochli'
const LOCATION = 'eur3'
const EDITION = 'standard'
const HOST_APP_ID = 'misebox-app'
const KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const MENU_ID = 'main-menu'
const CACHE_COLLECTION = 'menu_translation_caches'
const MEMORY_COLLECTION = 'translation_memory'
const CURRENT_FINGERPRINT = '4491a5cc7e72198b9094ac8f569e2900916e7ed5'
const CURRENT_CACHE_IDS = new Set([
  `ar__${CURRENT_FINGERPRINT}`,
  `en__${CURRENT_FINGERPRINT}`,
])
const STORAGE_METADATA = {
  host_app_id: HOST_APP_ID,
  firebase_project_id: TARGET_PROJECT_ID,
  database_id: DATABASE_ID,
}
const APPLY_CONFIRMATION =
  `${SOURCE_PROJECT_ID}/${DATABASE_ID}->${TARGET_PROJECT_ID}/${DATABASE_ID}`
const RULES_CONFIG = path.resolve(
  'scripts/firebase/sproochli/misebox.firebase.json'
)
const MAX_ATOMIC_DOCUMENTS = 450
const CLI_READ_TIMEOUT_MS = 30_000
const CLI_WRITE_TIMEOUT_MS = 120_000
const ALLOWED_ARGS = new Set([
  'apply',
  'backup',
  'confirm',
  'help',
  'source-service-account',
  'target-service-account',
])

const execFileAsync = promisify(execFile)
const args = parseArgs(process.argv.slice(2))
for (const token of process.argv.slice(2)) {
  if (!token.startsWith('--')) continue
  const key = token.slice(2).split('=')[0]
  if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option: --${key}`)
}

if (args.help) {
  console.log(`Usage:
  node scripts/migrate-sproochli-host-storage.mjs
  node scripts/migrate-sproochli-host-storage.mjs \\
    --apply \\
    --confirm '${APPLY_CONFIRMATION}' \\
    --backup /private/tmp/sproochli-misebox-preimage.json

Default mode is read-only. It plans the exact Luna cache and deterministically
linked memory records. Apply writes a new mode-0600 backup before any mutation,
provisions ${TARGET_PROJECT_ID}/${DATABASE_ID} as Standard/Native in ${LOCATION}
when absent, deploys deny-all client Rules, creates target records atomically,
and never updates or deletes the source.

Credential sources:
${firebaseAdminCredentialHelp().map(line => `  - ${line}`).join('\n')}

Use --source-service-account and --target-service-account to provide separate
credential files for Admin SDK document reads and writes. Database provisioning
and Rules deployment use the existing gcloud and Firebase CLI login, which must
already be authorized for ${TARGET_PROJECT_ID}.`)
  process.exit(0)
}

const apply = args.apply === true
const backupPath = apply ? protectedBackupPath(args.backup) : ''
if (apply && String(args.confirm || '').trim() !== APPLY_CONFIRMATION) {
  throw new Error(`Apply requires --confirm '${APPLY_CONFIRMATION}'.`)
}
if (
  !apply &&
  (args.confirm !== undefined || args.backup !== undefined)
) {
  throw new Error('--confirm and --backup are valid only with --apply.')
}

const sourceAuth = await resolveFirebaseAdminCredential({
  args: {
    'service-account': args['source-service-account'],
  },
  scope: 'fireux',
  projectId: SOURCE_PROJECT_ID,
})
const targetAuth = await resolveFirebaseAdminCredential({
  args: {
    'service-account': args['target-service-account'],
  },
  scope: 'misebox',
  projectId: TARGET_PROJECT_ID,
})
const sourceApp = initializeApp(
  { credential: sourceAuth.credential, projectId: SOURCE_PROJECT_ID },
  `sproochli-migration-source-${process.pid}`
)
let targetApp

try {
  const sourceDb = getFirestore(sourceApp, DATABASE_ID)
  const database = await inspectTargetDatabase()
  validateTargetDatabase(database)
  if (database.exists) {
    targetApp = initializeApp(
      { credential: targetAuth.credential, projectId: TARGET_PROJECT_ID },
      `sproochli-migration-target-${process.pid}`
    )
  }

  const initial = await derivePlan({
    sourceDb,
    targetDb: targetApp ? getFirestore(targetApp, DATABASE_ID) : null,
    database,
  })
  printPlan(initial, { apply })
  if (!apply) process.exitCode = initial.conflicts.length ? 2 : 0
  if (!apply) {
    await closeApps()
  } else {
    if (initial.conflicts.length) {
      throw new Error(
        `Migration blocked by ${initial.conflicts.length} target conflict(s).`
      )
    }
    if (initial.expected.length > MAX_ATOMIC_DOCUMENTS) {
      throw new Error(
        `Migration requires ${initial.expected.length} documents; the reviewed atomic limit is ${MAX_ATOMIC_DOCUMENTS}.`
      )
    }

    const backup = await writeProtectedJsonArtifact({
      path: backupPath,
      payload: portable(backupPayload(initial)),
    })
    const fresh = await derivePlan({
      sourceDb,
      targetDb: targetApp ? getFirestore(targetApp, DATABASE_ID) : null,
      database: await inspectTargetDatabase(),
    })
    if (fresh.plan_sha256 !== initial.plan_sha256) {
      throw new Error(
        `Migration plan changed after backup; no remote write was attempted. Backup: ${backup.path}`
      )
    }

    if (!database.exists) {
      await provisionTargetDatabase()
      targetApp = initializeApp(
        { credential: targetAuth.credential, projectId: TARGET_PROJECT_ID },
        `sproochli-migration-target-${process.pid}`
      )
    }
    await deployServerOnlyRules()

    const targetDb = getFirestore(targetApp, DATABASE_ID)
    const writes = await createExpectedDocuments(targetDb, fresh.expected)
    const verified = await verifyExpectedDocuments(targetDb, fresh.expected)
    const sourceAfter = await deriveSourceRecords(sourceDb)
    if (sourceAfter.source_sha256 !== fresh.source_sha256) {
      throw new Error(
        `Source changed during migration. Target verification passed, but source reconciliation is required. Backup: ${backup.path}`
      )
    }
    const finalDatabase = await inspectTargetDatabase()
    validateTargetDatabase(finalDatabase, { requireExists: true })

    console.log(JSON.stringify({
      status: 'migrated',
      source: `${SOURCE_PROJECT_ID}/${DATABASE_ID}`,
      target: `${TARGET_PROJECT_ID}/${DATABASE_ID}`,
      host_app_id: HOST_APP_ID,
      database: {
        location: finalDatabase.location,
        edition: finalDatabase.edition,
        delete_protection: finalDatabase.deleteProtection,
      },
      records: {
        caches: fresh.cache_count,
        translation_memory: fresh.memory_count,
        created: writes,
        verified,
      },
      backup,
      source_deleted: false,
    }, null, 2))
    await closeApps()
  }
} catch (error) {
  await closeApps()
  throw error
}

function protectedBackupPath(value) {
  const resolved = path.resolve(String(value || '').trim())
  if (!resolved.startsWith('/private/tmp/')) {
    throw new Error(
      'Apply requires --backup /private/tmp/<new-json-file>.'
    )
  }
  return resolved
}

async function closeApps() {
  if (targetApp) {
    await deleteApp(targetApp).catch(() => {})
    targetApp = undefined
  }
  await deleteApp(sourceApp).catch(() => {})
}

async function command(executable, commandArgs, options = {}) {
  try {
    return await execFileAsync(executable, commandArgs, {
      cwd: process.cwd(),
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: CLI_WRITE_TIMEOUT_MS,
      env: process.env,
      ...options,
    })
  } catch (error) {
    throw new Error([
      `${executable} ${commandArgs.join(' ')} failed.`,
      String(error?.stdout || '').trim(),
      String(error?.stderr || '').trim(),
    ].filter(Boolean).join('\n'))
  }
}

async function inspectTargetDatabase() {
  const result = await command('gcloud', [
    'firestore',
    'databases',
    'list',
    '--project',
    TARGET_PROJECT_ID,
    '--format=json',
  ], { timeout: CLI_READ_TIMEOUT_MS })
  const databases = JSON.parse(result.stdout)
  const name = `projects/${TARGET_PROJECT_ID}/databases/${DATABASE_ID}`
  const database = databases.find(entry => entry.name === name)
  return database
    ? {
        exists: true,
        location: String(database.locationId || ''),
        edition: String(database.databaseEdition || '').toLowerCase(),
        type: String(database.type || ''),
        deleteProtection: String(database.deleteProtectionState || ''),
      }
    : {
        exists: false,
        location: '',
        edition: '',
        type: '',
        deleteProtection: '',
      }
}

function validateTargetDatabase(database, options = {}) {
  if (!database.exists) {
    if (options.requireExists) {
      throw new Error(`${TARGET_PROJECT_ID}/${DATABASE_ID} does not exist.`)
    }
    return
  }
  if (
    database.location !== LOCATION ||
    database.edition !== EDITION ||
    database.type !== 'FIRESTORE_NATIVE' ||
    database.deleteProtection !== 'DELETE_PROTECTION_ENABLED'
  ) {
    throw new Error(
      `${TARGET_PROJECT_ID}/${DATABASE_ID} has incompatible location, edition, type, or delete protection.`
    )
  }
}

async function provisionTargetDatabase() {
  await command('gcloud', [
    'firestore',
    'databases',
    'create',
    '--database',
    DATABASE_ID,
    '--project',
    TARGET_PROJECT_ID,
    '--location',
    LOCATION,
    '--edition',
    EDITION,
    '--type',
    'firestore-native',
    '--delete-protection',
    '--quiet',
  ])

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const database = await inspectTargetDatabase()
    if (database.exists) {
      validateTargetDatabase(database, { requireExists: true })
      return
    }
    await new Promise(resolve => setTimeout(resolve, 2_000))
  }
  throw new Error('Timed out waiting for the target database to become ready.')
}

async function deployServerOnlyRules() {
  await command('pnpm', [
    'exec',
    'firebase',
    'deploy',
    '--only',
    'firestore',
    '--project',
    TARGET_PROJECT_ID,
    '--config',
    RULES_CONFIG,
    '--non-interactive',
  ])
}

async function derivePlan({ sourceDb, targetDb, database }) {
  const source = await deriveSourceRecords(sourceDb)
  const target = targetDb
    ? await inspectTargetRecords(targetDb, source.expected)
    : {
        operations: source.expected.map(record => ({
          collection: record.collection,
          id: record.id,
          action: 'create',
        })),
        preimages: [],
        conflicts: [],
      }
  const planCore = {
    format: 'fireux-sproochli-host-migration-plan/1',
    source: `${SOURCE_PROJECT_ID}/${DATABASE_ID}`,
    target: `${TARGET_PROJECT_ID}/${DATABASE_ID}`,
    database,
    storage: STORAGE_METADATA,
    source_sha256: source.source_sha256,
    cache_count: source.cache_count,
    memory_count: source.memory_count,
    operations: target.operations,
    conflicts: target.conflicts,
  }
  return {
    ...planCore,
    expected: source.expected,
    source_records: source.source_records,
    target_preimages: target.preimages,
    plan_sha256: digest(planCore),
  }
}

async function deriveSourceRecords(sourceDb) {
  const [cacheSnapshot, memorySnapshot] = await Promise.all([
    sourceDb
      .collection(CACHE_COLLECTION)
      .where('source.app_id', '==', HOST_APP_ID)
      .get(),
    sourceDb.collection(MEMORY_COLLECTION).get(),
  ])
  const caches = cacheSnapshot.docs
    .filter((snapshot) => {
      const source = object(snapshot.data().source)
      return (
        text(source.app_id) === HOST_APP_ID &&
        text(source.kitchen_id) === KITCHEN_ID &&
        text(source.menu_id) === MENU_ID
      )
    })
    .map(snapshot => ({
      collection: CACHE_COLLECTION,
      id: snapshot.id,
      data: snapshot.data(),
    }))
    .sort(byDocumentIdentity)
  if (!caches.length) {
    throw new Error('No Misebox Luna Sproochli cache records were found.')
  }
  for (const id of CURRENT_CACHE_IDS) {
    const current = caches.find(record => record.id === id)
    if (
      !current ||
      current.data.complete !== true ||
      !Array.isArray(current.data.fields) ||
      current.data.fields.length !== 157
    ) {
      throw new Error(`Required current cache ${id} is missing or incomplete.`)
    }
  }
  caches.forEach(assertValidCache)

  const cacheMemoryKeys = new Set()
  caches.forEach((cache) => {
    const targetLanguage = language(cache.data.target_language)
    cache.data.fields.forEach((field) => {
      const value = object(field)
      cacheMemoryKeys.add(memoryLinkKey({
        fieldKind: menuFieldKind(value.id),
        sourceHash: value.source_hash,
        targetLanguage,
        translatedText: value.translated_text,
      }))
    })
  })

  const memory = memorySnapshot.docs
    .filter((snapshot) => {
      const data = snapshot.data()
      const provenance = object(data.provenance)
      return (
        cacheMemoryKeys.has(memoryLinkKey({
          fieldKind: data.field_kind,
          sourceHash: data.source_hash,
          targetLanguage: data.target_language,
          translatedText: data.translated_text,
        })) ||
        text(provenance.source_app_id) === HOST_APP_ID
      )
    })
    .map(snapshot => ({
      collection: MEMORY_COLLECTION,
      id: snapshot.id,
      data: snapshot.data(),
    }))
    .sort(byDocumentIdentity)

  const sourceRecords = [...caches, ...memory]
  const expected = sourceRecords.map(record => ({
    collection: record.collection,
    id: record.id,
    data: {
      ...record.data,
      storage: STORAGE_METADATA,
    },
  }))
  return {
    cache_count: caches.length,
    memory_count: memory.length,
    source_records: sourceRecords,
    expected,
    source_sha256: digest(sourceRecords),
  }
}

function assertValidCache(record) {
  const data = record.data
  const source = object(data.source)
  if (
    data.complete !== true ||
    !text(data.fingerprint) ||
    !language(data.target_language) ||
    !Array.isArray(data.fields) ||
    !data.fields.length ||
    text(source.app_id) !== HOST_APP_ID ||
    text(source.kitchen_id) !== KITCHEN_ID ||
    text(source.menu_id) !== MENU_ID
  ) {
    throw new Error(`Invalid source cache: ${record.id}`)
  }
}

async function inspectTargetRecords(targetDb, expected) {
  const refs = expected.map(record =>
    targetDb.collection(record.collection).doc(record.id)
  )
  const snapshots = refs.length ? await targetDb.getAll(...refs) : []
  const operations = []
  const preimages = []
  const conflicts = []
  snapshots.forEach((snapshot, index) => {
    const record = expected[index]
    if (!snapshot.exists) {
      operations.push({
        collection: record.collection,
        id: record.id,
        action: 'create',
      })
      return
    }
    const data = snapshot.data()
    preimages.push({
      collection: record.collection,
      id: record.id,
      data,
    })
    if (semanticDigest(data) === semanticDigest(record.data)) {
      operations.push({
        collection: record.collection,
        id: record.id,
        action: 'existing',
      })
    } else {
      conflicts.push({
        collection: record.collection,
        id: record.id,
        reason: 'target document differs',
      })
    }
  })
  return { operations, preimages, conflicts }
}

async function createExpectedDocuments(targetDb, expected) {
  let writes = 0
  await targetDb.runTransaction(async (transaction) => {
    const refs = expected.map(record =>
      targetDb.collection(record.collection).doc(record.id)
    )
    const snapshots = await transaction.getAll(...refs)
    snapshots.forEach((snapshot, index) => {
      const record = expected[index]
      if (snapshot.exists) {
        if (
          semanticDigest(snapshot.data()) !== semanticDigest(record.data)
        ) {
          throw new Error(
            `Target conflict appeared at ${record.collection}/${record.id}.`
          )
        }
        return
      }
      transaction.create(snapshot.ref, record.data)
      writes += 1
    })
  })
  return writes
}

async function verifyExpectedDocuments(targetDb, expected) {
  const refs = expected.map(record =>
    targetDb.collection(record.collection).doc(record.id)
  )
  const snapshots = await targetDb.getAll(...refs)
  const failures = snapshots.flatMap((snapshot, index) => {
    const record = expected[index]
    return snapshot.exists &&
      semanticDigest(snapshot.data()) === semanticDigest(record.data)
      ? []
      : [`${record.collection}/${record.id}`]
  })
  if (failures.length) {
    throw new Error(
      `Post-write verification failed for: ${failures.join(', ')}`
    )
  }
  return snapshots.length
}

function backupPayload(plan) {
  return {
    format: 'fireux-sproochli-host-migration-backup/1',
    created_at: new Date().toISOString(),
    plan_sha256: plan.plan_sha256,
    source: {
      project_id: SOURCE_PROJECT_ID,
      database_id: DATABASE_ID,
      credential_source: sourceAuth.source,
      records: plan.source_records,
    },
    target: {
      project_id: TARGET_PROJECT_ID,
      database_id: DATABASE_ID,
      credential_source: targetAuth.source,
      database: plan.database,
      preimages: plan.target_preimages,
    },
    intended_records: plan.expected,
    source_delete_authorized: false,
  }
}

function printPlan(plan, options) {
  console.log(JSON.stringify({
    status: options.apply ? 'apply-preflight' : 'read-only-plan',
    source: `${SOURCE_PROJECT_ID}/${DATABASE_ID}`,
    target: `${TARGET_PROJECT_ID}/${DATABASE_ID}`,
    host_app_id: HOST_APP_ID,
    database: {
      exists: plan.database.exists,
      desired: {
        location: LOCATION,
        edition: EDITION,
        type: 'FIRESTORE_NATIVE',
        delete_protection: 'DELETE_PROTECTION_ENABLED',
      },
    },
    records: {
      caches: plan.cache_count,
      translation_memory: plan.memory_count,
      creates: plan.operations.filter(entry => entry.action === 'create').length,
      existing: plan.operations.filter(entry => entry.action === 'existing').length,
      conflicts: plan.conflicts.length,
    },
    current_cache_ids: [...CURRENT_CACHE_IDS],
    plan_sha256: plan.plan_sha256,
    apply_confirmation: APPLY_CONFIRMATION,
    cli_authority:
      `gcloud and Firebase CLI must already be authenticated for ${TARGET_PROJECT_ID}; service-account options authorize Admin SDK document access only`,
    source_delete_authorized: false,
  }, null, 2))
}

function memoryLinkKey(input) {
  return [
    language(input.targetLanguage),
    text(input.fieldKind),
    text(input.sourceHash).toLowerCase(),
    text(input.translatedText),
  ].join('\n')
}

function menuFieldKind(fieldId) {
  const id = text(fieldId)
  if (/^menu:[^:]+:name$/.test(id)) return 'menu_name'
  if (/^menu:[^:]+:description$/.test(id)) return 'menu_description'
  if (/^section:[^:]+:label$/.test(id)) return 'section_label'
  if (/^section:[^:]+:description$/.test(id)) return 'section_description'
  if (/^dish:[^:]+:name$/.test(id)) return 'dish_name'
  if (/^dish:[^:]+:description$/.test(id)) return 'dish_description'
  return 'menu_field'
}

function semanticDigest(value) {
  return digest(stripAuditTimestamps(value))
}

function stripAuditTimestamps(value) {
  if (Array.isArray(value)) return value.map(stripAuditTimestamps)
  if (!value || typeof value !== 'object' || isFirestoreScalar(value)) {
    return value
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) =>
        !['created_at', 'updated_at', 'generated_at'].includes(key)
      )
      .map(([key, entry]) => [key, stripAuditTimestamps(entry)])
  )
}

function digest(value) {
  return createHash('sha256')
    .update(JSON.stringify(portable(value)))
    .digest('hex')
}

function portable(value) {
  if (value == null) return value
  if (Array.isArray(value)) return value.map(portable)
  if (typeof value !== 'object') return value
  if (
    typeof value.seconds === 'number' &&
    typeof value.nanoseconds === 'number' &&
    typeof value.toDate === 'function'
  ) {
    return {
      __firestore_type: 'timestamp',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }
  if (value instanceof Uint8Array) {
    return {
      __firestore_type: 'bytes',
      base64: Buffer.from(value).toString('base64'),
    }
  }
  if (
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number'
  ) {
    return {
      __firestore_type: 'geopoint',
      latitude: value.latitude,
      longitude: value.longitude,
    }
  }
  if (typeof value.path === 'string' && value.firestore) {
    return {
      __firestore_type: 'reference',
      path: value.path,
    }
  }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, portable(entry)])
  )
}

function isFirestoreScalar(value) {
  return (
    (
      typeof value.seconds === 'number' &&
      typeof value.nanoseconds === 'number' &&
      typeof value.toDate === 'function'
    ) ||
    value instanceof Uint8Array ||
    (
      typeof value.latitude === 'number' &&
      typeof value.longitude === 'number'
    ) ||
    (typeof value.path === 'string' && value.firestore)
  )
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {}
}

function text(value) {
  return String(value ?? '').trim()
}

function language(value) {
  return text(value).replace(/_/g, '-').toLowerCase()
}

function byDocumentIdentity(left, right) {
  return `${left.collection}/${left.id}`.localeCompare(
    `${right.collection}/${right.id}`
  )
}
