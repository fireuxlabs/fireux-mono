import { createHash } from 'node:crypto'
import { Timestamp, type DocumentSnapshot } from 'firebase-admin/firestore'
import { createError, setHeader, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import {
  DIRECT_EMPLOYMENT_TERMS_VERSION,
  JOB_APPLICATION_STATUSES,
  JobApplicationStorage,
  type JobApplication,
  type JobApplicationAction,
  type JobApplicationStatus,
} from '../../models/job-application.model.ts'
import {
  JOB_ENGAGEMENT_STATUSES,
  JobEngagementStorage,
  JobHiringCapacityStorage,
  type JobEngagement,
  type JobEngagementAction,
  type JobEngagementStatus,
} from '../../models/job-engagement.model.ts'
import type {
  JobApplicationListResponse,
  JobApplicationListScope,
  JobApplicationResponse,
  JobApplicationView,
  JobHiringCandidateSummary,
} from '../../models/job-hiring.model.ts'
import {
  JOB_CONTRACT_TYPES,
  JOB_MANAGEMENT_MODES,
  JobStorage,
  type Job,
  type JobContractType,
  type JobManagementMode,
} from '../../models/job.model.ts'
import {
  AppProfessionalStorage,
  ProfessionalStorage,
} from '../../models/profiles/Professional/Professional.model.ts'
import {
  nextApplicationStatus,
  nextEngagementStatus,
  sameFirestoreTimestamp,
  temporaryCapacityAllowsAcceptance,
} from '../../utils/job-hiring-policy.ts'
import { canonicalJobRoot } from './validation.ts'
import { readJobServerScope, type JobServerScope } from './runtime.ts'

const APPLICATION_LIMIT = 100
const APPLICATION_MESSAGE_LIMIT = 2_000
const PREMIUM_TEMPORARY_CAPACITY_LIMIT = 100
const applicationStatuses = new Set<string>(JOB_APPLICATION_STATUSES)
const engagementStatuses = new Set<string>(JOB_ENGAGEMENT_STATUSES)
const contractTypes = new Set<string>(JOB_CONTRACT_TYPES)
const managementModes = new Set<string>(JOB_MANAGEMENT_MODES)

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const text = (value: unknown): string => String(value ?? '').trim()

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string
): void {
  const allowlist = new Set(allowed)
  const unsupported = Object.keys(value).find((key) => !allowlist.has(key))
  if (unsupported)
    fail(400, `${label} contains unsupported field ${unsupported}.`)
}

