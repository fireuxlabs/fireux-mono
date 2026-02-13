import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'vuefire'
import {
  Ingredient,
  type Ingredient as IngredientDoc,
  type IngredientCreateInput,
  KitchenIngredient,
  type KitchenIngredient as KitchenIngredientDoc,
} from '../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'

const resolveKitchenIngredientsPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/ingredients`

type KitchenIngredientAddDraft = Partial<Pick<KitchenIngredientDoc, 'id'>> &
  Partial<Pick<IngredientCreateInput, 'name' | 'slug' | 'image_url'>>

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const resolveIngredientId = (draft: KitchenIngredientAddDraft) => {
  const providedId = String(draft.id || '').trim()
  if (providedId) return providedId
  return toSlug(String(draft.name || ''))
}

const buildGlobalIngredientPayload = (
  ingredientId: string,
  draft: KitchenIngredientAddDraft
): IngredientDoc => ({
  ...Ingredient,
  id: ingredientId,
  name: String(draft.name || '').trim(),
  slug: toSlug(String(draft.slug || draft.name || ingredientId)),
  image_url: String(draft.image_url || '').trim(),
})

const buildKitchenIngredientPayload = (
  ingredientId: string
): KitchenIngredientDoc => ({
  ...KitchenIngredient,
  id: ingredientId,
  ingredient_id: ingredientId,
})

export function useKitchenIngredientAdd() {
  const { setDocument } = useFirestoreCreate()
  const db = useFirestore()

  const addIngredientToKitchen = async (
    kitchenId: string,
    draft: KitchenIngredientAddDraft,
    options: { kitchenCollectionPath?: string } = {}
  ) => {
    const resolvedKitchenId = String(kitchenId || '').trim()
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const ingredientId = resolveIngredientId(draft)
    if (!ingredientId) {
      throw new Error('Ingredient id or name is required')
    }

    const usesExistingGlobalIngredient = Boolean(String(draft.id || '').trim())
    if (!usesExistingGlobalIngredient) {
      const globalRef = doc(db, GLOBAL_COLLECTION_PATH, ingredientId)
      const globalSnap = await getDoc(globalRef)

      if (!globalSnap.exists()) {
        const globalPayload = buildGlobalIngredientPayload(ingredientId, draft)
        await setDocument<IngredientDoc>(GLOBAL_COLLECTION_PATH, ingredientId, globalPayload, {
          app: true,
          creator: true,
        })
      }
    }

    const kitchenPayload = buildKitchenIngredientPayload(ingredientId)
    const kitchenCollectionPath = String(
      options.kitchenCollectionPath || DEFAULT_KITCHEN_COLLECTION_PATH
    ).trim()
    const kitchenIngredientsPath = resolveKitchenIngredientsPath(
      kitchenCollectionPath,
      resolvedKitchenId
    )

    await setDocument<KitchenIngredientDoc>(kitchenIngredientsPath, ingredientId, kitchenPayload, {
      app: true,
      creator: true,
    })

    return ingredientId
  }

  return { addIngredientToKitchen }
}
