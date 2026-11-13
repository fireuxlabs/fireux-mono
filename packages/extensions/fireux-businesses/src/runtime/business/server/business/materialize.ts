import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/app-user/server/mutation-targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import { BUSINESS_MUTATION_TARGETS } from '../mutation-targets'
import { normalizeBusiness } from '../../utils/normalize-business'

/** Directory contribution for employer/Supplier references. It grants no ownership. */
export async function materializeBusiness(
  event: H3Event,
  input: { id?: unknown }
) {
  if (!input || Object.keys(input).some((key) => key !== 'id'))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Business input.',
    })
  const id = requireFirestoreDocumentId(input.id, 'Place id')
  const { uid } = await requireFirebaseBearerUser(event)
  const appId = requireFirestoreDocumentId(
    useFireUXConfig(event).appId,
    'App id'
  )
  const created = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (tx) => {
      const [membership, location, existing] = await Promise.all([
        tx.read(serverAppUsersTarget(appId), uid),
        tx.read(PLACE_MUTATION_TARGETS.places, id),
        tx.read(BUSINESS_MUTATION_TARGETS.businesses, id),
      ])
      if (
        !membership.exists ||
        !['admin', 'user', 'dev'].includes(String(membership.data?.role))
      )
        throw createError({
          statusCode: 403,
          statusMessage: 'Current App membership is required.',
        })
      if (existing.exists) {
        if (!normalizeBusiness(id, existing.data))
          throw createError({
            statusCode: 409,
            statusMessage: 'Existing Business requires migration.',
          })
        return false
      }
      const place = location.exists ? normalizePlace(id, location.data) : null
      if (!place)
        throw createError({
          statusCode: 404,
          statusMessage: 'Place not found.',
        })
      tx.create(BUSINESS_MUTATION_TARGETS.businesses, id, {
        name: place.name,
        description: place.about || '',
        email: place.email || '',
        phone: place.phone || '',
        website: place.website || '',
        place_ids: [id],
        management: { mode: 'root' },
        created: serverAuditStamp({ by: uid, appId }),
        updated: serverAuditStamp({ by: uid }),
      })
      return true
    }
  )
  return { ok: true, id, created }
}