function markPrivateRead(event: H3Event): void {
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')
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

function appProfessionalRef(
  db: FirebaseFirestore.Firestore,
  appId: string,
  uid: string
) {
  return db.doc(`apps/${appId}/${AppProfessionalStorage.collection}/${uid}`)
}

function isCurrentMembership(snapshot: DocumentSnapshot): boolean {
  if (!snapshot.exists) return false
  return ['user', 'admin'].includes(text(snapshot.data()?.role))
}

function hasProfile(snapshot: DocumentSnapshot, profileId: string): boolean {
  if (!isCurrentMembership(snapshot)) return false
  const profiles = snapshot.data()?.profiles
  return Array.isArray(profiles) && profiles.map(text).includes(profileId)
}

function assertCurrentAppMembership(
  appSnapshot: DocumentSnapshot,
  membershipSnapshot: DocumentSnapshot
): void {
  if (!appSnapshot.exists) fail(503, 'The current App is unavailable.')
  if (!isCurrentMembership(membershipSnapshot)) {
    fail(403, 'Current App membership is required.')
  }
}

function hasPremiumCapacity(snapshot: DocumentSnapshot): boolean {
  if (!isCurrentMembership(snapshot)) return false
  const data = snapshot.data()
  return data?.role === 'admin' || data?.is_premium === true
}

function applicationDocumentId(jobId: string, candidateUid: string): string {
  return createHash('sha256')
    .update(`${jobId}\u0000${candidateUid}`)
    .digest('hex')
}

function capacityDocumentId(appId: string, employerUid: string): string {
  return createHash('sha256')
    .update(`${appId}\u0000${employerUid}`)
    .digest('hex')
}

function stampMillis(value: unknown): number {
  const at = record(value).at as
    | {
        toMillis?: () => number
        seconds?: number
      }
    | undefined
  if (at && typeof at.toMillis === 'function') return at.toMillis()
  return typeof at?.seconds === 'number' ? at.seconds * 1_000 : 0
}

function canonicalJob(snapshot: DocumentSnapshot): Job {
  if (!snapshot.exists) fail(404, 'Job not found.')
  try {
    return canonicalJobRoot(snapshot.id, snapshot.data())
  } catch {
    return fail(503, 'The stored Job is not canonical.')
  }
}

function requiredText(
  source: Record<string, unknown>,
  key: string,
  maximum = 1_500
): string {
  const value = text(source[key])
  if (!value || value.length > maximum) {
    fail(503, `Stored ${key} is invalid.`)
  }
  return value
}

function canonicalApplication(snapshot: DocumentSnapshot): JobApplication {
  if (!snapshot.exists) fail(404, 'Application not found.')
  const source = record(snapshot.data())
  const status = text(source.status)
  if (!applicationStatuses.has(status)) {
    fail(503, 'The stored Application is not canonical.')
  }
  const message =
    typeof source.message === 'string' ? source.message.trim() : ''
  if (message.length > APPLICATION_MESSAGE_LIMIT) {
    fail(503, 'The stored Application is not canonical.')
  }
  const termsVersion =
    source.direct_employment_terms_version === null
      ? null
      : text(source.direct_employment_terms_version)
  const termsAcceptedAt =
    source.direct_employment_terms_accepted_at === null
      ? null
      : source.direct_employment_terms_accepted_at
  if (
    (termsVersion !== null && !termsVersion) ||
    (termsAcceptedAt !== null &&
      typeof (termsAcceptedAt as { toMillis?: unknown }).toMillis !==
        'function') ||
    (termsVersion === null) !== (termsAcceptedAt === null)
  ) {
    fail(503, 'The stored Application is not canonical.')
  }
  return {
    id: snapshot.id,
    source_app_id: requiredText(source, 'source_app_id'),
    source_ecosystem_id: requiredText(source, 'source_ecosystem_id', 120),
    job_id: requiredText(source, 'job_id'),
    employer_user_id: requiredText(source, 'employer_user_id'),
    candidate_user_id: requiredText(source, 'candidate_user_id'),
    company_id: requiredText(source, 'company_id'),
    place_id: requiredText(source, 'place_id'),
    message,
    status: status as JobApplicationStatus,
    offer_job_updated_at: optionalTimestamp(source.offer_job_updated_at),
    direct_employment_terms_version: termsVersion,
    direct_employment_terms_accepted_at:
      termsAcceptedAt as JobApplication['direct_employment_terms_accepted_at'],
    created: source.created as JobApplication['created'],
    updated: source.updated as JobApplication['updated'],
  }
}

function optionalTimestamp(value: unknown) {
  if (value == null) return null
  const candidate = value as { toMillis?: () => number }
  if (typeof candidate.toMillis !== 'function') {
    fail(503, 'The stored Engagement is not canonical.')
  }
  return value as JobEngagement['start_at']
}

function canonicalEngagement(snapshot: DocumentSnapshot): JobEngagement {
  if (!snapshot.exists) fail(404, 'Engagement not found.')
  const source = record(snapshot.data())
  const status = text(source.status)
  const contractType = text(source.contract_type)
  const managementMode = text(source.management_mode)
  if (
    !engagementStatuses.has(status) ||
    !contractTypes.has(contractType) ||
    !managementModes.has(managementMode)
  ) {
    fail(503, 'The stored Engagement is not canonical.')
  }
  return {
    id: snapshot.id,
    source_app_id: requiredText(source, 'source_app_id'),
    source_ecosystem_id: requiredText(source, 'source_ecosystem_id', 120),
    application_id: requiredText(source, 'application_id'),
    job_id: requiredText(source, 'job_id'),
    employer_user_id: requiredText(source, 'employer_user_id'),
    worker_user_id: requiredText(source, 'worker_user_id'),
    company_id: requiredText(source, 'company_id'),
    place_id: requiredText(source, 'place_id'),
    contract_type: contractType as JobContractType,
    management_mode: managementMode as JobManagementMode,
    status: status as JobEngagementStatus,
    direct_employment_terms_version: requiredText(
      source,
      'direct_employment_terms_version',
      80
    ),
    start_at: optionalTimestamp(source.start_at),
    end_at: optionalTimestamp(source.end_at),
    started_at: optionalTimestamp(source.started_at),
    completed_at: optionalTimestamp(source.completed_at),
    cancelled_at: optionalTimestamp(source.cancelled_at),
    created: source.created as JobEngagement['created'],
    updated: source.updated as JobEngagement['updated'],
  }
}

function normalizeMessage(input: unknown): string {
  const source = record(input)
  exactKeys(source, ['message'], 'Application')
  const message =
    typeof source.message === 'string' ? source.message.trim() : ''
  if (message.length > APPLICATION_MESSAGE_LIMIT) {
    fail(
      400,
      `Application message must be ${APPLICATION_MESSAGE_LIMIT} characters or less.`
    )
  }
  return message
}

function applicationAction(input: unknown): {
  action: JobApplicationAction
  acceptsDirectEmploymentTerms: boolean
} {
  const source = record(input)
  exactKeys(
    source,
    ['action', 'accept_direct_employment_terms'],
    'Application action'
  )
  const action = text(source.action)
  if (!['offer', 'reject', 'withdraw', 'accept'].includes(action)) {
    fail(400, 'Application action is invalid.')
  }
  return {
    action: action as JobApplicationAction,
    acceptsDirectEmploymentTerms:
      source.accept_direct_employment_terms === true,
  }
}

function engagementAction(input: unknown): JobEngagementAction {
  const source = record(input)
  exactKeys(source, ['action'], 'Engagement action')
  const action = text(source.action)
  if (!['start', 'complete', 'cancel'].includes(action)) {
    fail(400, 'Engagement action is invalid.')
  }
  return action as JobEngagementAction
}

function publicCandidate(
  id: string,
  snapshot: DocumentSnapshot | undefined
): JobHiringCandidateSummary | null {
  if (!snapshot?.exists) return null
  const data = record(snapshot.data())
  const title = text(data.title).slice(0, 120)
  const subtitle = text(data.subtitle).slice(0, 240)
  const imageValue = text(data.image)
  let image = ''
  if (imageValue) {
    try {
      const parsed = new URL(imageValue)
      if (
        parsed.protocol === 'https:' &&
        !parsed.username &&
        !parsed.password
      ) {
        image = parsed.toString()
      }
    } catch {
      image = ''
    }
  }
  return { id, title, subtitle, image }
}

async function hydrateViews(
  scope: JobServerScope,
  applications: JobApplication[],
  includeCandidates: boolean
): Promise<JobApplicationView[]> {
  if (!applications.length) return []
  const db = getRuntimeFirestore(scope.databaseId)
  const identityDb = getRuntimeIdentityFirestore(scope.identityDatabaseId)
  const jobIds = Array.from(new Set(applications.map((item) => item.job_id)))
  const candidateIds = includeCandidates
    ? Array.from(new Set(applications.map((item) => item.candidate_user_id)))
    : []
  const [jobSnapshots, engagementSnapshots, candidateSnapshots] =
    await Promise.all([
      db.getAll(
        ...jobIds.map((id) => db.collection(JobStorage.collection).doc(id))
      ),
      db.getAll(
        ...applications.map((item) =>
          db.collection(JobEngagementStorage.collection).doc(item.id)
        )
      ),
      candidateIds.length
        ? identityDb.getAll(
            ...candidateIds.map((id) =>
              identityDb.collection(ProfessionalStorage.rootCollection).doc(id)
            )
          )
        : Promise.resolve([] as DocumentSnapshot[]),
    ])
  const jobs = new Map(
    jobSnapshots.map((snapshot) => [snapshot.id, canonicalJob(snapshot)])
  )
  const engagements = new Map(
    engagementSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => [snapshot.id, canonicalEngagement(snapshot)])
  )
  const candidates = new Map(
    candidateSnapshots.map((snapshot) => [
      snapshot.id,
      publicCandidate(snapshot.id, snapshot),
    ])
  )
  return applications.map((application) => {
    const job = jobs.get(application.job_id)
    if (!job || job.source_app_id !== scope.appId) {
      fail(503, 'An Application references an unavailable Job.')
    }
    return {
      application,
      job: {
        id: job.id,
        title: job.title,
        contract_type: job.contract_type,
        management_mode: job.management_mode,
        company_id: job.company_id,
        place_id: job.place_id,
      },
      candidate: includeCandidates
        ? (candidates.get(application.candidate_user_id) ?? null)
        : null,
      engagement: engagements.get(application.id) ?? null,
    }
  })
}

