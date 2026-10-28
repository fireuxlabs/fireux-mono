import { placeReferenceTargets } from './mutation-authority'
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  isFirestoreDocumentId,
  requireFirestoreDocumentId,
} from 'fireux-core/runtime/server/utils/ids/path'
import { PLACE_MUTATION_TARGETS } from '../mutation-targets'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { runtimeStorageBucketName } from 'fireux-core/runtime/server/utils/uploads/storage'
import {
  canKitchenEditPlace,
  placeKitchenAccessTarget,
} from './mutation-authority'
import { stagePlaceUpdate } from './stage-update'
import { readPlace } from './read'

type PlacePatchRequest = {
  app_id?: unknown
  kitchen_id?: unknown
  patch?: unknown
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

export async function updatePlace(
  event: H3Event,
  placeId: string,
  input: PlacePatchRequest
) {
  const id = requireFirestoreDocumentId(placeId, 'Place id')

  const { uid } = await requireFirebaseBearerUser(event)
  const requestedPatch = record(input.patch)
  const requestedAppId = text(input.app_id)
  const requestedKitchenId = text(input.kitchen_id)
  if (Boolean(requestedAppId) !== Boolean(requestedKitchenId)) {
    badRequest('Kitchen Place authority requires both App and Kitchen ids.')
  }
  const kitchenAuthority =
    requestedAppId && requestedKitchenId
      ? {
          appId: requireFirestoreDocumentId(requestedAppId, 'App id'),
          kitchenId: requireFirestoreDocumentId(
            requestedKitchenId,
            'Kitchen id'
          ),
        }
      : null
  const runtimeAppId = text(useRuntimeConfig(event).public?.fireux?.id)
  const configuredDeveloperId = text(
    useRuntimeConfig(event).public?.fireux?.developerId
  )
  const localDeveloper = import.meta.dev && uid === configuredDeveloperId
  const storageBucket = runtimeStorageBucketName()
  if (
    kitchenAuthority &&
    (!isFirestoreDocumentId(runtimeAppId) ||
      kitchenAuthority.appId !== runtimeAppId)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Kitchen Place authority must belong to the current App.',
    })
  }
  const places = PLACE_MUTATION_TARGETS.places
  const memberships = isFirestoreDocumentId(runtimeAppId)
    ? serverAppUsersTarget(runtimeAppId)
    : null
  const kitchens = placeReferenceTargets.kitchens

  await runGuardedServerTransaction(places.database, async (mutations) => {
    const [
      placeSnapshot,
      runtimeMembershipSnapshot,
      rootKitchenSnapshot,
      kitchenAccessSnapshot,
    ] = await Promise.all([
      mutations.read<Record<string, unknown>>(places, id),
      memberships
        ? mutations.read<Record<string, unknown>>(memberships, uid)
        : Promise.resolve(null),
      kitchenAuthority
        ? mutations.read<Record<string, unknown>>(
            kitchens,
            kitchenAuthority.kitchenId
          )
        : Promise.resolve(null),
      kitchenAuthority
        ? mutations.read<Record<string, unknown>>(
            placeKitchenAccessTarget(),
            uid
          )
        : Promise.resolve(null),
    ])

    if (!placeSnapshot.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Place not found.' })
    }

    const place = placeSnapshot.data || {}
    const runtimeRole = runtimeMembershipSnapshot?.data?.role
    const runtimeAdmin = runtimeRole === 'admin' || runtimeRole === 'dev'
    const kitchenAccess =
      kitchenAuthority &&
      canKitchenEditPlace({
        uid,
        placeId: id,
        kitchenId: kitchenAuthority.kitchenId,
        appId: kitchenAuthority.appId,
        runtimeAppId,
        kitchenExists: rootKitchenSnapshot?.exists === true,
        membershipExists: runtimeMembershipSnapshot?.exists === true,
        membership: runtimeMembershipSnapshot?.data || {},
        access: kitchenAccessSnapshot?.data ?? null,
      })
    if (!runtimeAdmin && !localDeveloper && !kitchenAccess) {
      throw createError({
        statusCode: 403,
        statusMessage:
          'App admin, local configured developer, or Kitchen association is required.',
      })
    }

    stagePlaceUpdate(mutations, id, requestedPatch, place, {
      uid,
      runtimeAppId,
      bucketName: storageBucket,
    })
  })

  const place = await readPlace(id)
  if (!place) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Updated Place is unavailable.',
    })
  }

  return { place }
}
