// Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: authorize and remove only unreferenced Place roots.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  isFirestoreDocumentId,
  requireFirestoreDocumentId,
} from 'fireux-core/runtime/server/utils/ids/path'
import { deleteStorageFileIfExists } from 'fireux-core/runtime/server/utils/uploads/storage'
import { PlaceStorage } from '../../models/place.model'

const text = (value: unknown) => String(value ?? '').trim()

const dependencyLabel = (family: string) => {
  const labels: Record<string, string> = {
    companies: 'Company',
    jobs: 'Job',
    kitchens: 'Kitchen',
    properties: 'Property',
  }
  return labels[family] || family
}

export async function removePlace(event: H3Event, placeId: string) {
  const id = requireFirestoreDocumentId(placeId, 'Place id')
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig(event)
  const runtimeAppId = text(runtime.public?.fireux?.id)
  const developerId = text(runtime.public?.fireux?.developerId)
  const db = getRuntimeFirestore()
  const placeRef = db.collection(PlaceStorage.collection).doc(id)
  const membershipRef = isFirestoreDocumentId(runtimeAppId)
    ? db.doc(`apps/${runtimeAppId}/users/${uid}`)
    : null

  await db.runTransaction(async transaction => {
    const placeSnapshot = await transaction.get(placeRef)
    const membershipSnapshot = membershipRef
      ? await transaction.get(membershipRef)
      : null

    if (!placeSnapshot.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Place not found.' })
    }

    const isDeveloper = import.meta.dev && Boolean(developerId) && uid === developerId
    const isAdmin = membershipSnapshot?.data()?.role === 'admin'
    if (!isDeveloper && !isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Developer or App admin access is required.',
      })
    }

    const references = await Promise.all([
      transaction.get(db.collection('companies').doc(id)),
      transaction.get(db.collection('kitchens').where('place_id', '==', id).limit(1)),
      transaction.get(db.collection('properties').where('place_id', '==', id).limit(1)),
      transaction.get(db.collection('jobs').where('place_id', '==', id).limit(1)),
    ])
    const blockers = [
      references[0].exists ? 'companies' : '',
      references[1].empty ? '' : 'kitchens',
      references[2].empty ? '' : 'properties',
      references[3].empty ? '' : 'jobs',
    ].filter(Boolean)

    if (blockers.length) {
      const families = blockers.map(dependencyLabel).join(', ')
      throw createError({
        statusCode: 409,
        statusMessage: `Remove the linked ${families} record${blockers.length === 1 ? '' : 's'} first.`,
      })
    }

    transaction.delete(placeRef)
  })

  await deleteStorageFileIfExists({ objectPath: `places/${id}/avatar` }).catch(error => {
    console.warn('[places/delete] Place removed but its avatar could not be cleaned up.', {
      placeId: id,
      error: error instanceof Error ? error.message : String(error),
    })
  })

  return { id, deleted: true }
}