async function viewResponse(
  scope: JobServerScope,
  application: JobApplication,
  includeCandidate: boolean
): Promise<JobApplicationResponse> {
  const [item] = await hydrateViews(scope, [application], includeCandidate)
  if (!item) fail(503, 'Application view is unavailable.')
  return { item }
}

export async function createJobApplication(
  event: H3Event,
  rawJobId: unknown,
  input: unknown
): Promise<JobApplicationResponse> {
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readJobServerScope(event)
  if (!scope.profiles.has('professional')) {
    fail(403, 'Professional profiles are not enabled for this App.')
  }
  const jobId = requireFirestoreDocumentId(rawJobId, 'Job id')
  const message = normalizeMessage(input)
  const db = getRuntimeFirestore(scope.databaseId)
  const identityDb = getRuntimeIdentityFirestore(scope.identityDatabaseId)
  const rootProfessional = await identityDb
    .collection(ProfessionalStorage.rootCollection)
    .doc(uid)
    .get()
  if (!rootProfessional.exists) {
    fail(403, 'Complete your Professional profile before applying.')
  }
  const id = applicationDocumentId(jobId, uid)
  const applicationRef = db.collection(JobApplicationStorage.collection).doc(id)
  const jobRef = db.collection(JobStorage.collection).doc(jobId)
  const currentAppRef = appRef(db, scope.appId)
  const currentMembershipRef = membershipRef(db, scope.appId, uid)
  const currentProfessionalRef = appProfessionalRef(db, scope.appId, uid)

  await db.runTransaction(async (transaction) => {
    const [
      appSnapshot,
      membershipSnapshot,
      appProfessionalSnapshot,
      jobSnapshot,
      existingApplication,
    ] = await transaction.getAll(
      currentAppRef,
      currentMembershipRef,
      currentProfessionalRef,
      jobRef,
      applicationRef
    )
    assertCurrentAppMembership(appSnapshot, membershipSnapshot)
    if (
      !hasProfile(membershipSnapshot, 'professional') ||
      !appProfessionalSnapshot.exists
    ) {
      fail(403, 'Complete your Professional profile before applying.')
    }
    if (existingApplication.exists) {
      fail(409, 'You have already applied for this job.')
    }
    const job = canonicalJob(jobSnapshot)
    if (
      job.source_app_id !== scope.appId ||
      job.visibility !== 'public' ||
      job.status !== 'open'
    ) {
      fail(404, 'Job not found.')
    }
    if (job.owner_id === uid) {
      fail(400, 'You cannot apply to your own job.')
    }
    transaction.create(applicationRef, {
      source_app_id: scope.appId,
      source_ecosystem_id: scope.ecosystemId,
      job_id: job.id,
      employer_user_id: job.owner_id,
      candidate_user_id: uid,
      company_id: job.company_id,
      place_id: job.place_id,
      message,
      status: 'submitted',
      offer_job_updated_at: null,
      direct_employment_terms_version: null,
      direct_employment_terms_accepted_at: null,
      created: serverAuditStamp({ by: uid, appId: scope.appId }),
      updated: serverAuditStamp({ by: uid }),
    })
  })

  return viewResponse(
    scope,
    canonicalApplication(await applicationRef.get()),
    false
  )
}

