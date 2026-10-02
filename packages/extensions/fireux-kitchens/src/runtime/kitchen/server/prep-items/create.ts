import { createError, type H3Event } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readKitchenMutationActor, requireKitchenMutationAuthority } from '../core/mutation-authority'
import { normalizeKitchenPrepItemTranslatedText } from '../../utils/prep-item'

function invalid(): never { throw createError({ statusCode: 400, statusMessage: 'Invalid Prep Item input.' }) }
function fields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid()
  const value = input as Record<string, unknown>
  if (Object.keys(value).some(key => !allowed.includes(key))) invalid()
  return value
}
function text(value: unknown, required = false) {
  if (typeof value !== 'string') invalid()
  const result = value.trim()
  if (required && !result) invalid()
  return result
}
function quantity(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) invalid()
  return value
}
function unit(value: unknown) {
  if (!['', 'g', 'ml', 'each', 'portion'].includes(value as string)) invalid()
  return value as string
}
function translations(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.values(value).some(copy => typeof copy !== 'string')) invalid()
  return normalizeKitchenPrepItemTranslatedText(value)
}
export async function createKitchenPrepItem(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'draft'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const draft = fields(value.draft, ['name', 'description', 'station', 'inputs', 'recipe_id', 'yield', 'method', 'source_language', 'names', 'descriptions'])
  const name = text(draft.name, true)
  const id = requireFirestoreDocumentId(normalizeSlug(name), 'Prep Item id')
  const inputs = draft.inputs ?? [], method = draft.method ?? []
  if (!Array.isArray(inputs) || !Array.isArray(method)) invalid()
  const yieldValue = fields(draft.yield ?? {}, ['quantity', 'unit'])
  const recipeId = text(draft.recipe_id ?? '')
  if (recipeId) requireFirestoreDocumentId(recipeId, 'Recipe id')
  const payload = {
    kitchen_id: kitchenId, name, slug: id, description: text(draft.description ?? ''),
    station: text(draft.station ?? ''), recipe_id: recipeId,
    source_language: text(draft.source_language, true), names: translations(draft.names ?? {}), descriptions: translations(draft.descriptions ?? {}),
    yield: { quantity: quantity(yieldValue.quantity ?? 0), unit: unit(yieldValue.unit ?? '') },
    inputs: inputs.map(value => {
      const row = fields(value, ['ingredient_id', 'quantity', 'unit', 'preparation'])
      return { ingredient_id: requireFirestoreDocumentId(row.ingredient_id, 'Ingredient id'), quantity: quantity(row.quantity ?? 0), unit: unit(row.unit ?? ''), preparation: text(row.preparation ?? '') }
    }),
    method: method.map(value => text(value)).filter(Boolean),
  }
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    const authority = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const target = defineFirestoreMutationTarget({ key: 'kitchens.prep-items', lane: 'server', verbs: ['create'], database: { kind: 'runtime' }, collectionPath: `kitchens/${kitchenId}/prep-items` })
    if ((await tx.read(target, id)).exists) throw createError({ statusCode: 409, statusMessage: 'Prep Item already exists.' })
    const stamp = serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId })
    tx.create(target, id, { ...payload, created: stamp, updated: stamp })
    return { id }
  })
}
