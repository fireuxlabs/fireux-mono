import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'vuefire'
import {
    Ingredient,
    type IngredientCreateInput,
    type Ingredient as IngredientDoc,
} from '../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'

type IngredientCreateDraft = Partial<IngredientCreateInput>

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const resolveIngredientId = (name: string) => {
  const base = toSlug(name)
  return base || ''
}

const buildIngredientPayload = (
  ingredientId: string,
  draft: IngredientCreateDraft
): IngredientDoc => ({
  ...Ingredient,
  id: ingredientId,
  name: String(draft.name || '').trim(),
  image_url: String(draft.image_url || '').trim(),
})

export function useIngredientCreate() {
  const { setDocument } = useFirestoreCreate()
  const db = useFirestore()

  const createIngredient = async (draft: IngredientCreateDraft) => {
    const name = String(draft.name || '').trim()
    if (!name) throw new Error('Ingredient name is required')

    const ingredientId = resolveIngredientId(name)
    if (!ingredientId) throw new Error('Unable to resolve ingredient id')

    const ingredientRef = doc(db, GLOBAL_COLLECTION_PATH, ingredientId)
    const ingredientSnap = await getDoc(ingredientRef)
    if (ingredientSnap.exists()) {
      throw new Error('Ingredient already exists')
    }

    const payload = buildIngredientPayload(ingredientId, draft)

    await setDocument<IngredientDoc>(GLOBAL_COLLECTION_PATH, ingredientId, payload, {
      app: true,
      creator: true,
    })

    return ingredientId
  }

  return { createIngredient }
}
