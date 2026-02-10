import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'vuefire'
import {
  Ingredient,
  type IngredientCreateInput,
  type Ingredient as IngredientDoc,
  type IngredientStatus,
  type IngredientUnit,
  KitchenIngredient,
  type KitchenIngredientCreateInput,
  type KitchenIngredient as KitchenIngredientDoc,
  type KitchenIngredientStatus,
} from '../../../../../models/ingredient.model'

const GLOBAL_COLLECTION_PATH = 'ingredients'

const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const resolveKitchenCollectionPath = (basePath: string, kitchenId: string) =>
  `${basePath}/${kitchenId}/ingredients`

type KitchenIngredientCreateDraft = Partial<
  Omit<KitchenIngredientCreateInput, 'ingredient_id' | 'kitchen_id'>
> &
  Partial<
    Pick<
      IngredientCreateInput,
      'name' | 'description' | 'category' | 'unit'
    >
  > & {
    ingredient_id?: string
    id?: string
    allergens?: string[]
    tags?: string[]
  }

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

const resolveKitchenStatus = (value: unknown): KitchenIngredientStatus => {
  const allowed = new Set<KitchenIngredientStatus>(['active', 'paused', 'archived'])
  const normalized = String(value || '').trim() as KitchenIngredientStatus
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

const buildGlobalIngredientPayload = (
  ingredientId: string,
  draft: KitchenIngredientCreateDraft
): IngredientDoc => ({
  ...Ingredient,
  id: ingredientId,
  name: String(draft.name || '').trim(),
  description: String(draft.description || '').trim(),
  category: String(draft.category || '').trim(),
  image_url: String(draft.image_url || '').trim(),
  unit: resolveUnit(draft.unit),
  status: resolveIngredientStatus('active'),
  allergens: toStringArray(draft.allergens),
  tags: toStringArray(draft.tags),
})

const buildKitchenIngredientPayload = (
  kitchenId: string,
  ingredientId: string,
  draft: KitchenIngredientCreateDraft
): KitchenIngredientDoc => ({
  ...KitchenIngredient,
  id: ingredientId,
  kitchen_id: kitchenId,
  ingredient_id: ingredientId,
  supplier_id: String(draft.supplier_id || '').trim(),
  supplier_name: String(draft.supplier_name || '').trim(),
  status: resolveKitchenStatus(draft.status),
  on_hand_qty: toNonNegativeNumber(draft.on_hand_qty),
  par_qty: toNonNegativeNumber(draft.par_qty),
  reorder_qty: toNonNegativeNumber(draft.reorder_qty),
  storage_location: String(draft.storage_location || '').trim(),
  cost_per_unit: toNonNegativeNumber(draft.cost_per_unit),
  currency: String(draft.currency || 'CHF').trim().toUpperCase() || 'CHF',
  notes: String((draft as any).notes || '').trim(),
})

export function useKitchenIngredientCreate() {
  const { setDocument } = useFirestoreCreate()
  const db = useFirestore()

  const createKitchenIngredient = async (
    kitchenId: string,
    draft: KitchenIngredientCreateDraft,
    options: { kitchenCollectionPath?: string } = {}
  ) => {
    const resolvedKitchenId = String(kitchenId || '').trim()
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    const providedIngredientId = String(draft.ingredient_id || draft.id || '').trim()
    const name = String(draft.name || '').trim()
    if (!providedIngredientId && !name) {
      throw new Error('Ingredient name is required')
    }

    const unit = resolveUnit(draft.unit)
    const ingredientId = providedIngredientId || resolveIngredientId(name, unit)
    if (!ingredientId) throw new Error('Unable to resolve ingredient id')

    if (!providedIngredientId) {
      const globalRef = doc(db, GLOBAL_COLLECTION_PATH, ingredientId)
      const globalSnap = await getDoc(globalRef)

      if (!globalSnap.exists()) {
        const globalPayload = buildGlobalIngredientPayload(ingredientId, {
          ...draft,
          unit,
        })
        await setDocument<IngredientDoc>(GLOBAL_COLLECTION_PATH, ingredientId, globalPayload, {
          app: true,
          creator: true,
        })
      }
    }

    const kitchenPayload = buildKitchenIngredientPayload(
      resolvedKitchenId,
      ingredientId,
      draft
    )

    const kitchenCollectionPath = String(
      options.kitchenCollectionPath || DEFAULT_KITCHEN_COLLECTION_PATH
    ).trim()
    const kitchenIngredientPath = resolveKitchenCollectionPath(
      kitchenCollectionPath,
      resolvedKitchenId
    )

    console.info('[useKitchenIngredientCreate] write', {
      kitchenId: resolvedKitchenId,
      ingredientId,
      kitchenCollectionPath,
      kitchenIngredientPath,
    })

    await setDocument<KitchenIngredientDoc>(
      kitchenIngredientPath,
      ingredientId,
      kitchenPayload,
      { app: true, creator: true }
    )

    return ingredientId
  }

  return { createKitchenIngredient }
}
