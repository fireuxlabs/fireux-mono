#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: back up and materialize owner-only Misebox UserPrivate records from Firebase Auth or an explicit legacy User backup without inventing terms acceptance.
// Concurrent edit — 2026-07-20 12:50 CEST — User privacy pass: correct migration-created analytics consent to opt-in only without overwriting user choices.
// Concurrent edit — 2026-07-20 13:42 CEST — Security rollout gate: publish an explicit complete/incomplete UserPrivate migration marker.

import process from 'node:process'
import { readFile, writeFile } from 'node:fs/promises'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const MIGRATION_MARKER_PATH = 'security-migrations/user-private-v1'
const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(`
Materialize owner-only Misebox UserPrivate records.

Usage:
  node scripts/migrate-misebox-user-private.mjs [--legacy-backup <path>]
  node scripts/migrate-misebox-user-private.mjs --commit [--legacy-backup <path>]

Dry-run is the default. Firebase Auth is the primary email source; the optional
mode-0600 legacy backup is only a fallback for retained non-Auth identities.
Legacy accounts receive explicit unrecorded terms: version '' and accepted_at
null. The migration never invents agreement evidence.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const resolved = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const adminApp = initializeApp(
  { credential: resolved.credential, projectId: PROJECT_ID },
  'misebox-user-private-migration'
)
const db = getFirestore(adminApp, DATABASE_ID)

try {
  const [usersSnapshot, authEmails, legacyEmails] = await Promise.all([
    db.collection('users').get(),
    readAuthEmails(),
    readLegacyEmails(args.legacyBackup),
  ])
  const rows = await Promise.all(
    usersSnapshot.docs.map(async (user) => {
      const privateRef = user.ref.collection('private').doc('account')
      const privateSnapshot = await privateRef.get()
      return { user, privateRef, privateSnapshot }
    })
  )
  for (const row of rows) {
    if (!row.privateSnapshot.exists) continue
    validatePrivateData(
      row.privateSnapshot.data(),
      row.privateSnapshot.ref.path
    )
  }
  const missing = rows.filter((row) => !row.privateSnapshot.exists)
  const skippedWithoutEmail = []
  const createPlan = []
  for (const row of missing) {
    const uid = row.user.id
    const email = normalizeEmail(
      authEmails.get(uid) || legacyEmails.get(uid) || ''
    )
    if (!email) {
      skippedWithoutEmail.push(uid)
      continue
    }
    const source = row.user.data()
    createPlan.push({
      ref: row.privateRef,
      uid,
      payload: {
        email,
        preferences: {
          language: 'en',
          theme: 'system',
          email_security_alerts: true,
          share_usage_analytics: false,
        },
        terms: {
          version: '',
          accepted_at: null,
        },
        created: source.created,
        updated: {
          at: Timestamp.now(),
          by: 'system:user-private-migration',
        },
      },
    })
  }
  const optOutPlan = rows
    .filter((row) => {
      const data = row.privateSnapshot.data()
      return row.privateSnapshot.exists &&
        data?.updated?.by === 'system:user-private-migration' &&
        data?.terms?.version === '' &&
        data?.terms?.accepted_at === null &&
        data?.preferences?.share_usage_analytics === true
    })
    .map((row) => ({
      ref: row.privateRef,
      uid: row.user.id,
      updateTime: row.privateSnapshot.updateTime,
      payload: {
        'preferences.share_usage_analytics': false,
        updated: {
          at: Timestamp.now(),
          by: 'system:user-private-migration',
        },
      },
    }))
  const summary = {
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID },
    credentialSource: resolved.source,
    publicUsers: rows.length,
    existingPrivateUsers: rows.length - missing.length,
    validatedExistingPrivateUsers: rows.length - missing.length,
    privateUsersToCreate: createPlan.length,
    migrationAnalyticsDefaultsToCorrect: optOutPlan.length,
    publicIdentitiesWithoutAccountEmail: skippedWithoutEmail.length,
    termsEvidence: 'unrecorded',
  }

  if (!args.commit) {
    console.log(JSON.stringify({ mode: 'dry-run', ...summary }, null, 2))
  } else {
    const backupPath = await writeBackup(rows)
    const batch = db.batch()
    for (const row of createPlan) batch.create(row.ref, row.payload)
    for (const row of optOutPlan) {
      batch.update(row.ref, row.payload, { lastUpdateTime: row.updateTime })
    }
    const migrationComplete = skippedWithoutEmail.length === 0
    batch.set(db.doc(MIGRATION_MARKER_PATH), {
      schema_version: 1,
      complete: migrationComplete,
      completed_at: Timestamp.now(),
      user_count: rows.length,
      private_user_count: rows.length - skippedWithoutEmail.length,
      identities_without_account_email: skippedWithoutEmail.length,
    })
    await batch.commit()
    const verification = await verify(
      rows,
      createPlan,
      optOutPlan,
      migrationComplete
    )
    console.log(
      JSON.stringify(
        { mode: 'commit', backupPath, ...summary, verification },
        null,
        2
      )
    )
  }
} finally {
  await deleteApp(adminApp)
}

function parseArgs(values) {
  const parsed = {
    help: false,
    commit: false,
    legacyBackup: '',
    'service-account': '',
  }
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (value === '--help') parsed.help = true
    else if (value === '--commit') parsed.commit = true
    else if (value === '--legacy-backup') {
      parsed.legacyBackup = values[index + 1] || ''
      index += 1
      if (!parsed.legacyBackup) {
        throw new Error('--legacy-backup requires a path.')
      }
    } else if (value === '--service-account') {
      parsed['service-account'] = values[index + 1] || ''
      index += 1
      if (!parsed['service-account']) {
        throw new Error('--service-account requires a path.')
      }
    } else {
      throw new Error(`Unknown argument: ${value}`)
    }
  }
  return parsed
}

async function readAuthEmails() {
  const map = new Map()
  let pageToken
  do {
    const page = await getAuth(adminApp).listUsers(1000, pageToken)
    for (const user of page.users) {
      const email = normalizeEmail(user.email || '')
      if (email) map.set(user.uid, email)
    }
    pageToken = page.pageToken
  } while (pageToken)
  return map
}

async function readLegacyEmails(path) {
  const map = new Map()
  if (!path) return map
  const payload = JSON.parse(await readFile(path, 'utf8'))
  for (const row of payload.documents || []) {
    const match = String(row.path || '').match(/^users\/([^/]+)$/)
    const email = normalizeEmail(row.data?.email || '')
    if (match && email) map.set(match[1], email)
  }
  return map
}

async function writeBackup(rows) {
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const path = `/private/tmp/fireux-misebox-user-private-${stamp}.json`
  const marker = await db.doc(MIGRATION_MARKER_PATH).get()
  const payload = {
    format: 'fireux-user-private-backup/1',
    createdAt: new Date().toISOString(),
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID },
    documents: rows.map((row) => ({
      path: row.privateRef.path,
      exists: row.privateSnapshot.exists,
      data: serialize(row.privateSnapshot.data() || null),
    })),
    migrationMarker: {
      path: MIGRATION_MARKER_PATH,
      exists: marker.exists,
      updateTime: marker.updateTime?.toDate?.().toISOString() || null,
      data: serialize(marker.data() || null),
    },
  }
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`, {
    flag: 'wx',
    mode: 0o600,
  })
  return path
}

