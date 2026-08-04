import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { JobApplicationStorage } from '../../models/job-application.model.ts'
import type {
  JobApplicationListResponse,
  JobApplicationListScope,
} from '../../models/job-hiring.model.ts'
import { readJobServerScope } from './runtime.ts'
import {
  APPLICATION_LIMIT,
  appRef,
  assertCurrentAppMembership,
  canonicalApplication,
  fail,
  hasProfile,
  markPrivateRead,
  membershipRef,
  stampMillis,
} from './hiring-records.ts'
import { hydrateViews } from './hiring-views.ts'

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
