#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: back up and materialize the trusted Misebox user-handle reservation index for existing public Users.
// Concurrent edit — 2026-07-20 13:51 CEST — User handle security pass: normalize legacy casing and backfill canonical ownership before trusted provisioning is enforced.

import process from 'node:process'
import { writeFile } from 'node:fs/promises'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const USER_COLLECTION = 'users'
const RESERVATION_COLLECTION = 'user-handles'
const STATE_COLLECTION = 'user-handle-state'
const STATE_DOCUMENT = 'canonical'
const args = parseArgs(process.argv.slice(2))

if (args.help) {
  console.log(`
Backfill trusted Misebox User handle reservations.

Usage:
  node scripts/backfill-misebox-user-handles.mjs
  node scripts/backfill-misebox-user-handles.mjs --commit

Dry-run is the default. Commit first writes a mode-0600 backup under
/private/tmp, then creates only missing reservations in one transaction.
Conflicting, malformed, duplicate, or orphan reservations abort the run.

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
  'misebox-user-handle-backfill'
)
const db = getFirestore(adminApp, DATABASE_ID)

try {
  const state = await readState()
  const plan = buildPlan(state)
  const summary = {
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID },
    credentialSource: resolved.source,
    publicUsers: state.users.size,
    existingReservations: state.reservations.size,
    backfillMarkerComplete:
      state.marker?.get('schema_version') === 1 &&
      state.marker?.get('backfill_complete') === true,
    reservationsToCreate: plan.filter((row) => row.createReservation).length,
    userHandlesToNormalize: plan.filter((row) => row.normalizeUser).length,
  }

  if (!args.commit) {
    console.log(JSON.stringify({ mode: 'dry-run', ...summary }, null, 2))
  } else {
    const backupPath = await writeBackup(state)
    await applyPlan(plan, state.users.size)
    const verification = await verify()
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
    'service-account': '',
  }
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (value === '--help') parsed.help = true
    else if (value === '--commit') parsed.commit = true
    else if (value === '--service-account') {
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

async function readState() {
  const [usersSnapshot, reservationsSnapshot, marker] = await Promise.all([
    db.collection(USER_COLLECTION).get(),
    db.collection(RESERVATION_COLLECTION).get(),
    db.collection(STATE_COLLECTION).doc(STATE_DOCUMENT).get(),
  ])
  return {
    users: new Map(usersSnapshot.docs.map((snapshot) => [snapshot.id, snapshot])),
    reservations: new Map(
      reservationsSnapshot.docs.map((snapshot) => [snapshot.id, snapshot])
    ),
    marker,
  }
}

function canonicalHandle(value, path) {
  const raw = String(value || '').trim()
  const normalized = raw.toLowerCase()
  if (!/^[a-z0-9][a-z0-9-]{2,29}$/.test(normalized)) {
    throw new Error(`${path}.handle is not a canonical 3-30 character handle.`)
  }
  return { raw, normalized }
}

function buildPlan(state) {
  const ownerByHandle = new Map()
  const plan = []

  for (const [uid, user] of state.users) {
    const { raw, normalized: handle } = canonicalHandle(
      user.get('handle'),
      user.ref.path
    )
    const duplicateOwner = ownerByHandle.get(handle)
    if (duplicateOwner && duplicateOwner !== uid) {
      throw new Error(`Duplicate public User handle ${handle}: ${duplicateOwner}, ${uid}.`)
    }
    ownerByHandle.set(handle, uid)

    const reservation = state.reservations.get(handle)
    if (reservation) validateReservation(reservation, uid, handle)
    if (raw !== handle || !reservation) {
      plan.push({
        uid,
        handle,
        originalHandle: raw,
        userRef: user.ref,
        normalizeUser: raw !== handle,
        createReservation: !reservation,
      })
    }
  }

  for (const [handle, reservation] of state.reservations) {
    const uid = ownerByHandle.get(handle)
    if (!uid) {
      throw new Error(`${reservation.ref.path} is orphaned from any public User.`)
    }
    validateReservation(reservation, uid, handle)
  }

  return plan
}

function validateReservation(snapshot, uid, handle) {
  const data = snapshot.data()
  const keys = Object.keys(data).sort()
  const expectedKeys = ['created_at', 'handle', 'uid', 'updated_at']
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    throw new Error(`${snapshot.ref.path} has unexpected reservation fields.`)
  }
  if (snapshot.id !== handle || data.handle !== handle || data.uid !== uid) {
    throw new Error(`${snapshot.ref.path} conflicts with canonical User ${uid}.`)
  }
  if (!data.created_at?.toDate || !data.updated_at?.toDate) {
    throw new Error(`${snapshot.ref.path} has invalid reservation timestamps.`)
  }
}

async function writeBackup(state) {
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const path = `/private/tmp/fireux-misebox-user-handles-${stamp}.json`
  const payload = {
    format: 'fireux-user-handle-reservation-backup/1',
    createdAt: new Date().toISOString(),
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID },
    users: [...state.users.values()].map(serializeSnapshot),
    reservations: [...state.reservations.values()].map(serializeSnapshot),
    marker: state.marker.exists ? serializeSnapshot(state.marker) : null,
  }
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`, {
    flag: 'wx',
    mode: 0o600,
  })
  return path
}