async function verify(rows, createPlan, optOutPlan, migrationComplete) {
  const plannedIds = new Set(createPlan.map((row) => row.uid))
  const optOutIds = new Set(optOutPlan.map((row) => row.uid))
  const expectedRows = rows.filter(
    (row) => row.privateSnapshot.exists || plannedIds.has(row.user.id)
  )
  const snapshots = await Promise.all(
    expectedRows.map((row) => row.privateRef.get())
  )
  const marker = await db.doc(MIGRATION_MARKER_PATH).get()
  const failures = []
  for (let index = 0; index < snapshots.length; index += 1) {
    const snapshot = snapshots[index]
    const wasPlanned = plannedIds.has(expectedRows[index].user.id)
    const data = snapshot.data()
    if (!snapshot.exists) failures.push(`${snapshot.ref.path}: missing`)
    else {
      try {
        validatePrivateData(data, snapshot.ref.path)
      } catch (error) {
        failures.push(
          error instanceof Error ? error.message : `${snapshot.ref.path}: invalid`
        )
        continue
      }
    }
    if (wasPlanned && (
      data?.terms?.version !== '' ||
      data?.terms?.accepted_at !== null
    )) {
      failures.push(`${snapshot.ref.path}: legacy terms were not unrecorded`)
    } else if ((wasPlanned || optOutIds.has(expectedRows[index].user.id)) &&
      data?.preferences?.share_usage_analytics !== false) {
      failures.push(`${snapshot.ref.path}: analytics was not left opt-in only`)
    }
  }
  if (
    !marker.exists ||
    marker.get('schema_version') !== 1 ||
    marker.get('complete') !== migrationComplete ||
    marker.get('user_count') !== rows.length ||
    marker.get('private_user_count') !== expectedRows.length ||
    marker.get('identities_without_account_email') !==
      rows.length - expectedRows.length
  ) {
    failures.push(`${MIGRATION_MARKER_PATH}: missing or stale`)
  }
  if (failures.length) {
    throw new Error(`Verification failed:\n- ${failures.join('\n- ')}`)
  }
  return {
    strictPrivateUsers: snapshots.length,
    unrecordedLegacyTermsCreated: createPlan.length,
    migrationAnalyticsDefaultsCorrected: optOutPlan.length,
    migrationComplete,
    migrationMarker: MIGRATION_MARKER_PATH,
  }
}

