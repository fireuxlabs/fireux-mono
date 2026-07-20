#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: privately restore legacy User/UserApp notifications and meaningful User bios from a mode-0600 hardening backup.
// Concurrent edit — 2026-07-20 13:24 CEST — User privacy recovery: preserve deleted notification and profile content at its canonical private/public destinations.
// Concurrent edit — 2026-07-20 13:42 CEST — Security rollout gate: bind recovery completion to the exact legacy backup digest.

import process from 'node:process'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const MIGRATION_MARKER_PATH = 'security-migrations/user-profile-recovery-v1'
const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(`
Recover legacy Misebox User content from a prior hardening backup.

Usage:
  node scripts/recover-misebox-user-profile-data.mjs --legacy-backup <path>
  node scripts/recover-misebox-user-profile-data.mjs --commit --legacy-backup <path>

Notifications move to users/{uid}/notifications/{notificationId}. Meaningful
legacy bios move to an existing Professional profile without overwriting
current content. Dry-run is the default; commit first backs up every target.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const resolved = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  { credential: resolved.credential, projectId: PROJECT_ID },
  'misebox-user-profile-data-recovery'
)
const db = getFirestore(app, DATABASE_ID)

try {
  const legacySource = await readFile(args.legacyBackup, 'utf8')
  const sourceBackupSha256 = createHash('sha256')
    .update(legacySource)
    .digest('hex')
  const legacy = JSON.parse(legacySource)
  const plan = buildPlan(legacy)
  const markerRef = db.doc(MIGRATION_MARKER_PATH)
  const refs = [
    ...plan.notifications.map((row) => row.ref),
    ...plan.bios.map((row) => row.ref),
    markerRef,
  ]
  const snapshots = refs.length ? await db.getAll(...refs) : []
  const currentByPath = new Map(
    snapshots.map((snapshot) => [snapshot.ref.path, snapshot])
  )
  validateCurrentTargets(plan, currentByPath)
  validateMigrationMarker(plan, currentByPath, sourceBackupSha256)

  const summary = {
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID },
    credentialSource: resolved.source,
    sourceBackup: args.legacyBackup,
    sourceBackupSha256,
    notificationsFound: plan.notifications.length,
    notificationsToCreate: plan.notifications.filter(
      (row) => !currentByPath.get(row.ref.path)?.exists
    ).length,
    meaningfulBiosFound: plan.bios.length,
    biosToRestore: plan.bios.filter((row) => {
      const current = currentByPath.get(row.ref.path)?.get('bio')
      return !String(current || '').trim()
    }).length,
  }

  if (!args.commit) {
    console.log(JSON.stringify({ mode: 'dry-run', ...summary }, null, 2))
  } else {
    const backupPath = await writeBackup(plan, currentByPath)
    await applyPlan(plan, sourceBackupSha256)
    const verification = await verify(plan, sourceBackupSha256)
    console.log(
      JSON.stringify(
        { mode: 'commit', backupPath, ...summary, verification },
        null,
        2
      )
    )
  }
} finally {
  await deleteApp(app)
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
    } else if (value === '--service-account') {
      parsed['service-account'] = values[index + 1] || ''
      index += 1
    } else {
      throw new Error(`Unknown argument: ${value}`)
    }
  }
  if (!parsed.help && !parsed.legacyBackup) {
    throw new Error('--legacy-backup is required.')
  }
  return parsed
}

function buildPlan(backup) {
  const notifications = []
  const bios = []
  for (const document of backup.documents || []) {
    const sourcePath = String(document.path || '')
    const uid = sourceUserId(sourcePath)
    if (!uid) continue
    const data = object(document.data)

    for (const [index, value] of (Array.isArray(data.notifications)
      ? data.notifications
      : []).entries()) {
      const notification = normalizeNotification(value, sourcePath)
      const digest = createHash('sha256')
        .update(JSON.stringify({ sourcePath, index, notification: serialize(notification) }))
        .digest('hex')
        .slice(0, 32)
      notifications.push({
        uid,
        ref: db.doc(`users/${uid}/notifications/legacy-${digest}`),
        data: notification,
      })
    }

    if (!/^users\/[^/]+$/.test(sourcePath)) continue
    const bio = String(data.bio || '').trim()
    const displayName = String(data.display_name || '').trim()
    const profiles = Array.isArray(data.profiles) ? data.profiles : []
    if (!bio || bio.localeCompare(displayName, undefined, { sensitivity: 'accent' }) === 0) {
      continue
    }
    if (!profiles.includes('professional')) {
      throw new Error(
        `${sourcePath} contains a meaningful bio without a Professional destination.`
      )
    }
    if (bio.length > 4_000) throw new Error(`${sourcePath}.bio is too long.`)
    bios.push({ uid, ref: db.doc(`professionals/${uid}`), bio })
  }
  return { notifications, bios }
}

function sourceUserId(path) {
  return path.match(/^users\/([^/]+)$/)?.[1] ||
    path.match(/^apps\/[^/]+\/users\/([^/]+)$/)?.[1] ||
    ''
}

function normalizeNotification(value, sourcePath) {
  const data = object(value)
  const message = String(data.message || '').trim()
  const scope = data.scope === 'app' ? 'app' : data.scope === 'ecosystem'
    ? 'ecosystem'
    : ''
  const created = object(data.created)
  const at = decodeTimestamp(created.at)
  const appId = String(created.app_id || '').trim()
  if (!message || message.length > 1_000 || !scope || !at) {
    throw new Error(`${sourcePath} contains an invalid legacy notification.`)
  }
  return {
    message,
    scope,
    created: { at, app_id: appId },
    read: data.read === true,
  }
}

function decodeTimestamp(value) {
  if (value instanceof Timestamp) return value
  if (object(value).__type !== 'firestore/timestamp') return null
  const seconds = Number(value.seconds)
  const nanoseconds = Number(value.nanoseconds)
  if (!Number.isSafeInteger(seconds) || !Number.isSafeInteger(nanoseconds)) {
    return null
  }
  return new Timestamp(seconds, nanoseconds)
}

function validateCurrentTargets(plan, currentByPath) {
  for (const row of plan.notifications) {
    const snapshot = currentByPath.get(row.ref.path)
    if (!snapshot?.exists) continue
    if (JSON.stringify(serialize(snapshot.data())) !== JSON.stringify(serialize(row.data))) {
      throw new Error(`${row.ref.path} exists with different notification data.`)
    }
  }
  for (const row of plan.bios) {
    const snapshot = currentByPath.get(row.ref.path)
    if (!snapshot?.exists) {
      throw new Error(`${row.ref.path} is missing; refusing to invent a profile.`)
    }
    const current = String(snapshot.get('bio') || '').trim()
    if (current && current !== row.bio) {
      throw new Error(`${row.ref.path}.bio already contains different content.`)
    }
  }
}

function validateMigrationMarker(plan, currentByPath, sourceBackupSha256) {
  const marker = currentByPath.get(MIGRATION_MARKER_PATH)
  if (!marker?.exists) return
  if (
    marker.get('schema_version') !== 1 ||
    marker.get('complete') !== true ||
    marker.get('source_backup_sha256') !== sourceBackupSha256 ||
    marker.get('notification_count') !== plan.notifications.length ||
    marker.get('meaningful_bio_count') !== plan.bios.length
  ) {
    throw new Error(
      `${MIGRATION_MARKER_PATH} already records a different recovery run.`
    )
  }
}

async function writeBackup(plan, currentByPath) {
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const path = `/private/tmp/fireux-misebox-user-profile-recovery-${stamp}.json`
  const payload = {
    format: 'fireux-user-profile-recovery-backup/1',
    createdAt: new Date().toISOString(),
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID },
    documents: [...plan.notifications, ...plan.bios].map((row) => {
      const snapshot = currentByPath.get(row.ref.path)
      return {
        path: row.ref.path,
        exists: snapshot?.exists === true,
        updateTime: snapshot?.updateTime?.toDate?.().toISOString() || null,
        data: serialize(snapshot?.data() || null),
      }
    }),
    migrationMarker: (() => {
      const snapshot = currentByPath.get(MIGRATION_MARKER_PATH)
      return {
        path: MIGRATION_MARKER_PATH,
        exists: snapshot?.exists === true,
        updateTime: snapshot?.updateTime?.toDate?.().toISOString() || null,
        data: serialize(snapshot?.data() || null),
      }
    })(),
  }
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`, {
    flag: 'wx',
    mode: 0o600,
  })
  return path
}

