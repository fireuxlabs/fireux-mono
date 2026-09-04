import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { JobApplicationStorage } from '../../../models/job-application.model.ts'
import type {
  JobApplicationListResponse,
  JobApplicationListScope,
} from '../../../models/job-hiring.model.ts'
import { readJobServerScope } from '../../core/runtime.ts'
import {
  APPLICATION_LIMIT,
  assertAppUserSession,
  canonicalApplication,
  fail,
  hasProfile,
  markPrivateRead,
  stampMillis,
  userProfileRef,
} from './records.ts'
import { hydrateViews } from './views.ts'

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
  const identityDb = getRuntimeIdentityFirestore(scope.identityDatabaseId)
  const profileRef =
    listScope === 'employer'
      ? userProfileRef(identityDb, uid, 'agent')
      : userProfileRef(identityDb, uid, 'professional')
  const [appSnapshot, membershipSnapshot, profileSnapshot] = await Promise.all([
    db.doc(`apps/${scope.appId}`).get(),
    db.doc(`apps/${scope.appId}/users/${uid}`).get(),
    profileRef.get(),
  ])
  assertAppUserSession(appSnapshot, membershipSnapshot)
  if (listScope === 'employer' && !hasProfile(profileSnapshot)) {
    fail(403, 'An active Agent profile is required.')
  }
  if (listScope === 'candidate' && !hasProfile(profileSnapshot)) {
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
