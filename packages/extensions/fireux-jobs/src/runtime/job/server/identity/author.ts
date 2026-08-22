// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: own bounded author reads and all Job lifecycle writes through Admin.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: authorize explicit Agent owners and exact canonical roots.
import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { createError, setHeader, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { canonicalCompanyRole } from 'fireux-companies/runtime/place/server/company/canonical'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type {
  AuthorJobListResponse,
  AuthorJobResponse,
  CreateAuthorJobResponse,
  PublishAuthorJobResponse,
} from '../../models/job-author.model.ts'
import { JobStorage, type Job } from '../../models/job.model.ts'
import { AgentStorage } from '../../../utils/profiles/Agent/agent.ts'
import { readJobServerScope } from '../core/runtime.ts'
import { canonicalJobRoot } from '../core/validation.ts'
import {
  jobCreateFields,
  jobReferences,
  normalizeJobCreateIntent,
} from '../core/validation.ts'

const AUTHOR_JOB_LIMIT = 100

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => String(value ?? '').trim()

function notFound(): never {
  throw createError({ statusCode: 404, statusMessage: 'Job not found.' })
}

function markPrivateRead(event: H3Event): void {
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')
}

function canonicalJob(snapshot: DocumentSnapshot): Job {
  try {
    return canonicalJobRoot(snapshot.id, snapshot.data())
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'The stored Job is not canonical.',
    })
  }
}

export function assertAuthorJob(
  snapshot: DocumentSnapshot,
  uid: string,
  appId: string
): Job {
  if (!snapshot.exists) notFound()
  const job = canonicalJob(snapshot)
  if (
    job.owner_type !== 'user' ||
    job.owner_id !== uid ||
    job.source_app_id !== appId
  ) {
    notFound()
  }
  return job
}

function stampMillis(value: unknown): number {
  const at = record(value).at as
    | { toMillis?: () => number; seconds?: number }
    | undefined
  if (at && typeof at.toMillis === 'function') return at.toMillis()
  return typeof at?.seconds === 'number' ? at.seconds * 1_000 : 0
}

export function referenceDocuments(
  db: FirebaseFirestore.Firestore,
  job: ReturnType<typeof normalizeJobCreateIntent>
) {
  return jobReferences(job).map((reference) => ({
    ...reference,
    ref: db.doc(reference.path),
  }))
}

export function assertCanonicalReferences(
  job: ReturnType<typeof normalizeJobCreateIntent>,
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

  const values = new Map(
    references.map((reference, index) => [
      reference.path,
      record(snapshots[index]?.data()),
    ])
  )
  const company = canonicalCompanyRole(
    job.company_id,
    values.get(`companies/${job.company_id}`) || {}
  )
  const companyPlace = normalizePlace(
    job.company_id,
    values.get(`places/${job.company_id}`) || {}
  )
  const place = normalizePlace(
    job.place_id,
    values.get(`places/${job.place_id}`) || {}
  )
  if (!company || !companyPlace || !place) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job Company and Place relationships must be canonical.',
    })
  }
}

function isCurrentMembership(snapshot: DocumentSnapshot): boolean {
  if (!snapshot.exists) return false
  const role = text(snapshot.data()?.role)
  return role === 'user' || role === 'admin'
}

export function membershipRef(
  db: FirebaseFirestore.Firestore,
  appId: string,
  uid: string
) {
  return db.doc(`apps/${appId}/users/${uid}`)
}

export function appRef(db: FirebaseFirestore.Firestore, appId: string) {
  return db.doc(`apps/${appId}`)
}

function assertCurrentMembership(snapshot: DocumentSnapshot): void {
  if (!isCurrentMembership(snapshot)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Current App membership is required.',
    })
  }
}

export function assertCurrentAppMembership(
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

export async function requireAgentRoot(
  databaseId: string,
  uid: string
): Promise<void> {
  const snapshot = await getRuntimeIdentityFirestore(databaseId)
    .doc(`users/${uid}/profiles/${AgentStorage.document}`)
    .get()
  if (!snapshot.exists) {
    throw createError({
      statusCode: 403,
      statusMessage: 'An active Agent profile in this App is required.',
    })
  }
}

export function assertAgentEnabled(profiles: ReadonlySet<string>): void {
  if (!profiles.has('agent')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Agent profiles are not enabled for this App.',
    })
  }
}

export async function listAuthorJobs(
  event: H3Event
): Promise<AuthorJobListResponse> {
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
    .where('source_app_id', '==', scope.appId)
    .where('owner_id', '==', uid)
    .limit(AUTHOR_JOB_LIMIT + 1)
    .get()
  const matching = snapshot.docs
    .slice(0, AUTHOR_JOB_LIMIT)
    .sort((left, right) => {
      const difference =
        stampMillis(right.data().updated) - stampMillis(left.data().updated)
      return difference || left.id.localeCompare(right.id)
    })
  return {
    items: matching.map((document) =>
      assertAuthorJob(document, uid, scope.appId)
    ),
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
  const snapshot = await db.collection(JobStorage.collection).doc(id).get()
  return { job: assertAuthorJob(snapshot, uid, scope.appId) }
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
  const required = [
    appRef(db, scope.appId),
    membershipRef(db, scope.appId, uid),
    ...references.map((reference) => reference.ref),
  ]

  await db.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(...required)
    const [appSnapshot, membershipSnapshot, ...referenceSnapshots] = snapshots
    assertCurrentAppMembership(appSnapshot, membershipSnapshot)
    assertCanonicalReferences(job, references, referenceSnapshots)

    transaction.create(jobRef, {
      ...job,
      source_app_id: scope.appId,
      source_ecosystem_id: scope.ecosystemId,
      owner_type: 'user',
      owner_id: uid,
      visibility: 'app',
      status: 'open',
      created: serverAuditStamp({ by: uid, appId: scope.appId }),
      updated: serverAuditStamp({ by: uid }),
    })
  })

  const saved = await jobRef.get()
  const savedData = assertAuthorJob(saved, uid, scope.appId)
  return {
    id: jobRef.id,
    created: true,
    job: savedData,
  }
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

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(jobRef)
    const current = assertAuthorJob(snapshot, uid, scope.appId)
    const normalized = normalizeJobCreateIntent(
      jobCreateFields(current as unknown as Record<string, unknown>),
      scope
    )
    const references = referenceDocuments(db, normalized)
    const [appSnapshot, membershipSnapshot, ...referenceSnapshots] =
      await transaction.getAll(
        currentAppRef,
        currentMembershipRef,
        ...references.map((reference) => reference.ref)
      )
    assertCurrentAppMembership(appSnapshot, membershipSnapshot)
    assertCanonicalReferences(normalized, references, referenceSnapshots)

    transaction.update(jobRef, {
      visibility: 'public',
      updated: serverAuditStamp({ by: uid }),
    })
  })

  const saved = await jobRef.get()
  const savedData = assertAuthorJob(saved, uid, scope.appId)
  return { id, published: true, job: savedData }
}
