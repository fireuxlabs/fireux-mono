import { Timestamp } from 'firebase-admin/firestore'
import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { JobApplicationStorage } from '../../models/job-application.model.ts'
import {
  JobEngagementStorage,
  JobHiringCapacityStorage,
} from '../../models/job-engagement.model.ts'
import type { JobApplicationResponse } from '../../models/job-hiring.model.ts'
import { nextEngagementStatus } from '../../utils/job-hiring-policy.ts'
import { readJobServerScope } from '../core/runtime.ts'
import {
  appRef,
  assertAppUserSession,
  canonicalApplication,
  canonicalEngagement,
  capacityDocumentId,
  engagementAction,
  fail,
  hasProfile,
  membershipRef,
  record,
  text,
  userProfileRef,
} from './records.ts'
import { viewResponse } from './views.ts'

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
  const identityDb = getRuntimeIdentityFirestore(scope.identityDatabaseId)
  if (!hasProfile(await userProfileRef(identityDb, uid, 'agent').get())) {
    fail(403, 'An active Agent profile is required.')
  }
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
    const [appSnapshot, membershipSnapshot] =
      await transaction.getAll(
        appRef(db, scope.appId),
        membershipRef(db, scope.appId, uid)
      )
    assertAppUserSession(appSnapshot, membershipSnapshot)
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
