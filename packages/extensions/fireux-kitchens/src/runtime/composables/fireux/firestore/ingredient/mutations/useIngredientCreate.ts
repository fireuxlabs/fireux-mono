import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'vuefire'
import {
    Ingredient,
    type IngredientCreateInput,
    type Ingredient as IngredientDoc,
    type IngredientStatus,
    type IngredientUnit,
} from '../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'

type IngredientCreateDraft = Partial<IngredientCreateInput>

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const resolveIngredientId = (name: string, unit: IngredientUnit) => {
  const base = toSlug(name)
  return base ? `${base}-${unit}` : ''
}

const resolveUnit = (value: unknown): IngredientUnit => {
  const allowed = new Set<IngredientUnit>([
    'g',
    'kg',
    'ml',
    'l',
    'piece',
    'pack',
    'tray',
    'case',
  ])
  const normalized = String(value || '').trim() as IngredientUnit
  return allowed.has(normalized) ? normalized : 'piece'
}

const resolveIngredientStatus = (value: unknown): IngredientStatus => {
  const allowed = new Set<IngredientStatus>(['active', 'archived'])
  const normalized = String(value || '').trim() as IngredientStatus
  return allowed.has(normalized) ? normalized : 'active'
}

const toStringArray = (value: unknown) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => String(item || '').trim())
        .filter(Boolean)
    )
  )

const buildIngredientPayload = (
  ingredientId: string,
  draft: IngredientCreateDraft
): IngredientDoc => ({
  ...Ingredient,
  id: ingredientId,
  name: String(draft.name || '').trim(),
  description: String(draft.description || '').trim(),
  category: String(draft.category || '').trim(),
  image_url: String(draft.image_url || '').trim(),
  unit: resolveUnit(draft.unit),
  status: resolveIngredientStatus(draft.status),
  allergens: toStringArray(draft.allergens),
  tags: toStringArray(draft.tags),
})

export function useIngredientCreate() {
  const { setDocument } = useFirestoreCreate()
  const db = useFirestore()

  const createIngredient = async (draft: IngredientCreateDraft) => {
    const name = String(draft.name || '').trim()
    if (!name) throw new Error('Ingredient name is required')

    const unit = resolveUnit(draft.unit)
    const ingredientId = resolveIngredientId(name, unit)
    if (!ingredientId) throw new Error('Unable to resolve ingredient id')

    const ingredientRef = doc(db, GLOBAL_COLLECTION_PATH, ingredientId)
    const ingredientSnap = await getDoc(ingredientRef)
    if (ingredientSnap.exists()) {
      throw new Error('Ingredient already exists')
    }

    const payload = buildIngredientPayload(ingredientId, {
      ...draft,
      unit,
    })

    await setDocument<IngredientDoc>(GLOBAL_COLLECTION_PATH, ingredientId, payload, {
      app: true,
      creator: true,
    })

    return ingredientId
  }

  return { createIngredient }
}
