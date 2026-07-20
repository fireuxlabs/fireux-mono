#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-20
// usage_note: produce an exact read-only Misebox User identity cleanup and handle-backfill plan before any reviewed apply executor exists.
// Concurrent edit — 2026-07-20 22:21 CEST — User/Profile data pass: plan retained identities, synthetic cleanup, private markers, and handle reservations without remote writes.

import { createHash } from 'node:crypto'
import path from 'node:path'
import process from 'node:process'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
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
const MAX_SCOPED_DOCUMENTS = 20_000
const PRIVATE_MARKER_PATH = 'security-migrations/user-private-v1'
const BOUNDARY_MARKER_PATH = 'security-migrations/user-profile-boundary-v4'
const HANDLE_STATE_PATH = 'user-handle-state/canonical'
const RECONCILIATION_MARKER_PATH =
  'security-migrations/user-identity-reconciliation-v1'
const ROOT_PROFILE_ORDER = ['agent', 'chef', 'driver', 'professional']
const APP_PROFILE_ORDER = ['agent', 'chef', 'customer', 'driver', 'professional']
const ROOT_PROFILE_COLLECTIONS = {
  agent: 'agents',
  chef: 'chefs',
  driver: 'drivers',
  professional: 'professionals',
}
const APP_PROFILE_COLLECTIONS = {
  agent: 'agents',
  chef: 'chefs',
  customer: 'customers',
  driver: 'drivers',
  professional: 'professionals',
}
const ALLOWED_ARGS = new Set([
  'app',
  'database',
  'delete-users',
  'help',
  'project',
  'report',
  'retain-users',
  'service-account',
  'summary',
])

const args = parseArgs(process.argv.slice(2))
for (const token of process.argv.slice(2)) {
  if (!token.startsWith('--')) continue
  const key = token.slice(2).split('=')[0]
  if (key === 'apply' || key === 'commit') {
    throw new Error(
      'This command is read-only. A reviewed backup-first apply executor does not exist yet.'
    )
  }
  if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option: --${key}`)
}

if (args.help) {
  console.log(`
Plan the Misebox User identity reconciliation without changing Firebase.

Usage:
  node scripts/plan-misebox-user-identity-reconciliation.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} --app ${APP_ID} \\
    --delete-users chris-driver \\
    --retain-users n1uytYJix8WvymYuuiHBnKc3NMw2 \\
    [--report /private/tmp/misebox-user-identity-plan.json] [--summary]

The command performs remote reads only. It rejects --apply and --commit. Every
Firestore-only User must have an explicit retain or delete decision. The report
contains no email values or private account payloads.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const projectId = requiredTarget('project', PROJECT_ID)
const databaseId = requiredTarget('database', DATABASE_ID)
const appId = requiredTarget('app', APP_ID)
const deleteUsers = csvSet(args['delete-users'])
const retainUsers = csvSet(args['retain-users'])
for (const uid of deleteUsers) {
  if (retainUsers.has(uid)) {
    throw new Error(`${uid} cannot be both retained and deleted.`)
  }
}

const reportPath = optionalReportPath(args.report)
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
  `misebox-user-identity-plan-${Date.now()}`
)
const db = getFirestore(adminApp, databaseId)

try {
  const state = await readState()
  const plan = await buildPlan(state)
  const output = args.summary ? summarize(plan) : plan
  if (reportPath) {
    const artifact = await writeProtectedJsonArtifact({
      path: reportPath,
      payload: plan,
    })
    output.reportArtifact = artifact
  }
  console.log(JSON.stringify(output, null, 2))
  if (plan.safety.blockers.length) process.exitCode = 2
} finally {
  await deleteApp(adminApp)
}

function requiredTarget(key, expected) {
  const value = String(args[key] ?? '').trim()
  if (!value) throw new Error(`--${key} ${expected} is required.`)
  if (value !== expected) {
    throw new Error(`This planner only supports --${key} ${expected}.`)
  }
  return value
}

