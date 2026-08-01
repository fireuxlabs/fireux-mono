import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import type {
  JobPatchIntent,
  PatchAuthorJobResponse,
} from '../../models/job-author.model.ts'
import { JobStorage } from '../../models/job.model.ts'
import {
  appAgentRef,
  appRef,
  assertActiveAgent,
  assertAgentEnabled,
  assertAuthorJob,
  assertCanonicalReferences,
  assertCurrentAppMembership,
  membershipRef,
  referenceDocuments,
  requireAgentRoot,
} from './author.ts'
import { readJobServerScope } from './runtime.ts'
import {
  JOB_PATCH_FIELDS,
  jobCreateFields,
  normalizeJobCreateIntent,
  normalizeJobPatchIntent,
} from './validation.ts'

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

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(jobRef)
    const current = assertAuthorJob(snapshot, uid, scope.appId)
    const proposed = normalizeJobCreateIntent(
      {
        ...jobCreateFields(current as unknown as Record<string, unknown>),
        ...requestedPatch,
      },
      scope
    )
    const references = referenceDocuments(db, proposed)
    const [
      appSnapshot,
      membershipSnapshot,
      appAgentSnapshot,
      ...referenceSnapshots
    ] = await transaction.getAll(
      currentAppRef,
      currentMembershipRef,
      currentAppAgentRef,
      ...references.map((reference) => reference.ref)
    )
    assertCurrentAppMembership(appSnapshot, membershipSnapshot)
    assertActiveAgent(membershipSnapshot, appAgentSnapshot)
    assertCanonicalReferences(proposed, references, referenceSnapshots)
    const patch = Object.fromEntries(
      JOB_PATCH_FIELDS.filter((key) =>
        Object.prototype.hasOwnProperty.call(requestedPatch, key)
      ).map((key) => [
        key,
        key === 'status' ? requestedPatch.status : proposed[key],
      ])
    ) as JobPatchIntent
    transaction.update(jobRef, {
      ...patch,
      updated: serverAuditStamp({ by: uid }),
    })
  })
  const saved = await jobRef.get()
  return {
    id,
    updated: true,
    job: assertAuthorJob(saved, uid, scope.appId),
  }
}