export async function listJobApplications(
  event: H3Event,
  rawScope: unknown
): Promise<JobApplicationListResponse> {
  markPrivateRead(event)
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readJobServerScope(event)
  const listScope: JobApplicationListScope =
    rawScope === 'employer' ? 'employer' : 'candidate'
  const db = getRuntimeFirestore(scope.databaseId)
  const [appSnapshot, membershipSnapshot] = await db.getAll(
    appRef(db, scope.appId),
    membershipRef(db, scope.appId, uid)
  )
  assertCurrentAppMembership(appSnapshot, membershipSnapshot)
  if (listScope === 'employer' && !hasProfile(membershipSnapshot, 'agent')) {
    fail(403, 'An active Agent profile is required.')
  }
  if (
    listScope === 'candidate' &&
    !hasProfile(membershipSnapshot, 'professional')
  ) {
    fail(403, 'An active Professional profile is required.')
  }
  const ownerField =
    listScope === 'employer' ? 'employer_user_id' : 'candidate_user_id'
  const snapshot = await db
    .collection(JobApplicationStorage.collection)
    .where('source_app_id', '==', scope.appId)
    .where(ownerField, '==', uid)
    .limit(APPLICATION_LIMIT + 1)
    .get()
  const items = snapshot.docs
    .slice(0, APPLICATION_LIMIT)
    .map(canonicalApplication)
    .sort((left, right) => {
      const difference = stampMillis(right.updated) - stampMillis(left.updated)
      return difference || left.id.localeCompare(right.id)
    })
  return {
    items: await hydrateViews(scope, items, listScope === 'employer'),
    limit: APPLICATION_LIMIT,
    truncated: snapshot.size > APPLICATION_LIMIT,
  }
}

