import { Timestamp } from 'firebase-admin/firestore'
import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { JobApplicationStorage } from '../../../models/job-application.model.ts'
import {
  JobEngagementStorage,
  JobHiringCapacityStorage,
} from '../../../models/job-engagement.model.ts'
import type { JobApplicationResponse } from '../../../models/job-hiring.model.ts'
import { JobStorage } from '../../../models/job.model.ts'
import { ProfessionalStorage } from '../../../../utils/profiles/Professional/professional.ts'
import {
  nextApplicationStatus,
  sameFirestoreTimestamp,
  temporaryCapacityAllowsAcceptance,
} from '../../../utils/job-hiring-policy.ts'
import { readJobServerScope } from '../../core/runtime.ts'
import {
  applicationAction,
  applicationDocumentId,
  appRef,
  assertCurrentAppMembership,
  canonicalApplication,
  canonicalJob,
  capacityDocumentId,
  DIRECT_EMPLOYMENT_TERMS_VERSION,
  fail,
  hasPremiumCapacity,
  hasProfile,
  isCurrentMembership,
  membershipRef,
  normalizeMessage,
  PREMIUM_TEMPORARY_CAPACITY_LIMIT,
  record,
  text,
  userProfileRef,
} from './records.ts'
import { viewResponse } from './views.ts'

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
    .doc(`users/${uid}/profiles/${ProfessionalStorage.document}`)
    .get()
  if (!rootProfessional.exists) {
    fail(403, 'Complete your Professional profile before applying.')
  }
  const id = applicationDocumentId(jobId, uid)
  const applicationRef = db.collection(JobApplicationStorage.collection).doc(id)
  const jobRef = db.collection(JobStorage.collection).doc(jobId)
  const currentAppRef = appRef(db, scope.appId)
  const currentMembershipRef = membershipRef(db, scope.appId, uid)

  await db.runTransaction(async (transaction) => {
    const [
      appSnapshot,
      membershipSnapshot,
      jobSnapshot,
      existingApplication,
    ] = await transaction.getAll(
      currentAppRef,
      currentMembershipRef,
      jobRef,
      applicationRef
    )
    assertCurrentAppMembership(appSnapshot, membershipSnapshot)
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
    if (job.owner_id === uid) fail(400, 'You cannot apply to your own job.')
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
  if (requested.action === 'offer' || requested.action === 'reject') {
    const identityDb = getRuntimeIdentityFirestore(scope.identityDatabaseId)
    const agentProfile = await userProfileRef(identityDb, uid, 'agent').get()
    if (!hasProfile(agentProfile)) {
      fail(403, 'An active Agent profile is required.')
    }
  }
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
