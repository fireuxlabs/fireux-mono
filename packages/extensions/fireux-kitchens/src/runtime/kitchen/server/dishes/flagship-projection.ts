import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { createError } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  DishStorage,
  normalizeDishItemKind,
  normalizeDish,
  type Dish,
} from '../../utils/dish.ts'

export type KitchenFlagshipDishProjection = Pick<
  Dish,
  'id' | 'slug' | 'name' | 'description' | 'item_kind' | 'image' | 'is_flagship'
>

export type KitchenFlagshipDishResult = {
  ready: boolean
  issue?: 'missing' | 'multiple' | 'missing-image'
  dish: KitchenFlagshipDishProjection | null
  contentReadiness: {
    ready: boolean
    eligibleDishCount: number
    requiredDishCount: 6
    uniqueFlagship: boolean
  }
}

const contentReadiness = (
  eligibleDishCount: number,
  uniqueFlagship: boolean
) => ({
  ready: eligibleDishCount >= 6 && uniqueFlagship,
  eligibleDishCount,
  requiredDishCount: 6 as const,
  uniqueFlagship,
})

export async function readKitchenFlagshipDish(
  requestedApp: unknown,
  requestedKitchen: unknown
): Promise<KitchenFlagshipDishResult> {
  const app = String(requestedApp || '').trim()
  const kitchen = String(requestedKitchen || '').trim()
  if (!app || !kitchen)
    return {
      ready: false,
      issue: 'missing',
      dish: null,
      contentReadiness: contentReadiness(0, false),
    }
  requireFirestoreDocumentId(app, 'App id')
  const kitchenId = requireFirestoreDocumentId(kitchen, 'Kitchen id')
  const db = getRuntimeFirestore()
  const root = db.collection('kitchens').doc(kitchenId)
  if (!(await root.get()).exists)
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })

  const identities = await root
    .collection(DishStorage.collection)
    .select('name', 'item_kind', 'is_flagship')
    .get()
  const eligibleDishCount = identities.docs.filter(
    (doc) =>
      normalizeDishItemKind(doc.get('item_kind')) === 'food' &&
      String(doc.get('name') ?? '').trim()
  ).length
  const flagships = identities.docs.filter(
    (doc) => doc.get('is_flagship') === true
  )
  const unique = flagships.length === 1
  const readiness = contentReadiness(eligibleDishCount, unique)
  if (!unique)
    return {
      ready: false,
      issue: flagships.length ? 'multiple' : 'missing',
      dish: null,
      contentReadiness: readiness,
    }
  const [snapshot] = await db.getAll(flagships[0]!.ref, {
    fieldMask: [
      'name',
      'slug',
      'description',
      'item_kind',
      'image',
      'is_flagship',
    ],
  })
  const data = snapshot?.data()
  if (!snapshot || !data || data.is_flagship !== true) {
    return {
      ready: false,
      issue: 'missing',
      dish: null,
      contentReadiness: contentReadiness(eligibleDishCount, false),
    }
  }
  const dish = normalizeDish({
    id: snapshot.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    item_kind: data.item_kind,
    image: data.image,
    is_flagship: true,
  })
  const projection: KitchenFlagshipDishProjection = {
    id: dish.id,
    slug: dish.slug,
    name: dish.name,
    description: dish.description,
    item_kind: dish.item_kind,
    image: dish.image,
    is_flagship: dish.is_flagship,
  }
  return projection.image
    ? { ready: true, dish: projection, contentReadiness: readiness }
    : {
        ready: false,
        issue: 'missing-image',
        dish: projection,
        contentReadiness: readiness,
      }
}
