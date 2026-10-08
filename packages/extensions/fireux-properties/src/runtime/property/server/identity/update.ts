import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  requireFirebaseStorageDownloadUrl,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import {
  readPropertyMutationActor,
  requirePropertyMutationAuthority,
} from '../team/authority'

export async function updatePropertyIdentity(event: H3Event, input: unknown) {
  const invalid = (): never => {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Property identity input.',
    })
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid()
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some((key) => !['propertyId', 'changes'].includes(key))
  )
    invalid()
  const propertyId = requireFirestoreDocumentId(value.propertyId, 'Property id')
  if (
    !value.changes ||
    typeof value.changes !== 'object' ||
    Array.isArray(value.changes)
  )
    invalid()
  const changes: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(
    value.changes as Record<string, unknown>
  )) {
    if (key === 'name') {
      if (typeof raw !== 'string' || !raw.trim() || raw.trim().length > 120)
        invalid()
      changes['identity.name'] = (raw as string).trim()
    } else if (key === 'property_type') {
      if (
        !['residential', 'commercial', 'mixed'].includes(String(raw)) ||
        typeof raw !== 'string'
      )
        invalid()
      changes['identity.property_type'] = raw
    } else if (key === 'unit_count') {
      if (typeof raw !== 'number' || !Number.isSafeInteger(raw) || raw < 0)
        invalid()
      changes['identity.unit_count'] = raw
    } else if (key === 'image_url') {
      if (typeof raw !== 'string' || raw.length > 2048) invalid()
      changes['identity.image_url'] = raw
        ? requireFirebaseStorageDownloadUrl(raw as string, {
            bucketName: runtimeStorageBucketName(),
            objectPrefix: `properties/${propertyId}/images/`,
            label: 'Property image',
          })
        : ''
    } else invalid()
  }
  if (!Object.keys(changes).length) invalid()
  const actor = await readPropertyMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const { rootData } = await requirePropertyMutationAuthority(
      tx,
      actor,
      propertyId
    )
    if (
      !rootData.identity ||
      typeof rootData.identity !== 'object' ||
      Array.isArray(rootData.identity)
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'Property identity is unavailable.',
      })
    tx.update(FIRESTORE_MUTATION_TARGETS.properties, propertyId, {
      ...changes,
      updated: serverAuditStamp({ by: actor.uid }),
    })
  })
  return { ok: true as const, propertyId }
}
