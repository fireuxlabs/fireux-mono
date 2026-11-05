import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import { BUSINESS_MUTATION_TARGETS } from './mutation-targets'
import { businessProfile } from './profile'
import { readBusinessMutationActor, requireBusinessMutationAuthority } from './team/authority'
export async function updateBusiness(event: H3Event, input: { id: unknown; profile: unknown }) {
  if (!input || Object.keys(input).some((key) => !['id', 'profile'].includes(key)))
    throw createError({ statusCode: 400, statusMessage: 'Invalid Business update.' })
  const id = requireFirestoreDocumentId(input.id, 'Business id')
  const profile = businessProfile(input.profile)
  const actor = await readBusinessMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireBusinessMutationAuthority(tx, actor, id)
    for (const placeId of profile.place_ids) {
      const place = await tx.read(PLACE_MUTATION_TARGETS.places, placeId)
      if (!place.exists) throw createError({ statusCode: 400, statusMessage: 'Linked Place does not exist.' })
    }
    tx.update(BUSINESS_MUTATION_TARGETS.businesses, id, { ...profile, updated: serverAuditStamp({ by: actor.uid }) })
  })
  return { ok: true as const, id }
}
