// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: own bounded author reads and all Job lifecycle writes through Admin.
import type {
  DocumentSnapshot,
} from 'firebase-admin/firestore'
import { createError, setHeader, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import type {
  AuthorJobListResponse,
  AuthorJobResponse,
  CreateAuthorJobResponse,
  JobPatchIntent,
  PatchAuthorJobResponse,
  PublishAuthorJobResponse,
} from '../../models/job-author.model.ts'
import { JobStorage, type Job } from '../../models/job.model.ts'
import { AgentStorage, AppAgentStorage } from '../../models/profiles/Agent/Agent.model.ts'
import { readJobServerScope } from './runtime.ts'
import {
  JOB_MUTABLE_FIELDS,
  jobReferences,
  mutableJobFields,
  normalizeJobCreateIntent,
  normalizeJobPatchIntent,
} from './validation.ts'

const AUTHOR_JOB_LIMIT = 100

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const text = (value: unknown) => String(value ?? '').trim()

function notFound(): never {
  throw createError({ statusCode: 404, statusMessage: 'Job not found.' })
}

function markPrivateRead(event: H3Event): void {
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')
}

function assertAuthorJob(
  snapshot: DocumentSnapshot,
  uid: string,
  appId: string
): Record<string, unknown> {
  if (!snapshot.exists) notFound()
  const data = record(snapshot.data())
  const created = record(data.created)
  if (text(created.by) !== uid || text(data.source_app_id) !== appId) {
    notFound()
  }
  return data
}

function stamp(value: unknown): Job['created'] {
  const source = record(value)
  return {
    at: (source.at ?? {}) as Job['created']['at'],
    by: text(source.by) || undefined,
    app_id: text(source.app_id) || undefined,
  }
}

function projectAuthorJob(id: string, value: Record<string, unknown>): Job {
  return {
    id,
    source_app_id: text(value.source_app_id),
    source_ecosystem_id: text(value.source_ecosystem_id),
    owner_type: text(value.owner_type) as Job['owner_type'],
    owner_id: text(value.owner_id),
    visibility: text(value.visibility) as Job['visibility'],
    ...mutableJobFields(value),
    created: stamp(value.created),
    updated: stamp(value.updated),
  }
}

function stampMillis(value: unknown): number {
  const at = record(value).at as { toMillis?: () => number; seconds?: number } | undefined
  if (at && typeof at.toMillis === 'function') return at.toMillis()
  return typeof at?.seconds === 'number' ? at.seconds * 1_000 : 0
}

function referenceDocuments(
  db: FirebaseFirestore.Firestore,
  job: ReturnType<typeof normalizeJobCreateIntent>
) {
  return jobReferences(job).map(reference => ({
    ...reference,
    ref: db.doc(reference.path),
  }))
}

function assertReferencesExist(
  references: ReturnType<typeof referenceDocuments>,
  snapshots: DocumentSnapshot[]
): void {
  const missing = references.find((_, index) => !snapshots[index]?.exists)
  if (missing) {
    throw createError({
      statusCode: 400,
      statusMessage: `${missing.label} is not available.`,
    })
  }
}

function isCurrentMembership(snapshot: DocumentSnapshot): boolean {
  if (!snapshot.exists) return false
  const role = text(snapshot.data()?.role)
  return role === 'user' || role === 'admin'
}

function hasProfile(snapshot: DocumentSnapshot, profileId: string): boolean {
  if (!isCurrentMembership(snapshot)) return false
  const profiles = snapshot.data()?.profiles
  return Array.isArray(profiles) && profiles.map(text).includes(profileId)
}

function membershipRef(
  db: FirebaseFirestore.Firestore,
  appId: string,
  uid: string
) {
  return db.doc(`apps/${appId}/users/${uid}`)
}

function appRef(db: FirebaseFirestore.Firestore, appId: string) {
  return db.doc(`apps/${appId}`)
}

function appAgentRef(
  db: FirebaseFirestore.Firestore,
  appId: string,
  uid: string
) {
  return db.doc(`apps/${appId}/${AppAgentStorage.collection}/${uid}`)
}

function assertCurrentMembership(snapshot: DocumentSnapshot): void {
  if (!isCurrentMembership(snapshot)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Current App membership is required.',
    })
  }
}

