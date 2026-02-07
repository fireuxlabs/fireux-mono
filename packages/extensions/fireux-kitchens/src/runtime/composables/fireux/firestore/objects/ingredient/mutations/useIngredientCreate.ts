import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import {
  Ingredient,
  type Ingredient as IngredientDoc,
  type IngredientCreateInput,
  type IngredientStatus,
  type IngredientUnit,
} from '../../../../../../models/objects/ingredient.model'
import { useFirestore } from 'vuefire'

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

const toSafeNumber = (value: unknown, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const toNonNegativeNumber = (value: unknown, fallback = 0) =>
  Math.max(0, toSafeNumber(value, fallback))

const buildIngredientPayload = (
  ingredientId: string,
  draft: IngredientCreateDraft
): IngredientDoc => ({
  ...Ingredient,
  id: ingredientId,
  name: String(draft.name || '').trim(),
  description: String(draft.description || '').trim(),
  sku: String(draft.sku || '').trim(),
  unit: resolveUnit(draft.unit),
  status: resolveIngredientStatus(draft.status),
  on_hand_qty: toNonNegativeNumber(draft.on_hand_qty),
  par_qty: toNonNegativeNumber(draft.par_qty),
  reorder_qty: toNonNegativeNumber(draft.reorder_qty),
  storage_location: String(draft.storage_location || '').trim(),
  supplier_id: String(draft.supplier_id || '').trim(),
  supplier_name: String(draft.supplier_name || '').trim(),
  cost_per_unit: toNonNegativeNumber(draft.cost_per_unit),
  currency: String(draft.currency || 'CHF').trim().toUpperCase() || 'CHF',
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
