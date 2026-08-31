import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
import type { KitchenOnboardingFirestore as Firestore } from './onboarding-actor'
import { onboardingText as text } from './onboarding-policy'

export type KitchenOnboardingLocator = {
  placeId: string
  kitchenId: string
  kitchen: Record<string, unknown> | null
}

export type KitchenOnboardingTransactionLocator = Pick<
  KitchenOnboardingLocator,
  'placeId' | 'kitchenId'
> & {
  requireExistingKitchen: boolean
}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

async function kitchenForPlace(
  db: Firestore,
  placeId: string
): Promise<KitchenOnboardingLocator> {
  const exact = await db.collection('kitchens').doc(placeId).get()
  const exactData = exact.exists ? exact.data() || {} : null
  return {
    placeId,
    kitchenId: placeId,
    kitchen: exactData,
  }
}

export async function resolveKitchenOnboardingPreviewLocator(
  db: Firestore,
  value: Record<string, unknown>
): Promise<KitchenOnboardingLocator> {
  const requestedKitchenId = text(value.kitchen_id)
  if (requestedKitchenId) {
    const kitchenId = requireFirestoreDocumentId(
      resolveWorkspaceEntityCreationId({
        intent: 'use_source',
        sourceId: requestedKitchenId,
      }),
      'Kitchen id'
    )
    const snapshot = await db.collection('kitchens').doc(kitchenId).get()
    if (!snapshot.exists) fail(404, 'Kitchen not found.')
    const requestedPlaceId = text(value.place_id)
    if (requestedPlaceId && requestedPlaceId !== kitchenId) {
      fail(409, 'Kitchen and Place do not match.')
    }
    return {
      placeId: kitchenId,
      kitchenId,
      kitchen: snapshot.data() || {},
    }
  }

  const placeId = requireFirestoreDocumentId(
    resolveWorkspaceEntityCreationId({
      intent: 'use_source',
      sourceId: text(value.place_id),
    }),
    'Place id'
  )
  return kitchenForPlace(db, placeId)
}

export function resolveKitchenOnboardingTransactionLocator(
  value: Record<string, unknown>
): KitchenOnboardingTransactionLocator {
  const requestedKitchenId = text(value.kitchen_id)
  const sourceId = requestedKitchenId || text(value.place_id)
  const kitchenId = requireFirestoreDocumentId(
    resolveWorkspaceEntityCreationId({ intent: 'use_source', sourceId }),
    requestedKitchenId ? 'Kitchen id' : 'Place id'
  )
  const requestedPlaceId = text(value.place_id)
  if (
    requestedKitchenId &&
    requestedPlaceId &&
    requestedPlaceId !== kitchenId
  ) {
    fail(409, 'Kitchen and Place do not match.')
  }
  return {
    kitchenId,
    placeId: kitchenId,
    requireExistingKitchen: Boolean(requestedKitchenId),
  }
}