export async function mutateJobApplication(
  event: H3Event,
  rawApplicationId: unknown,
  input: unknown
): Promise<JobApplicationResponse> {
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readJobServerScope(event)
  const applicationId = requireFirestoreDocumentId(
    rawApplicationId,
    'Application id'
  )
  const requested = applicationAction(input)
  const db = getRuntimeFirestore(scope.databaseId)
  const applicationRef = db
    .collection(JobApplicationStorage.collection)
    .doc(applicationId)
  const engagementRef = db
    .collection(JobEngagementStorage.collection)
    .doc(applicationId)

  await db.runTransaction(async (transaction) => {
    const applicationSnapshot = await transaction.get(applicationRef)
    const application = canonicalApplication(applicationSnapshot)
    if (application.source_app_id !== scope.appId) {
      fail(404, 'Application not found.')
    }
    const isEmployer = application.employer_user_id === uid
    const isCandidate = application.candidate_user_id === uid
    if (!isEmployer && !isCandidate) fail(404, 'Application not found.')

    if (requested.action === 'offer' || requested.action === 'reject') {
      if (!isEmployer) fail(403, 'Only the employer can perform this action.')
      const jobRef = db
        .collection(JobStorage.collection)
        .doc(application.job_id)
      const [appSnapshot, membershipSnapshot, jobSnapshot] =
        await transaction.getAll(
          appRef(db, scope.appId),
          membershipRef(db, scope.appId, uid),
          jobRef
        )
      assertCurrentAppMembership(appSnapshot, membershipSnapshot)
      if (!hasProfile(membershipSnapshot, 'agent')) {
        fail(403, 'An active Agent profile is required.')
      }
      const nextStatus = nextApplicationStatus(
        application.status,
        requested.action,
        'employer'
      )
      if (!nextStatus) {
        fail(409, 'This Application can no longer be changed that way.')
      }
      const job = canonicalJob(jobSnapshot)
      if (
        job.source_app_id !== scope.appId ||
        job.owner_id !== uid ||
        job.company_id !== application.company_id ||
        job.place_id !== application.place_id
      ) {
        fail(409, 'The Job no longer matches this Application.')
      }
      transaction.update(applicationRef, {
        status: nextStatus,
        ...(requested.action === 'offer'
          ? { offer_job_updated_at: job.updated.at }
          : {}),
        updated: serverAuditStamp({ by: uid }),
      })
      return
    }

    if (requested.action === 'withdraw') {
      if (!isCandidate) fail(403, 'Only the candidate can withdraw.')
      const nextStatus = nextApplicationStatus(
        application.status,
        requested.action,
        'candidate'
      )
      if (!nextStatus) {
        fail(409, 'This Application can no longer be withdrawn.')
      }
      transaction.update(applicationRef, {
        status: nextStatus,
        updated: serverAuditStamp({ by: uid }),
      })
      return
    }

    if (!isCandidate) fail(403, 'Only the candidate can accept an offer.')
    if (!requested.acceptsDirectEmploymentTerms) {
      fail(
        400,
        'Confirm that the employer—not the platform—will employ and pay you directly.'
      )
    }
    if (
      nextApplicationStatus(application.status, 'accept', 'candidate') !==
      'engaged'
    ) {
      fail(409, 'This offer is no longer available.')
    }
    const jobRef = db.collection(JobStorage.collection).doc(application.job_id)
    const employerMembershipRef = membershipRef(
      db,
      scope.appId,
      application.employer_user_id
    )
    const capacityRef = db
      .collection(JobHiringCapacityStorage.collection)
      .doc(capacityDocumentId(scope.appId, application.employer_user_id))
    const [
      appSnapshot,
      candidateMembershipSnapshot,
      employerMembershipSnapshot,
      jobSnapshot,
      engagementSnapshot,
      capacitySnapshot,
    ] = await transaction.getAll(
      appRef(db, scope.appId),
      membershipRef(db, scope.appId, uid),
      employerMembershipRef,
      jobRef,
      engagementRef,
      capacityRef
    )
    assertCurrentAppMembership(appSnapshot, candidateMembershipSnapshot)
    if (!isCurrentMembership(employerMembershipSnapshot)) {
      fail(409, 'The employer is no longer active in this App.')
    }
    if (engagementSnapshot.exists) {
      fail(409, 'This offer has already created an Engagement.')
    }
    const job = canonicalJob(jobSnapshot)
    if (
      job.source_app_id !== scope.appId ||
      job.owner_id !== application.employer_user_id ||
      job.company_id !== application.company_id ||
      job.place_id !== application.place_id
    ) {
      fail(409, 'The Job no longer matches this Application.')
    }
    if (
      !application.offer_job_updated_at ||
      !sameFirestoreTimestamp(application.offer_job_updated_at, job.updated.at)
    ) {
      fail(
        409,
        'The Job terms changed after this offer. Ask the employer to update the offer before accepting.'
      )
    }
    const capacityData = record(capacitySnapshot.data())
    const activeIds = Array.isArray(
      capacityData.active_temporary_engagement_ids
    )
      ? Array.from(
          new Set(
            capacityData.active_temporary_engagement_ids
              .map(text)
              .filter(Boolean)
          )
        )
      : []
    if (activeIds.length > PREMIUM_TEMPORARY_CAPACITY_LIMIT) {
      fail(503, 'The employer temporary-work capacity record is invalid.')
    }
    const occupiesTemporaryCapacity = job.contract_type === 'temporary'
    if (
      !temporaryCapacityAllowsAcceptance({
        contractType: job.contract_type,
        hasPremiumCapacity: hasPremiumCapacity(employerMembershipSnapshot),
        activeTemporaryEngagementCount: activeIds.length,
        premiumLimit: PREMIUM_TEMPORARY_CAPACITY_LIMIT,
      })
    ) {
      fail(
        409,
        hasPremiumCapacity(employerMembershipSnapshot)
          ? 'The employer has reached the supported temporary Engagement limit.'
          : 'The employer must finish the current temporary Engagement before accepting another or activate Premium access in this App.'
      )
    }
    const now = Timestamp.now()
    transaction.create(engagementRef, {
      source_app_id: scope.appId,
      source_ecosystem_id: scope.ecosystemId,
      application_id: application.id,
      job_id: job.id,
      employer_user_id: application.employer_user_id,
      worker_user_id: application.candidate_user_id,
      company_id: job.company_id,
      place_id: job.place_id,
      contract_type: job.contract_type,
      management_mode: job.management_mode,
      status: 'accepted',
      direct_employment_terms_version: DIRECT_EMPLOYMENT_TERMS_VERSION,
      start_at: job.start_at,
      end_at: job.end_at,
      started_at: null,
      completed_at: null,
      cancelled_at: null,
      created: serverAuditStamp({ by: uid, appId: scope.appId }),
      updated: serverAuditStamp({ by: uid }),
    })
    transaction.update(applicationRef, {
      status: 'engaged',
      direct_employment_terms_version: DIRECT_EMPLOYMENT_TERMS_VERSION,
      direct_employment_terms_accepted_at: now,
      updated: serverAuditStamp({ by: uid }),
    })
    if (occupiesTemporaryCapacity) {
      transaction.set(capacityRef, {
        source_app_id: scope.appId,
        employer_user_id: application.employer_user_id,
        active_temporary_engagement_ids: [...activeIds, engagementRef.id],
        updated_at: now,
      })
    }
  })

  return viewResponse(
    scope,
    canonicalApplication(await applicationRef.get()),
    false
  )
}

