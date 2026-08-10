// Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: authorize and remove only unreferenced Place roots.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  isFirestoreDocumentId,
  requireFirestoreDocumentId,
} from 'fireux-core/runtime/server/utils/ids/path'
import { deleteStorageFileIfExists } from 'fireux-core/runtime/server/utils/uploads/storage'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  dependentKitchenRootTarget,
  dependentPropertyRootTarget,
} from './dependent-targets'

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
  const places = FIRESTORE_MUTATION_TARGETS.places
  const memberships = isFirestoreDocumentId(runtimeAppId)
    ? serverAppUsersTarget(runtimeAppId)
    : null

  await runGuardedServerTransaction(places.database, async (mutations) => {
    const [placeSnapshot, membershipSnapshot] = await Promise.all([
      mutations.read<Record<string, unknown>>(places, id),
      memberships
        ? mutations.read<Record<string, unknown>>(memberships, uid)
        : Promise.resolve(null),
    ])

    if (!placeSnapshot.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Place not found.' })
    }

    const isDeveloper =
      import.meta.dev && Boolean(developerId) && uid === developerId
    const isAdmin = membershipSnapshot?.data?.role === 'admin'
    if (!isDeveloper && !isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Developer or App admin access is required.',
      })
    }

    const references = await Promise.all([
      mutations.read<Record<string, unknown>>(
        FIRESTORE_MUTATION_TARGETS.companies,
        id
      ),
      mutations.query(dependentKitchenRootTarget, {
        field: 'place_id',
        op: '==',
        value: id,
        limit: 1,
      }),
      mutations.query(dependentPropertyRootTarget, {
        field: 'place_id',
        op: '==',
        value: id,
        limit: 1,
      }),
      mutations.query(FIRESTORE_MUTATION_TARGETS.jobs, {
        field: 'place_id',
        op: '==',
        value: id,
        limit: 1,
      }),
    ])
    const blockers = [
      references[0].exists ? 'companies' : '',
      references[1].length ? 'kitchens' : '',
      references[2].length ? 'properties' : '',
      references[3].length ? 'jobs' : '',
    ].filter(Boolean)

    if (blockers.length) {
      const families = blockers.map(dependencyLabel).join(', ')
      throw createError({
        statusCode: 409,
        statusMessage: `Remove the linked ${families} record${blockers.length === 1 ? '' : 's'} first.`,
      })
    }

    mutations.delete(places, id)
  })

  for (const objectPath of [
    `places/${id}/image`,
    `places/${id}/cover`,
    `places/${id}/logo`,
    `places/${id}/wordmark`,
  ]) {
    await deleteStorageFileIfExists({ objectPath }).catch((error) => {
      console.warn('[places/delete] Place removed but an image could not be cleaned up.', {
        placeId: id,
        objectPath,
        error: error instanceof Error ? error.message : String(error),
      })
    })
  }

  return { id, deleted: true }
}
