import type { H3Event } from 'h3'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import { projectPublicPlace } from 'fireux-places/runtime/server/place/public-projection'
import type { KitchenOnboardingPlacesResult } from '../../models/kitchen-onboarding.model'
import { KitchenStorage } from '../../models/kitchen.model'
import { resolveKitchenOnboardingActor } from './onboarding-context'
import {
  assertKitchenOnboardingScope,
  isKitchenOnboardingPlaceReady,
  onboardingText,
} from './onboarding-policy'

const KITCHEN_ONBOARDING_PLACE_LIMIT = 50

export async function listKitchenOnboardingPlaces(
  event: H3Event
): Promise<KitchenOnboardingPlacesResult> {
  const current = await resolveKitchenOnboardingActor(event)
  const places = current.db.collection(PlaceStorage.collection)
  const placeQuery = current.role === 'admin'
    ? places.orderBy('name').limit(KITCHEN_ONBOARDING_PLACE_LIMIT)
    : places
        .where('created.app_id', '==', current.appId)
        .limit(KITCHEN_ONBOARDING_PLACE_LIMIT)
  const placeSnapshot = await placeQuery.get()
  const placeDocuments = placeSnapshot.docs.filter(document =>
    isKitchenOnboardingPlaceReady(document.data() || {})
  )
  const kitchenSnapshots = placeDocuments.length
    ? await current.db.getAll(
        ...placeDocuments.map(document =>
          current.db.collection(KitchenStorage.collection).doc(document.id)
        )
      )
    : []
  const kitchens = new Map(
    kitchenSnapshots.map(snapshot => [snapshot.id, snapshot])
  )

  const items = placeDocuments.flatMap((document) => {
    const place = projectPublicPlace(document.id, document.data() || {})
    if (!place) return []
    const kitchen = kitchens.get(document.id)
    if (kitchen?.exists) {
      const kitchenData = kitchen.data() || {}
      if (onboardingText(kitchenData.place_id) !== document.id) return []
      try {
        assertKitchenOnboardingScope(kitchenData, current.appId)
      } catch {
        return []
      }
    }
    return [{
      place,
      existing_kitchen: Boolean(kitchen?.exists),
      ...(kitchen?.exists ? { kitchen_id: kitchen.id } : {}),
    }]
  })

  return {
    items: items.sort((left, right) =>
      left.place.name.localeCompare(right.place.name)
    ),
  }
}