function assertCurrentAppMembership(
  appSnapshot: DocumentSnapshot,
  membershipSnapshot: DocumentSnapshot
): void {
  if (!appSnapshot.exists) {
    throw createError({
      statusCode: 503,
      statusMessage: 'The current App is unavailable.',
    })
  }
  assertCurrentMembership(membershipSnapshot)
}

function assertActiveAgent(
  membershipSnapshot: DocumentSnapshot,
  appAgentSnapshot: DocumentSnapshot
): void {
  if (
    !hasProfile(membershipSnapshot, 'agent') ||
    !appAgentSnapshot.exists
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'An active Agent profile in this App is required.',
    })
  }
}

async function requireAgentRoot(
  databaseId: string,
  uid: string
): Promise<void> {
  const snapshot = await getRuntimeIdentityFirestore(databaseId)
    .collection(AgentStorage.rootCollection)
    .doc(uid)
    .get()
  if (!snapshot.exists) {
    throw createError({
      statusCode: 403,
      statusMessage: 'An active Agent profile in this App is required.',
    })
  }
}

function assertAgentEnabled(profiles: ReadonlySet<string>): void {
  if (!profiles.has('agent')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Agent profiles are not enabled for this App.',
    })
  }
}

export async function listAuthorJobs(event: H3Event): Promise<AuthorJobListResponse> {
  markPrivateRead(event)
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readJobServerScope(event)
  const db = getRuntimeFirestore(scope.databaseId)
  const [appSnapshot, membershipSnapshot] = await db.getAll(
    appRef(db, scope.appId),
    membershipRef(db, scope.appId, uid)
  )
  assertCurrentAppMembership(appSnapshot, membershipSnapshot)
  const snapshot = await db
    .collection(JobStorage.collection)
    .where('created.by', '==', uid)
    .limit(AUTHOR_JOB_LIMIT + 1)
    .get()
  const matching = snapshot.docs
    .filter(document => text(document.data().source_app_id) === scope.appId)
    .slice(0, AUTHOR_JOB_LIMIT)
    .sort((left, right) => {
      const difference = stampMillis(right.data().updated) - stampMillis(left.data().updated)
      return difference || left.id.localeCompare(right.id)
    })

  return {
    items: matching.map(document => projectAuthorJob(document.id, document.data())),
    limit: AUTHOR_JOB_LIMIT,
    truncated: snapshot.size > AUTHOR_JOB_LIMIT,
  }
}

export async function getAuthorJob(
  event: H3Event,
  rawId: unknown
): Promise<AuthorJobResponse> {
  markPrivateRead(event)
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readJobServerScope(event)
  const id = requireFirestoreDocumentId(rawId, 'Job id')
  const db = getRuntimeFirestore(scope.databaseId)
  const [appSnapshot, membershipSnapshot] = await db.getAll(
    appRef(db, scope.appId),
    membershipRef(db, scope.appId, uid)
  )
  assertCurrentAppMembership(appSnapshot, membershipSnapshot)
  const snapshot = await db
    .collection(JobStorage.collection)
    .doc(id)
    .get()
  const data = assertAuthorJob(snapshot, uid, scope.appId)
  return { job: projectAuthorJob(id, data) }
}

export async function createAuthorJob(
  event: H3Event,
  input: unknown
): Promise<CreateAuthorJobResponse> {
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readJobServerScope(event)
  assertAgentEnabled(scope.profiles)
  await requireAgentRoot(scope.identityDatabaseId, uid)
  const job = normalizeJobCreateIntent(input, scope)
  const db = getRuntimeFirestore(scope.databaseId)
  const jobRef = db.collection(JobStorage.collection).doc()
  const references = referenceDocuments(db, job)
  const currentAppAgentRef = appAgentRef(db, scope.appId, uid)
  const required = [
    appRef(db, scope.appId),
    currentAppAgentRef,
    membershipRef(db, scope.appId, uid),
    ...references.map(reference => reference.ref),
  ]

  await db.runTransaction(async transaction => {
    const snapshots = await transaction.getAll(...required)
    const [appSnapshot, appAgentSnapshot, membershipSnapshot, ...referenceSnapshots] = snapshots
    assertCurrentAppMembership(appSnapshot, membershipSnapshot)
    assertActiveAgent(
      membershipSnapshot,
      appAgentSnapshot
    )
    assertReferencesExist(references, referenceSnapshots)

    transaction.create(jobRef, {
      ...job,
      source_app_id: scope.appId,
      source_ecosystem_id: scope.ecosystemId,
      owner_type: 'app',
      owner_id: scope.appId,
      visibility: 'app',
      created: serverAuditStamp({ by: uid, appId: scope.appId }),
      updated: serverAuditStamp({ by: uid }),
    })
  })

  const saved = await jobRef.get()
  const savedData = assertAuthorJob(saved, uid, scope.appId)
  return {
    id: jobRef.id,
    created: true,
    job: projectAuthorJob(jobRef.id, savedData),
  }
}

