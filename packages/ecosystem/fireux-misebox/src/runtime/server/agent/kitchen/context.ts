import { UserContextStorage } from 'fireux-core/runtime/user/models/user-context.model'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { readKitchenMenuSections } from 'fireux-kitchens/runtime/menu/server/manifest/sections'
import { KitchenIngredientStorage } from 'fireux-kitchens/runtime/kitchen/utils/kitchen-ingredient'
import { normalizeIngredient } from 'fireux-kitchens/runtime/ingredient/server/normalize'
import type { Ingredient } from 'fireux-kitchens/runtime/ingredient/models/ingredient.model'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  normalizeDish,
  type Dish,
} from 'fireux-kitchens/runtime/kitchen/utils/dish'
import {
  normalizeRecipe,
  type Recipe,
} from 'fireux-kitchens/runtime/kitchen/utils/recipe'
import {
  normalizeKitchenStation,
  type KitchenStation,
} from 'fireux-kitchens/runtime/kitchen/utils/station'
import type { KitchenAgentAccess, KitchenAgentRequest } from './types'

const MAX_MENUS = 12
const MAX_DISHES = 100
const MAX_RECIPES = 100
const MAX_STATIONS = 50
const MAX_ORDERS = 40
const MAX_ORDER_ITEMS = 40
const MAX_INGREDIENTS = 100
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const number = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const timestamp = (value: unknown) => {
  if (typeof value === 'string') return value.trim()
  if (value instanceof Date) return value.toISOString()

  const source = value as {
    toDate?: () => Date
    seconds?: number
    _seconds?: number
  } | null
  if (typeof source?.toDate === 'function') return source.toDate().toISOString()
  const seconds = number(source?.seconds ?? source?._seconds)
  return seconds > 0 ? new Date(seconds * 1000).toISOString() : ''
}

async function readUserContext(uid: string) {
  const snapshot = await getRuntimeIdentityFirestore()
    .collection('users')
    .doc(uid)
    .collection(UserContextStorage.collection)
    .doc(UserContextStorage.document)
    .get()
  return snapshot.exists
    ? readRecordString(snapshot.data() || {}, 'context')
    : ''
}

async function readMenuManifest(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest
) {
  if (request.operation && request.operation !== 'menus') return []

  const snapshot = await access.db
    .collection(`kitchens/${request.kitchenId}/menus`)
    .limit(MAX_MENUS)
    .get()
  return Promise.all(
    snapshot.docs.map(async (document) => {
      const data = document.data() || {}
      const sections = await readKitchenMenuSections(access.db, {
        appId: request.appId,
        kitchenId: request.kitchenId,
        menuId: document.id,
      })
      return {
        id: document.id,
        name: readRecordString(data, 'name') || document.id,
        status: readRecordString(data, 'status'),
        section_count: sections.length,
        item_count: sections.reduce(
          (total, section) => total + section.items.length,
          0
        ),
        sections: sections.map((section) => ({
          label: section.label,
          item_count: section.items.length,
        })),
      }
    })
  )
}

async function readDishes(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest
): Promise<Dish[]> {
  if (request.operation !== 'dishes' && request.operation !== 'drinks') {
    return []
  }

  const snapshot = await access.db
    .collection(`kitchens/${request.kitchenId}/dishes`)
    .limit(MAX_DISHES)
    .get()

  return snapshot.docs
    .map((document) =>
      normalizeDish({ id: document.id, ...(document.data() || {}) })
    )
    .filter((dish) =>
      request.operation === 'drinks'
        ? dish.item_kind === 'drink'
        : dish.item_kind === 'food'
    )
}

async function readRecipes(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest
): Promise<Recipe[]> {
  if (request.operation !== 'recipes') return []

  const snapshot = await access.db
    .collection(`kitchens/${request.kitchenId}/recipes`)
    .limit(MAX_RECIPES)
    .get()

  return snapshot.docs.map((document) =>
    normalizeRecipe({ id: document.id, ...(document.data() || {}) })
  )
}