async function applyPlan(plan, userCount) {
  await db.runTransaction(async (transaction) => {
    const userSnapshots = plan.length
      ? await transaction.getAll(...plan.map((row) => row.userRef))
      : []
    const reservationRefs = plan.map((row) =>
      db.collection(RESERVATION_COLLECTION).doc(row.handle)
    )
    const reservationSnapshots = reservationRefs.length
      ? await transaction.getAll(...reservationRefs)
      : []

    for (let index = 0; index < plan.length; index += 1) {
      const row = plan[index]
      const user = userSnapshots[index]
      const reservation = reservationSnapshots[index]
      const currentHandle = user.exists
        ? canonicalHandle(user.get('handle'), user.ref.path)
        : null
      if (
        !currentHandle ||
        currentHandle.raw !== row.originalHandle ||
        currentHandle.normalized !== row.handle
      ) {
        throw new Error(`${row.userRef.path} changed during the backfill.`)
      }
      if (row.createReservation && reservation.exists) {
        throw new Error(`${reservation.ref.path} was created during the backfill.`)
      }
      if (!row.createReservation) {
        validateReservation(reservation, row.uid, row.handle)
      } else {
        transaction.create(reservation.ref, {
          uid: row.uid,
          handle: row.handle,
          created_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp(),
        })
      }
      if (row.normalizeUser) {
        transaction.update(row.userRef, {
          handle: row.handle,
          updated: {
            at: FieldValue.serverTimestamp(),
            by: 'system:user-handle-backfill',
          },
        })
      }
    }
    transaction.set(db.collection(STATE_COLLECTION).doc(STATE_DOCUMENT), {
      schema_version: 1,
      backfill_complete: true,
      completed_at: FieldValue.serverTimestamp(),
      user_count: userCount,
    }, { merge: true })
  })
}

async function verify() {
  const state = await readState()
  const remainingPlan = buildPlan(state)
  const markerComplete =
    state.marker.exists &&
    state.marker.get('schema_version') === 1 &&
    state.marker.get('backfill_complete') === true
  if (
    remainingPlan.length ||
    state.reservations.size !== state.users.size ||
    !markerComplete
  ) {
    throw new Error('Handle reservation verification failed.')
  }
  return {
    publicUsers: state.users.size,
    reservations: state.reservations.size,
    missingReservations: 0,
    markerComplete,
  }
}

function serializeSnapshot(snapshot) {
  return {
    path: snapshot.ref.path,
    updateTime: snapshot.updateTime?.toDate?.().toISOString() || null,
    data: serialize(snapshot.data()),
  }
}

function serialize(value) {
  if (value?.toDate instanceof Function) {
    return { __type: 'firestore/timestamp', value: value.toDate().toISOString() }
  }
  if (Array.isArray(value)) return value.map(serialize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, serialize(nested)])
    )
  }
  return value
}