async function applyPlan(plan, sourceBackupSha256) {
  await db.runTransaction(async (transaction) => {
    const rows = [...plan.notifications, ...plan.bios]
    const markerRef = db.doc(MIGRATION_MARKER_PATH)
    const snapshots = await transaction.getAll(
      ...rows.map((row) => row.ref),
      markerRef
    )
    const currentByPath = new Map(
      snapshots.map((snapshot) => [snapshot.ref.path, snapshot])
    )
    validateCurrentTargets(plan, currentByPath)
    validateMigrationMarker(plan, currentByPath, sourceBackupSha256)

    for (const row of plan.notifications) {
      if (!currentByPath.get(row.ref.path)?.exists) {
        transaction.create(row.ref, row.data)
      }
    }
    for (const row of plan.bios) {
      if (!String(currentByPath.get(row.ref.path)?.get('bio') || '').trim()) {
        transaction.update(row.ref, {
          bio: row.bio,
          updated: {
            at: FieldValue.serverTimestamp(),
            by: 'system:user-profile-data-recovery',
          },
        })
      }
    }
    transaction.set(markerRef, {
      schema_version: 1,
      complete: true,
      completed_at: FieldValue.serverTimestamp(),
      source_backup_sha256: sourceBackupSha256,
      notification_count: plan.notifications.length,
      meaningful_bio_count: plan.bios.length,
    })
  })
}

async function verify(plan, sourceBackupSha256) {
  const rows = [...plan.notifications, ...plan.bios]
  const snapshots = await db.getAll(
    ...rows.map((row) => row.ref),
    db.doc(MIGRATION_MARKER_PATH)
  )
  const currentByPath = new Map(
    snapshots.map((snapshot) => [snapshot.ref.path, snapshot])
  )
  validateCurrentTargets(plan, currentByPath)
  validateMigrationMarker(plan, currentByPath, sourceBackupSha256)
  return {
    notificationsRestored: plan.notifications.length,
    meaningfulBiosPreserved: plan.bios.length,
    migrationMarker: MIGRATION_MARKER_PATH,
  }
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
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