export async function patchAuthorJob(
  event: H3Event,
  rawId: unknown,
  input: unknown
): Promise<PatchAuthorJobResponse> {
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readJobServerScope(event)
  assertAgentEnabled(scope.profiles)
  await requireAgentRoot(scope.identityDatabaseId, uid)
  const id = requireFirestoreDocumentId(rawId, 'Job id')
  const requestedPatch = normalizeJobPatchIntent(input, scope)
  const db = getRuntimeFirestore(scope.databaseId)
  const jobRef = db.collection(JobStorage.collection).doc(id)
  const currentAppRef = appRef(db, scope.appId)
  const currentMembershipRef = membershipRef(db, scope.appId, uid)
  const currentAppAgentRef = appAgentRef(db, scope.appId, uid)

  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(jobRef)
    const current = assertAuthorJob(snapshot, uid, scope.appId)
    const proposed = normalizeJobCreateIntent(
      { ...mutableJobFields(current), ...requestedPatch },
      scope
    )
    const references = referenceDocuments(db, proposed)
    const [appSnapshot, membershipSnapshot, appAgentSnapshot, ...referenceSnapshots] =
      await transaction.getAll(
        currentAppRef,
        currentMembershipRef,
        currentAppAgentRef,
        ...references.map(reference => reference.ref)
      )
    assertCurrentAppMembership(appSnapshot, membershipSnapshot)
    assertActiveAgent(
      membershipSnapshot,
      appAgentSnapshot
    )
    assertReferencesExist(references, referenceSnapshots)

    const patch = Object.fromEntries(
      JOB_MUTABLE_FIELDS
        .filter(key => Object.prototype.hasOwnProperty.call(requestedPatch, key))
        .map(key => [key, proposed[key]])
    ) as JobPatchIntent
    transaction.update(jobRef, {
      ...patch,
      updated: serverAuditStamp({ by: uid }),
    })
  })

  const saved = await jobRef.get()
  const savedData = assertAuthorJob(saved, uid, scope.appId)
  return { id, updated: true, job: projectAuthorJob(id, savedData) }
}

export async function publishAuthorJob(
  event: H3Event,
  rawId: unknown
): Promise<PublishAuthorJobResponse> {
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readJobServerScope(event)
  assertAgentEnabled(scope.profiles)
  await requireAgentRoot(scope.identityDatabaseId, uid)
  const id = requireFirestoreDocumentId(rawId, 'Job id')
  const db = getRuntimeFirestore(scope.databaseId)
  const jobRef = db.collection(JobStorage.collection).doc(id)
  const currentAppRef = appRef(db, scope.appId)
  const currentMembershipRef = membershipRef(db, scope.appId, uid)
  const currentAppAgentRef = appAgentRef(db, scope.appId, uid)

  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(jobRef)
    const current = assertAuthorJob(snapshot, uid, scope.appId)
    const normalized = normalizeJobCreateIntent(mutableJobFields(current), scope)
    const references = referenceDocuments(db, normalized)
    const [appSnapshot, membershipSnapshot, appAgentSnapshot, ...referenceSnapshots] =
      await transaction.getAll(
        currentAppRef,
        currentMembershipRef,
        currentAppAgentRef,
        ...references.map(reference => reference.ref)
      )
    assertCurrentAppMembership(appSnapshot, membershipSnapshot)
    assertActiveAgent(
      membershipSnapshot,
      appAgentSnapshot
    )
    assertReferencesExist(references, referenceSnapshots)

    transaction.update(jobRef, {
      visibility: 'public',
      updated: serverAuditStamp({ by: uid }),
    })
  })

  const saved = await jobRef.get()
  const savedData = assertAuthorJob(saved, uid, scope.appId)
  return { id, published: true, job: projectAuthorJob(id, savedData) }
}
