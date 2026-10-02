import { createError, type H3Event } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverKitchenDishesTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readKitchenMutationActor, requireKitchenMutationAuthority } from '../core/mutation-authority'
import { dishCategories } from '../../models/dish.model'

function invalid(message = 'Invalid Dish input.'): never { throw createError({ statusCode: 400, statusMessage: message }) }
function fields(value: unknown, allowed: string[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid()
  const record = value as Record<string, unknown>
  if (Object.keys(record).some(key => !allowed.includes(key))) invalid('Unsupported Dish field. Use the image upload for media.')
  return record
}
function text(value: unknown, required = false): string {
  if (typeof value !== 'string') invalid('Dish text fields must be strings.')
  const result = value.trim()
  if (required && !result) invalid('Dish name and component references cannot be empty.')
  return result
}
function positive(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) invalid('Enter a positive quantity.')
  return value
}
function spec(value: unknown) {
  const source = fields(value, ['portion', 'station', 'ingredients', 'prep_items', 'recipe_ids', 'assembly', 'source_note'])
  const rows = (value: unknown, key: string) => {
    if (!Array.isArray(value)) invalid('Dish components must be lists.')
    return value.map(value => {
      const row = fields(value, [key, 'quantity', 'unit', 'note'])
      return { [key]: requireFirestoreDocumentId(row[key], 'Component id'), quantity: positive(row.quantity), unit: text(row.unit, true), note: text(row.note ?? '') }
    })
  }
  if (!Array.isArray(source.recipe_ids) || !Array.isArray(source.assembly)) invalid('Recipes and assembly must be lists.')
  return {
    portion: positive(source.portion), station: text(source.station ?? ''),
    ingredients: rows(source.ingredients, 'ingredient_id'), prep_items: rows(source.prep_items, 'prep_item_id'),
    recipe_ids: source.recipe_ids.map(id => requireFirestoreDocumentId(id, 'Recipe id')),
    assembly: source.assembly.map(line => text(line)), source_note: text(source.source_note ?? ''),
  }
}
export async function createDish(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'draft'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const draft = fields(value.draft, ['name', 'description', 'item_kind', 'is_deal', 'is_flagship'])
  const name = text(draft.name, true)
  const id = requireFirestoreDocumentId(normalizeSlug(name), 'Dish id')
  const itemKind = draft.item_kind ?? 'food'
  if (itemKind !== 'food' && itemKind !== 'drink') invalid('Choose food or drink.')
  if (draft.is_deal !== undefined && typeof draft.is_deal !== 'boolean') invalid()
  if (draft.is_flagship !== undefined && typeof draft.is_flagship !== 'boolean') invalid()
  const description = text(draft.description ?? '')
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    const authority = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenDishesTarget(kitchenId)
    if ((await tx.read(target, id)).exists) throw createError({ statusCode: 409, statusMessage: 'Dish already exists.' })
    const stamp = serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId })
    tx.create(target, id, { name, slug: id, description, item_kind: itemKind, is_deal: draft.is_deal ?? false, is_flagship: false, image: '', kitchen_id: kitchenId, created: stamp, updated: stamp })
    return { id }
  })
}
export async function updateDish(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'dishId', 'changes'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const dishId = requireFirestoreDocumentId(value.dishId, 'Dish id')
  const changes = fields(value.changes, ['name', 'slug', 'description', 'category', 'spec'])
  if (!Object.keys(changes).length) invalid('Provide a Dish change.')
  const patch: Record<string, unknown> = {}
  if ('name' in changes) patch.name = text(changes.name, true)
  if ('slug' in changes) patch.slug = text(changes.slug)
  if ('description' in changes) patch.description = text(changes.description)
  if ('category' in changes) {
    if (!dishCategories.some(category => category.value === changes.category)) invalid('Choose a valid dish category.')
    patch.category = changes.category
  }
  if ('spec' in changes) patch.spec = spec(changes.spec)
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = serverKitchenDishesTarget(kitchenId)
    if (!(await tx.read(target, dishId)).exists) throw createError({ statusCode: 404, statusMessage: 'Dish not found.' })
    tx.update(target, dishId, { ...patch, updated: serverAuditStamp({ by: actor.uid }) })
    return { id: dishId }
  })
}
export async function deleteDish(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'dishId'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const dishId = requireFirestoreDocumentId(value.dishId, 'Dish id')
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    // Preserve document-only, idempotent deletion. No cascade or new dependency policy.
    tx.delete(serverKitchenDishesTarget(kitchenId), dishId)
    return { id: dishId }
  })
}