export async function mutateJobEngagement(
  event: H3Event,
  rawEngagementId: unknown,
  input: unknown
): Promise<JobApplicationResponse> {
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readJobServerScope(event)
  const engagementId = requireFirestoreDocumentId(
    rawEngagementId,
    'Engagement id'
  )
  const action = engagementAction(input)
  const db = getRuntimeFirestore(scope.databaseId)
  const engagementRef = db
    .collection(JobEngagementStorage.collection)
    .doc(engagementId)
  const applicationRef = db
    .collection(JobApplicationStorage.collection)
    .doc(engagementId)

  await db.runTransaction(async (transaction) => {
    const engagementSnapshot = await transaction.get(engagementRef)
    const engagement = canonicalEngagement(engagementSnapshot)
    if (
      engagement.source_app_id !== scope.appId ||
      engagement.employer_user_id !== uid
    ) {
      fail(404, 'Engagement not found.')
    }
    const [appSnapshot, membershipSnapshot] = await transaction.getAll(
      appRef(db, scope.appId),
      membershipRef(db, scope.appId, uid)
    )
    assertCurrentAppMembership(appSnapshot, membershipSnapshot)
    if (!hasProfile(membershipSnapshot, 'agent')) {
      fail(403, 'An active Agent profile is required.')
    }
    const capacityRef =
      engagement.contract_type === 'temporary'
        ? db
            .collection(JobHiringCapacityStorage.collection)
            .doc(capacityDocumentId(scope.appId, uid))
        : null
    const capacitySnapshot = capacityRef
      ? await transaction.get(capacityRef)
      : null
    const now = Timestamp.now()
    const nextStatus = nextEngagementStatus(engagement.status, action)
    if (!nextStatus) {
      fail(409, 'This Engagement cannot be changed that way.')
    }
    if (nextStatus === 'active') {
      transaction.update(engagementRef, {
        status: nextStatus,
        started_at: now,
        updated: serverAuditStamp({ by: uid }),
      })
      return
    }
    transaction.update(engagementRef, {
      status: nextStatus,
      ...(nextStatus === 'completed'
        ? { completed_at: now }
        : { cancelled_at: now }),
      updated: serverAuditStamp({ by: uid }),
    })
    if (capacityRef && capacitySnapshot?.exists) {
      const source = record(capacitySnapshot.data())
      const activeIds = Array.isArray(source.active_temporary_engagement_ids)
        ? source.active_temporary_engagement_ids
            .map(text)
            .filter((id) => id && id !== engagement.id)
        : []
      transaction.update(capacityRef, {
        active_temporary_engagement_ids: Array.from(new Set(activeIds)),
        updated_at: now,
      })
    }
  })

  const application = canonicalApplication(await applicationRef.get())
  return viewResponse(scope, application, true)
}