async function readIngredients(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest
) {
  if (request.operation !== 'ingredients') {
    return { ingredients: [] as Ingredient[], missingIngredientIds: [] }
  }

  const links = await access.db
    .collection(
      `kitchens/${request.kitchenId}/${KitchenIngredientStorage.collection}`
    )
    .limit(MAX_INGREDIENTS)
    .get()
  const ingredientIds = [
    ...new Set(
      links.docs
        .map((document) => {
          const linkedId = readRecordString(
            document.data() || {},
            'ingredient_id'
          )
          return isFirestoreDocumentId(linkedId) ? linkedId : document.id
        })
        .filter(isFirestoreDocumentId)
    ),
  ]
  if (!ingredientIds.length) {
    return { ingredients: [] as Ingredient[], missingIngredientIds: [] }
  }

  const roots = await access.db.getAll(
    ...ingredientIds.map((id) => access.db.doc(`ingredients/${id}`))
  )
  const ingredients = roots
    .map(normalizeIngredient)
    .filter((ingredient): ingredient is Ingredient => Boolean(ingredient))
  const resolvedIds = new Set(ingredients.map((ingredient) => ingredient.id))
  return {
    ingredients,
    missingIngredientIds: ingredientIds.filter((id) => !resolvedIds.has(id)),
  }
}

async function readStations(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest
): Promise<KitchenStation[]> {
  if (request.operation !== 'stations') return []

  const snapshot = await access.db
    .collection(`kitchens/${request.kitchenId}/stations`)
    .limit(MAX_STATIONS)
    .get()

  return snapshot.docs.map((document) =>
    normalizeKitchenStation({ id: document.id, ...(document.data() || {}) })
  )
}

async function readOrders(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest
) {
  if (request.operation !== 'orders') return []

  const snapshot = await access.db
    .collection(`kitchens/${request.kitchenId}/orders`)
    .limit(MAX_ORDERS)
    .get()

  return snapshot.docs.map((document) => {
    const data = document.data() || {}
    const collection = record(data.collection)
    const table = record(data.table)
    const roomService = record(data.room_service)
    return {
      id: document.id,
      order_number: readRecordString(data, 'order_number'),
      service_id: readRecordString(data, 'service_id'),
      service_number: number(data.service_number),
      status: readRecordString(data, 'status'),
      order_type: readRecordString(data, 'order_type'),
      channel: readRecordString(data, 'channel'),
      requested_for: timestamp(data.requested_for),
      collection_mode: readRecordString(collection, 'mode'),
      collection_requested_for: timestamp(collection.requested_for),
      table_number: readRecordString(table, 'number'),
      room_number: readRecordString(roomService, 'room'),
      estimated_ready_minutes: number(data.estimated_ready_minutes),
      estimated_ready_at: timestamp(data.estimated_ready_at),
      items: (Array.isArray(data.items) ? data.items : [])
        .slice(0, MAX_ORDER_ITEMS)
        .map((value) => {
          const item = record(value)
          return {
            id: readRecordString(item, 'id'),
            dish_id: readRecordString(item, 'dish_id'),
            label: readRecordString(item, 'label'),
            variant_label: readRecordString(item, 'variant_label'),
            quantity: number(item.quantity),
            checked: item.checked === true,
          }
        }),
      created_at: timestamp(record(data.created).at),
      updated_at: timestamp(record(data.updated).at),
    }
  })
}

export async function readKitchenAgentContext(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest
) {
  const [
    userContext,
    menuManifest,
    dishes,
    recipes,
    ingredientContext,
    stations,
    orders,
  ] = await Promise.all([
    readUserContext(access.uid),
    readMenuManifest(access, request),
    readDishes(access, request),
    readRecipes(access, request),
    readIngredients(access, request),
    readStations(access, request),
    readOrders(access, request),
  ])
  const identity = record(access.rootKitchen.identity)
  return {
    kitchenName:
      readRecordString(access.rootKitchen, 'name') ||
      readRecordString(identity, 'display_name') ||
      request.kitchenId,
    tagline: readRecordString(identity, 'tagline'),
    userContext,
    kitchenContext: readRecordString(
      record(access.rootKitchen.workspace),
      'context'
    ),
    menuManifest,
    dishes,
    recipes,
    ingredients: ingredientContext.ingredients,
    missingIngredientIds: ingredientContext.missingIngredientIds,
    stations,
    orders,
  }
}