function csvSet(value) {
  return new Set(
    String(value ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  )
}

function optionalReportPath(value) {
  if (value == null || value === '') return ''
  const resolvedPath = path.resolve(String(value))
  if (!resolvedPath.startsWith('/private/tmp/')) {
    throw new Error('--report must be a new path under /private/tmp/.')
  }
  return resolvedPath
}

async function listAuthUsers() {
  const users = []
  let pageToken
  do {
    const page = await getAuth(adminApp).listUsers(1000, pageToken)
    users.push(...page.users)
    pageToken = page.pageToken
  } while (pageToken)
  return users
}

async function readState() {
  const appRef = db.doc(`apps/${appId}`)
  const [
    usersSnapshot,
    reservationsSnapshot,
    membershipsSnapshot,
    privateMarker,
    boundaryMarker,
    handleState,
    reconciliationMarker,
    authUsers,
    rootCollections,
    appScopedDocuments,
  ] = await Promise.all([
    db.collection('users').get(),
    db.collection('user-handles').get(),
    appRef.collection('users').get(),
    db.doc(PRIVATE_MARKER_PATH).get(),
    db.doc(BOUNDARY_MARKER_PATH).get(),
    db.doc(HANDLE_STATE_PATH).get(),
    db.doc(RECONCILIATION_MARKER_PATH).get(),
    listAuthUsers(),
    readRootCollections(),
    readDescendantDocuments([appRef]),
  ])

  const users = snapshotMap(usersSnapshot)
  const auth = new Map(authUsers.map((user) => [user.uid, user]))
  const identityIds = new Set([...users.keys(), ...auth.keys()])
  const privateSnapshots = identityIds.size
    ? await db.getAll(
        ...[...identityIds].map((uid) =>
          db.doc(`users/${uid}/private/account`)
        )
      )
    : []
  const privateAccounts = new Map(
    privateSnapshots.map((snapshot) => [
      snapshot.ref.parent.parent.id,
      snapshot,
    ])
  )
  const extraScopeRoots = [
    ...(rootCollections.byName.get('kitchens')?.values() ?? []),
  ].map((snapshot) => snapshot.ref)
  for (const uid of deleteUsers) {
    extraScopeRoots.push(
      db.doc(`users/${uid}`),
      db.doc(`core-users/${uid}`),
      db.doc(`customers/${uid}`),
      ...Object.values(ROOT_PROFILE_COLLECTIONS).map((collection) =>
        db.doc(`${collection}/${uid}`)
      )
    )
  }
  const extraScopedDocuments = await readDescendantDocuments(extraScopeRoots)

  const documents = new Map()
  for (const snapshot of rootCollections.documents) {
    documents.set(snapshot.ref.path, snapshot)
  }
  for (const snapshot of [...appScopedDocuments, ...extraScopedDocuments]) {
    documents.set(snapshot.ref.path, snapshot)
  }
  for (const snapshot of privateSnapshots.filter((entry) => entry.exists)) {
    documents.set(snapshot.ref.path, snapshot)
  }

  return {
    appRef,
    auth,
    authUsers,
    boundaryMarker,
    documents,
    handleState,
    memberships: snapshotMap(membershipsSnapshot),
    privateAccounts,
    privateMarker,
    reconciliationMarker,
    reservations: snapshotMap(reservationsSnapshot),
    rootCollections: rootCollections.byName,
    users,
  }
}

async function readRootCollections() {
  const refs = await db.listCollections()
  const snapshots = await Promise.all(refs.map((ref) => ref.get()))
  const byName = new Map()
  const documents = []
  for (let index = 0; index < refs.length; index += 1) {
    const snapshot = snapshots[index]
    byName.set(refs[index].id, snapshotMap(snapshot))
    documents.push(...snapshot.docs)
  }
  return { byName, documents }
}

async function readDescendantDocuments(rootRefs) {
  const documents = new Map()
  const visitedParents = new Set()
  const queue = [...rootRefs]

  while (queue.length) {
    const batch = queue.splice(0, 20).filter((ref) => {
      if (visitedParents.has(ref.path)) return false
      visitedParents.add(ref.path)
      return true
    })
    if (!batch.length) continue
    const subcollections = (
      await Promise.all(batch.map((ref) => ref.listCollections()))
    ).flat()
    const snapshots = await Promise.all(
      subcollections.map((collection) => collection.get())
    )
    for (const snapshot of snapshots) {
      for (const document of snapshot.docs) {
        documents.set(document.ref.path, document)
        queue.push(document.ref)
        if (documents.size > MAX_SCOPED_DOCUMENTS) {
          throw new Error(
            `Scoped reference scan exceeded ${MAX_SCOPED_DOCUMENTS} documents.`
          )
        }
      }
    }
  }

  return [...documents.values()]
}

function snapshotMap(snapshot) {
  return new Map(snapshot.docs.map((document) => [document.id, document]))
}

async function buildPlan(state) {
  const blockers = []
  const warnings = []
  const firestoreOnly = [...state.users.keys()]
    .filter((uid) => !state.auth.has(uid))
    .sort()
  const authOnly = state.authUsers
    .filter((user) => !state.users.has(user.uid))
    .map((user) => ({
      uid: user.uid,
      anonymous: !user.email && user.providerData.length === 0,
      providers: [
        ...new Set(user.providerData.map((provider) => provider.providerId)),
      ].sort(),
      hasPrivateAccount:
        state.privateAccounts.get(user.uid)?.exists === true,
      createdAt: user.metadata.creationTime,
      lastSignInAt: user.metadata.lastSignInTime,
    }))
    .sort((left, right) => left.uid.localeCompare(right.uid))

  const unresolved = firestoreOnly.filter(
    (uid) => !deleteUsers.has(uid) && !retainUsers.has(uid)
  )
  const unknownDecisions = [...deleteUsers, ...retainUsers].filter(
    (uid) => !firestoreOnly.includes(uid)
  )
  for (const uid of unresolved) {
    blockers.push({
      code: 'FIRESTORE_ONLY_USER_DECISION_REQUIRED',
      path: `users/${uid}`,
      message: 'Choose retain or delete before an apply plan can exist.',
    })
  }
  for (const uid of unknownDecisions) {
    blockers.push({
      code: 'DECISION_TARGET_NOT_FIRESTORE_ONLY',
      path: `users/${uid}`,
      message: 'Delete/retain decisions are limited to Users without Auth.',
    })
  }
  for (const uid of deleteUsers) {
    if (state.auth.has(uid)) {
      blockers.push({
        code: 'DELETE_USER_HAS_AUTH_IDENTITY',
        path: `users/${uid}`,
        message: 'This Firestore reconciliation does not delete Auth users.',
      })
    }
  }

  const retainedUserIds = [...state.users.keys()]
    .filter((uid) => !deleteUsers.has(uid))
    .sort()
  const deletionRoots = buildDeletionRoots(state, blockers)
  const deletionDocuments = [...state.documents.values()]
    .filter((snapshot) =>
      [...deletionRoots].some(
        (root) =>
          snapshot.ref.path === root || snapshot.ref.path.startsWith(`${root}/`)
      )
    )
    .sort((left, right) => documentDepth(right.ref.path) - documentDepth(left.ref.path))
  const deletionPaths = new Set(
    deletionDocuments.map((snapshot) => snapshot.ref.path)
  )

  const referenceAudit = auditReferences({
    documents: state.documents,
    deleteUsers,
    deletionPaths,
  })
  blockers.push(...referenceAudit.blockers)
  warnings.push(...referenceAudit.warnings)

  const storage = await auditStorage(deleteUsers, blockers)
  const operations = deletionDocuments.map((snapshot) => ({
    phase: 'identity-cleanup',
    target: 'firestore',
    action: 'delete',
    path: snapshot.ref.path,
    reason: 'explicit Firestore-only User deletion decision',
    precondition: snapshotPrecondition(snapshot),
  }))
  for (const object of storage.objects) {
    operations.push({
      phase: 'identity-cleanup',
      target: 'storage',
      action: 'delete',
      path: `gs://${STORAGE_BUCKET}/${object.name}`,
      reason: `owned object for deleted User ${object.uid}`,
      precondition: {
        generation: object.generation,
        metageneration: object.metageneration,
      },
    })
  }

  const privateResult = planPrivateMarker({
    state,
    retainedUserIds,
    blockers,
  })
  operations.push(...privateResult.operations)
  const handleResult = planHandles({
    state,
    retainedUserIds,
    blockers,
  })
  operations.push(...handleResult.operations)

  const operationSetSha256 = sha256({
    target: { projectId, databaseId, appId },
    decisions: {
      deleteUsers: [...deleteUsers].sort(),
      retainUsers: [...retainUsers].sort(),
    },
    operations,
  })
  const reconciliationPayload = {
    schema_version: 1,
    complete: true,
    completed_at: serverValue('timestamp'),
    project_id: projectId,
    database_id: databaseId,
    app_id: appId,
    removed_user_ids: [...deleteUsers].sort(),
    retained_firestore_only_user_ids: firestoreOnly
      .filter((uid) => retainUsers.has(uid))
      .sort(),
    auth_only_identity_count: authOnly.length,
    user_count: retainedUserIds.length,
    private_user_count: privateResult.finalCount,
    reservation_count: handleResult.finalCount,
    predecessor_boundary_marker: {
      path: BOUNDARY_MARKER_PATH,
      schema_version: Number(state.boundaryMarker.get('schema_version') ?? 0),
      historical_user_count: Number(
        state.boundaryMarker.get('user_count') ?? 0
      ),
    },
    operation_set_sha256: operationSetSha256,
    source_backup_sha256: serverValue('protected-backup-sha256'),
  }
  operations.push(
    markerOperation(state.reconciliationMarker, {
      path: RECONCILIATION_MARKER_PATH,
      payload: reconciliationPayload,
      reason: 'record the current identity reconciliation without rewriting historical migration evidence',
    })
  )

  operations.sort(compareOperations)
  const finalOperationSetSha256 = sha256(operations)
  const finalCounts = countOperations(operations)
  const ready = blockers.length === 0

  return {
    format: 'fireux-misebox-user-identity-plan/1',
    mode: 'dry-run',
    readOnly: true,
    target: {
      projectId,
      databaseId,
      appId,
      edition: 'STANDARD',
      storageBucket: STORAGE_BUCKET,
    },
    credentialSource: resolved.source,
    inspectedAt: new Date().toISOString(),
    decisions: {
      deleteUsers: [...deleteUsers].sort(),
      retainUsers: [...retainUsers].sort(),
      authOnlyPolicy: 'preserve',
    },
    counts: {
      authUsers: state.auth.size,
      publicUsersBefore: state.users.size,
      publicUsersAfter: retainedUserIds.length,
      privateUsersAfter: privateResult.finalCount,
      reservationsAfter: handleResult.finalCount,
      firestoreOnlyUsers: firestoreOnly.length,
      authOnlyUsers: authOnly.length,
      anonymousAuthUsers: authOnly.filter((user) => user.anonymous).length,
      documentsInspected: state.documents.size,
      historicalReferencesRetained: referenceAudit.historical.length,
      ...finalCounts,
    },
    identities: {
      firestoreOnly,
      authOnly,
    },
    safety: {
      status: ready ? 'ready-for-apply-review' : 'blocked',
      blockers,
      warnings,
      historicalReferencesRetained: referenceAudit.historical,
      storagePrefixesInspected: storage.prefixes,
    },
    operationSetSha256,
    finalPlanSha256: finalOperationSetSha256,
    operations,
    applyBoundary: {
      implemented: false,
      reason:
        'The user authorized a dry-run. A separate reviewed executor must require an exclusive mode-0600 preimage, this plan hash, exact target confirmation, version rechecks, one atomic Firestore transaction, storage backup, and post-write verification.',
      releaseGateChangeRequired:
        'Validate current live counts and this reconciliation marker; do not rewrite the historical boundary-v4 marker.',
    },
  }
}

function buildDeletionRoots(state, blockers) {
  const roots = new Set()
  for (const uid of deleteUsers) {
    const user = state.users.get(uid)
    if (!user) continue
    const membership = state.memberships.get(uid)
    const rootProfiles = canonicalList(user.get('profiles'), ROOT_PROFILE_ORDER)
    const appProfiles = canonicalList(
      membership?.get('profiles'),
      APP_PROFILE_ORDER
    )
    if (uid === 'chris-driver') {
      const createdBy = String(user.get('created.by') ?? '')
      if (createdBy !== 'workspace:normalize-chris-driver-profile') {
        blockers.push({
          code: 'SYNTHETIC_USER_PROVENANCE_CHANGED',
          path: user.ref.path,
          message: `Expected workspace provenance, received ${createdBy || '(empty)'}.`,
        })
      }
    }

    roots.add(`users/${uid}`)
    roots.add(`apps/${appId}/users/${uid}`)
    roots.add(`apps/${appId}/join-requests/${uid}`)
    roots.add(`apps/${appId}/membership-blocks/${uid}`)
    roots.add(`customers/${uid}`)
    for (const kind of rootProfiles) {
      roots.add(`${ROOT_PROFILE_COLLECTIONS[kind]}/${uid}`)
    }
    for (const kind of appProfiles) {
      roots.add(`apps/${appId}/${APP_PROFILE_COLLECTIONS[kind]}/${uid}`)
    }

    for (const kind of ROOT_PROFILE_ORDER) {
      const path = `${ROOT_PROFILE_COLLECTIONS[kind]}/${uid}`
      if (
        state.documents.has(path) &&
        !rootProfiles.includes(kind)
      ) {
        blockers.push({
          code: 'UNINDEXED_ROOT_PROFILE',
          path,
          message: 'Unexpected profile is not covered by the User profile index.',
        })
      }
    }
    for (const kind of APP_PROFILE_ORDER) {
      const path = `apps/${appId}/${APP_PROFILE_COLLECTIONS[kind]}/${uid}`
      if (state.documents.has(path) && !appProfiles.includes(kind)) {
        blockers.push({
          code: 'UNINDEXED_APP_PROFILE',
          path,
          message: 'Unexpected profile is not covered by the membership profile index.',
        })
      }
    }

    const handle = canonicalHandle(user.get('handle'), user.ref.path, blockers)
    if (handle) {
      const reservation = state.reservations.get(handle)
      if (reservation?.get('uid') === uid) roots.add(reservation.ref.path)
      else if (reservation) {
        blockers.push({
          code: 'HANDLE_RESERVATION_CONFLICT',
          path: reservation.ref.path,
          message: `Reservation is not owned by ${uid}.`,
        })
      }
    }
  }
  return roots
}

function auditReferences({ documents, deleteUsers: ids, deletionPaths }) {
  const blockers = []
  const warnings = []
  const historical = []
  for (const snapshot of documents.values()) {
    const matches = referenceMatches(snapshot, ids)
    if (!matches.length || deletionPaths.has(snapshot.ref.path)) continue
    for (const match of matches) {
      const row = {
        uid: match.uid,
        path: snapshot.ref.path,
        field: match.field,
      }
      if (isHistoricalReference(snapshot.ref.path, match.field)) {
        historical.push(row)
      } else {
        blockers.push({
          code: 'ACTIVE_REFERENCE_TO_DELETED_USER',
          ...row,
          message: 'Classify or remove this reference before deleting the User.',
        })
      }
    }
  }
  if (historical.length) {
    warnings.push({
      code: 'HISTORICAL_ATTRIBUTION_RETAINED',
      count: historical.length,
      message: 'Audit stamps/events stay immutable unless a separate erasure policy requires anonymization.',
    })
  }
  return { blockers, warnings, historical }
}

function referenceMatches(snapshot, ids) {
  const matches = []
  const seen = new Set()
  const add = (uid, field) => {
    const key = `${uid}\u0000${field}`
    if (!seen.has(key)) {
      seen.add(key)
      matches.push({ uid, field })
    }
  }
  for (const uid of ids) {
    if (snapshot.ref.path.split('/').includes(uid)) add(uid, '$documentPath')
  }
  walkValue(snapshot.data(), '$', ids, add)
  return matches
}

function walkValue(value, field, ids, add) {
  if (typeof value === 'string') {
    for (const uid of ids) if (value === uid) add(uid, field)
    return
  }
  if (value == null || value instanceof Timestamp) return
  if (value?.constructor?.name === 'DocumentReference') {
    for (const uid of ids) {
      if (String(value.path).split('/').includes(uid)) add(uid, field)
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkValue(entry, `${field}[${index}]`, ids, add))
    return
  }
  if (typeof value !== 'object') return
  for (const [key, entry] of Object.entries(value)) {
    for (const uid of ids) if (key === uid) add(uid, `${field}.${key}.$key`)
    walkValue(entry, `${field}.${key}`, ids, add)
  }
}

function isHistoricalReference(documentPath, field) {
  if (documentPath.startsWith(`apps/${appId}/events/`)) return true
  return /\.(created|updated)\.by$/.test(field)
}

async function auditStorage(ids, blockers) {
  const objects = []
  const prefixes = []
  const bucket = getStorage(adminApp).bucket(STORAGE_BUCKET)
  for (const uid of ids) {
    for (const prefix of [`users/${uid}/`, `core-users/${uid}/`]) {
      prefixes.push(`gs://${STORAGE_BUCKET}/${prefix}`)
      try {
        const [files] = await bucket.getFiles({ prefix })
        for (const file of files) {
          const [metadata] = await file.getMetadata()
          objects.push({
            uid,
            name: file.name,
            generation: String(metadata.generation ?? ''),
            metageneration: String(metadata.metageneration ?? ''),
          })
        }
      } catch (error) {
        blockers.push({
          code: 'STORAGE_REFERENCE_SCAN_FAILED',
          path: `gs://${STORAGE_BUCKET}/${prefix}`,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }
  return { objects, prefixes }
}

function planPrivateMarker({ state, retainedUserIds, blockers }) {
  const operations = []
  let finalCount = 0
  for (const uid of retainedUserIds) {
    const snapshot = state.privateAccounts.get(uid)
    if (!snapshot?.exists) {
      blockers.push({
        code: 'RETAINED_USER_PRIVATE_MISSING',
        path: `users/${uid}/private/account`,
        message: 'A real email source and reviewed private-record creation are required.',
      })
      continue
    }
    try {
      validatePrivateAccount(snapshot.data(), snapshot.ref.path)
      finalCount += 1
    } catch (error) {
      blockers.push({
        code: 'USER_PRIVATE_INVALID',
        path: snapshot.ref.path,
        message: error instanceof Error ? error.message : String(error),
      })
    }

    const authUser = state.auth.get(uid)
    if (authUser) {
      const stored = normalizeEmail(snapshot.get('email'))
      const current = normalizeEmail(authUser.email)
      if (!stored || stored !== current) {
        blockers.push({
          code: 'USER_PRIVATE_AUTH_EMAIL_DRIFT',
          path: snapshot.ref.path,
          message: 'Stored private email does not match the current Auth email.',
        })
      }
    }
  }

  operations.push(
    markerOperation(state.privateMarker, {
      path: PRIVATE_MARKER_PATH,
      payload: {
        schema_version: 1,
        complete: finalCount === retainedUserIds.length,
        completed_at: serverValue('timestamp'),
        user_count: retainedUserIds.length,
        private_user_count: finalCount,
        identities_without_account_email: retainedUserIds.length - finalCount,
      },
      reason: 'record the verified UserPrivate boundary for the retained User set',
    })
  )
  return { finalCount, operations }
}

function planHandles({ state, retainedUserIds, blockers }) {
  const operations = []
  const ownerByHandle = new Map()
  const retained = new Set(retainedUserIds)
  let finalCount = 0

  for (const uid of retainedUserIds) {
    const user = state.users.get(uid)
    const handle = canonicalHandle(user?.get('handle'), `users/${uid}`, blockers)
    if (!handle) continue
    const duplicate = ownerByHandle.get(handle)
    if (duplicate && duplicate !== uid) {
      blockers.push({
        code: 'DUPLICATE_USER_HANDLE',
        path: `users/${uid}`,
        message: `${handle} is also owned by ${duplicate}.`,
      })
      continue
    }
    ownerByHandle.set(handle, uid)
    const reservation = state.reservations.get(handle)
    if (!reservation) {
      operations.push({
        phase: 'handle-backfill',
        target: 'firestore',
        action: 'create',
        path: `user-handles/${handle}`,
        reason: `reserve the canonical handle for retained User ${uid}`,
        precondition: { exists: false },
        payload: {
          uid,
          handle,
          created_at: serverValue('timestamp'),
          updated_at: serverValue('timestamp'),
        },
      })
      finalCount += 1
      continue
    }
    if (
      reservation.id !== handle ||
      reservation.get('uid') !== uid ||
      reservation.get('handle') !== handle
    ) {
      blockers.push({
        code: 'HANDLE_RESERVATION_CONFLICT',
        path: reservation.ref.path,
        message: `Reservation does not match retained User ${uid}.`,
      })
      continue
    }
    finalCount += 1
  }

  for (const reservation of state.reservations.values()) {
    const owner = String(reservation.get('uid') ?? '')
    if (retained.has(owner)) continue
    if (!deleteUsers.has(owner)) {
      blockers.push({
        code: 'ORPHAN_HANDLE_RESERVATION',
        path: reservation.ref.path,
        message: 'Reservation owner is neither retained nor explicitly deleted.',
      })
    }
  }

  operations.push(
    markerOperation(state.handleState, {
      path: HANDLE_STATE_PATH,
      payload: {
        schema_version: 1,
        backfill_complete: finalCount === retainedUserIds.length,
        completed_at: serverValue('timestamp'),
        user_count: retainedUserIds.length,
        reservation_count: finalCount,
      },
      reason: 'enable trusted handle provisioning only after exact reservation verification',
    })
  )
  return { finalCount, operations }
}

function markerOperation(snapshot, { path: markerPath, payload, reason }) {
  return {
    phase: 'migration-markers',
    target: 'firestore',
    action: snapshot.exists ? 'set' : 'create',
    path: markerPath,
    reason,
    precondition: snapshot.exists
      ? snapshotPrecondition(snapshot)
      : { exists: false },
    payload,
  }
}

function canonicalHandle(value, ownerPath, blockers) {
  const raw = String(value ?? '').trim()
  const normalized = raw.toLowerCase()
  if (!/^[a-z0-9][a-z0-9-]{2,29}$/.test(normalized) || raw !== normalized) {
    blockers.push({
      code: 'USER_HANDLE_NOT_CANONICAL',
      path: ownerPath,
      message: `${raw || '(empty)'} is not a canonical lowercase handle.`,
    })
    return ''
  }
  return normalized
}

function canonicalList(value, order) {
  const selected = new Set(
    Array.isArray(value)
      ? value.filter((entry) => typeof entry === 'string')
      : []
  )
  return order.filter((entry) => selected.has(entry))
}

function validatePrivateAccount(value, privatePath) {
  exactKeys(value, ['email', 'preferences', 'terms', 'created', 'updated'], privatePath)
  if (!normalizeEmail(value.email)) throw new Error(`${privatePath}: invalid email`)
  exactKeys(
    value.preferences,
    ['language', 'theme', 'email_security_alerts', 'share_usage_analytics'],
    `${privatePath}.preferences`
  )
  exactKeys(value.terms, ['version', 'accepted_at'], `${privatePath}.terms`)
  if (typeof value.terms.version !== 'string') {
    throw new Error(`${privatePath}.terms.version: must be a string`)
  }
  if (value.terms.version && !(value.terms.accepted_at instanceof Timestamp)) {
    throw new Error(`${privatePath}.terms.accepted_at: current evidence requires a timestamp`)
  }
  if (!value.terms.version && value.terms.accepted_at !== null) {
    throw new Error(`${privatePath}.terms: unrecorded evidence must use null`)
  }
}

function exactKeys(value, expected, valuePath) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${valuePath}: must be an object`)
  }
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${valuePath}: unexpected fields ${actual.join(', ')}`)
  }
}

function normalizeEmail(value) {
  const email = String(value ?? '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

function snapshotPrecondition(snapshot) {
  return {
    exists: true,
    updateTime: snapshot.updateTime?.toDate?.().toISOString() ?? null,
  }
}

function serverValue(kind) {
  return { __operation: kind }
}

function documentDepth(documentPath) {
  return documentPath.split('/').length
}

function compareOperations(left, right) {
  const phases = {
    'identity-cleanup': 1,
    'private-boundary': 2,
    'handle-backfill': 3,
    'migration-markers': 4,
  }
  return (
    (phases[left.phase] ?? 99) - (phases[right.phase] ?? 99) ||
    (left.action === 'delete' && right.action === 'delete'
      ? documentDepth(right.path) - documentDepth(left.path)
      : 0) ||
    left.path.localeCompare(right.path)
  )
}

function countOperations(operations) {
  const counts = { creates: 0, sets: 0, deletes: 0, totalOperations: 0 }
  for (const operation of operations) {
    if (operation.action === 'create') counts.creates += 1
    else if (operation.action === 'set') counts.sets += 1
    else if (operation.action === 'delete') counts.deletes += 1
    counts.totalOperations += 1
  }
  return counts
}

function sha256(value) {
  return createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex')
}

function summarize(plan) {
  return {
    format: plan.format,
    mode: plan.mode,
    readOnly: plan.readOnly,
    target: plan.target,
    inspectedAt: plan.inspectedAt,
    decisions: plan.decisions,
    counts: plan.counts,
    safety: {
      status: plan.safety.status,
      blockerCount: plan.safety.blockers.length,
      warningCount: plan.safety.warnings.length,
    },
    operationSetSha256: plan.operationSetSha256,
    finalPlanSha256: plan.finalPlanSha256,
    applyBoundary: plan.applyBoundary,
  }
}