function validatePrivateData(value, path) {
  const data = value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null
  if (!data) throw new Error(`${path}: record must be an object`)
  requireExactKeys(
    data,
    ['email', 'preferences', 'terms', 'created', 'updated'],
    path
  )
  if (!normalizeEmail(data.email)) {
    throw new Error(`${path}: missing valid email`)
  }

  const preferences = data.preferences
  requireExactKeys(
    preferences,
    [
      'language',
      'theme',
      'email_security_alerts',
      'share_usage_analytics',
    ],
    `${path}.preferences`
  )
  if (typeof preferences.language !== 'string' ||
    preferences.language.length < 2 || preferences.language.length > 16) {
    throw new Error(`${path}.preferences.language: invalid`)
  }
  if (!['system', 'light', 'dark'].includes(preferences.theme)) {
    throw new Error(`${path}.preferences.theme: invalid`)
  }
  if (typeof preferences.email_security_alerts !== 'boolean' ||
    typeof preferences.share_usage_analytics !== 'boolean') {
    throw new Error(`${path}.preferences: consent flags must be boolean`)
  }

  const terms = data.terms
  requireExactKeys(terms, ['version', 'accepted_at'], `${path}.terms`)
  if (typeof terms.version !== 'string' || terms.version.length > 64) {
    throw new Error(`${path}.terms.version: invalid`)
  }
  if (terms.version) {
    requireTimestamp(terms.accepted_at, `${path}.terms.accepted_at`)
  } else if (terms.accepted_at !== null) {
    throw new Error(`${path}.terms: unrecorded acceptance must use null`)
  }

  validateStamp(data.created, `${path}.created`, ['at', 'by', 'app_id'])
  validateStamp(data.updated, `${path}.updated`, ['at', 'by'])
}

function requireExactKeys(value, expected, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path}: must be an object`)
  }
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${path}: unexpected shape (${actual.join(', ')})`)
  }
}

function validateStamp(value, path, allowedKeys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path}: must be an object`)
  }
  const keys = Object.keys(value)
  if (!keys.includes('at') || keys.some((key) => !allowedKeys.includes(key))) {
    throw new Error(`${path}: unexpected stamp shape`)
  }
  requireTimestamp(value.at, `${path}.at`)
  for (const key of ['by', 'app_id']) {
    if (key in value && value[key] != null && typeof value[key] !== 'string') {
      throw new Error(`${path}.${key}: must be a string`)
    }
  }
}

function requireTimestamp(value, path) {
  if (!value || typeof value.toMillis !== 'function') {
    throw new Error(`${path}: must be a Firestore timestamp`)
  }
}

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

function serialize(value) {
  if (value == null) return value
  if (value instanceof Timestamp) {
    return {
      __type: 'firestore/timestamp',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }
  if (Array.isArray(value)) return value.map(serialize)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serialize(entry)])
    )
  }
  return value
}
