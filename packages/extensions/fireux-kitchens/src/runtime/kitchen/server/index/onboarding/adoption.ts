import { getAuth } from 'firebase-admin/auth'
import { createError, type H3Event } from 'h3'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { buildKitchenTeamMemberRecord } from '../../team/member-record.ts'
import { readKitchenOnboardingActor as actor } from './onboarding-actor'
import { onboardingText as text } from './onboarding-policy'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function request(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(400, 'Kitchen adoption request must be an object.')
  const source = value as Record<string, unknown>
  const supported = new Set(['kitchen_id', 'anonymous_token'])
  const unsupported = Object.keys(source).find((key) => !supported.has(key))
  if (unsupported)
    fail(400, `Kitchen adoption contains unsupported field: ${unsupported}.`)
  return source
}

export async function adoptAnonymousKitchen(event: H3Event, input: unknown) {
  const body = request(input)
  const kitchenId = requireFirestoreDocumentId(body.kitchen_id, 'Kitchen id')
  const anonymousToken = text(body.anonymous_token)
  if (!anonymousToken) fail(400, 'Anonymous identity proof is required.')

  const current = await actor(event, { allowMissingMembership: true })
  const decoded = await getAuth(getAdminApp())
    .verifyIdToken(anonymousToken, true)
    .catch(() => null)
  if (!decoded?.uid || decoded.firebase?.sign_in_provider !== 'anonymous')
    fail(401, 'Anonymous identity proof is invalid.')
  const anonymousUid = requireFirestoreDocumentId(
    decoded.uid,
    'Anonymous user id'
  )
  if (anonymousUid === current.uid)
    return { ok: true as const, kitchen_id: kitchenId, adopted: false }

  const teamMembers = serverKitchenTeamMembersTarget(kitchenId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [root, anonymousMember, currentMember, user] = await Promise.all([
      mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId),
      mutations.read(teamMembers, anonymousUid),
      mutations.read(teamMembers, current.uid),
      mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeUsers, current.uid),
    ])
    const rootCreated = root.data?.created as
      | Record<string, unknown>
      | undefined
    if (!root.exists || text(rootCreated?.by) !== anonymousUid)
      fail(403, 'This anonymous identity did not create the Kitchen.')
    if (
      !anonymousMember.exists ||
      text(anonymousMember.data?.user_id) !== anonymousUid
    )
      fail(409, 'Anonymous Kitchen ownership is incomplete.')

    const name =
      text(user.data?.display_name) ||
      current.authDisplayName ||
      `User ${current.uid.slice(0, 6)}`
    if (currentMember.exists) {
      mutations.update(teamMembers, current.uid, {
        user_id: current.uid,
      })
    } else {
      mutations.create(
        teamMembers,
        current.uid,
        buildKitchenTeamMemberRecord({
          name,

          userId: current.uid,
        })
      )
    }
    mutations.delete(teamMembers, anonymousUid)
    return { ok: true as const, kitchen_id: kitchenId, adopted: true }
  })
}
