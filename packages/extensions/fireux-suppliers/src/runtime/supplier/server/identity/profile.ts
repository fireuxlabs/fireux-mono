import { BUSINESS_MUTATION_TARGETS } from 'fireux-businesses/runtime/business/server/mutation-targets'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runtimeStorageBucketName } from 'fireux-core/runtime/server/utils/uploads/storage'
import { stagePlaceUpdate } from 'fireux-places/runtime/place/server/identity/stage-update'
import { readPlace } from 'fireux-places/runtime/place/server/identity/read'
import { projectBusiness } from 'fireux-businesses/runtime/business/server/business/projection'
import {
  readSupplierMutationActor,
  requireSupplierMutationAuthority,
} from '../team/authority'

export async function updateSupplierProfile(event: H3Event, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Supplier profile input.',
    })
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) => !['supplierId', 'placeId', 'patch'].includes(key)
    ) ||
    !value.patch ||
    typeof value.patch !== 'object' ||
    Array.isArray(value.patch)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Supplier profile input.',
    })
  const supplierId = requireFirestoreDocumentId(value.supplierId, 'Supplier id')
  const placeId = requireFirestoreDocumentId(value.placeId, 'Place id')
  const actor = await readSupplierMutationActor(event)
  const bucketName = runtimeStorageBucketName()
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const { rootData } = await requireSupplierMutationAuthority(
      tx,
      actor,
      supplierId
    )
    const businessId = requireFirestoreDocumentId(rootData.business_id, 'Business id')
    const business = await tx.read(BUSINESS_MUTATION_TARGETS.businesses, businessId)
    const businessRoot = business.exists ? projectBusiness(businessId, business.data || {}) : null
    if (!businessRoot?.place_ids.includes(placeId))
      throw createError({ statusCode: 409, statusMessage: 'The Supplier location changed. Reopen Identity.' })
    const place = await tx.read(PLACE_MUTATION_TARGETS.places, placeId)
    if (!place.exists) throw createError({ statusCode: 404, statusMessage: 'Supplier location not found.' })
    stagePlaceUpdate(
      tx,
      placeId,
      value.patch as Record<string, unknown>,
      place.data || {},
      { ...actor, bucketName }
    )
  })
  const place = await readPlace(placeId)
  if (!place)
    throw createError({
      statusCode: 500,
      statusMessage: 'Updated business profile is unavailable.',
    })
  return { ok: true as const, supplierId, place }
}
