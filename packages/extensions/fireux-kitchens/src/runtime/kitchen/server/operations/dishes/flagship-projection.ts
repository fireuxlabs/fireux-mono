import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  DishStorage,
  normalizeDish,
  type Dish,
} from '../../../models/dish.model.ts'

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
  appId: string,
  kitchenId: string
): Promise<KitchenFlagshipDishResult> {
  const app = String(appId || '').trim()
  const kitchen = String(kitchenId || '').trim()
  if (!app || !kitchen) {
    return {
      ready: false,
      issue: 'missing',
      dish: null,
      contentReadiness: contentReadiness(0, false),
    }
  }

  const collection = getRuntimeFirestore().collection(
    `kitchens/${kitchen}/${DishStorage.collection}`
  )
  const [snapshot, dishesSnapshot] = await Promise.all([
    collection.where('is_flagship', '==', true).limit(2).get(),
    collection.get(),
  ])
  const eligibleDishCount = dishesSnapshot.docs
    .map((document) => normalizeDish({ id: document.id, ...document.data() }))
    .filter((dish) => dish.item_kind === 'food' && Boolean(dish.name)).length
  const uniqueFlagship = snapshot.size === 1
  const readiness = contentReadiness(eligibleDishCount, uniqueFlagship)

  if (!snapshot.size) {
    return {
      ready: false,
      issue: 'missing',
      dish: null,
      contentReadiness: readiness,
    }
  }
  if (!uniqueFlagship) {
    return {
      ready: false,
      issue: 'multiple',
      dish: null,
      contentReadiness: readiness,
    }
  }

  const dish = normalizeDish({
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data(),
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
  return dish.image
    ? { ready: true, dish: projection, contentReadiness: readiness }
    : {
        ready: false,
        issue: 'missing-image',
        dish: projection,
        contentReadiness: readiness,
      }
}
