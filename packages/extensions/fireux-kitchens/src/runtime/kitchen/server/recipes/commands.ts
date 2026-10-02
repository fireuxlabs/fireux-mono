import { createError, type H3Event } from 'h3'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readKitchenMutationActor, requireKitchenMutationAuthority } from '../core/mutation-authority'
import { readRecipeUpdate } from '../../utils/recipe-update-input'
import { normalizeTranslatedText } from '../../utils/recipe'
import { validateRecipePreparation } from '../../models/recipe-preparation'

const target = (kitchenId: string) => defineFirestoreMutationTarget({
  key: 'kitchens.recipes', lane: 'server', verbs: ['create', 'update', 'delete'],
  database: { kind: 'runtime' }, collectionPath: `kitchens/${kitchenId}/recipes`,
})
function fields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw createError({ statusCode: 400, statusMessage: 'Invalid Recipe input.' })
  const value = input as Record<string, unknown>
  if (Object.keys(value).some(key => !allowed.includes(key))) throw createError({ statusCode: 400, statusMessage: 'Unsupported Recipe field.' })
  return value
}
function validate<T>(read: () => T): T {
  try { return read() } catch (error) { throw createError({ statusCode: 400, statusMessage: error instanceof Error ? error.message : 'Invalid Recipe input.' }) }
}
export async function createRecipe(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'draft'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const draft = fields(value.draft, ['name', 'description', 'names', 'descriptions', 'preparation', 'source_language'])
  const { source_language, ...editable } = draft
  if (typeof source_language !== 'string' || !source_language.trim()) throw createError({ statusCode: 400, statusMessage: 'Recipe source language is required.' })
  const patch = validate(() => readRecipeUpdate({ ...editable, description: draft.description ?? '', names: draft.names ?? {}, descriptions: draft.descriptions ?? {}, preparation: draft.preparation }))
  if (!patch.name) throw createError({ statusCode: 400, statusMessage: 'Recipe name is required.' })
  const id = requireFirestoreDocumentId(normalizeSlug(patch.name), 'Recipe id')
  const preparation = validate(() => validateRecipePreparation(patch.preparation))
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    const authority = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const collection = target(kitchenId)
    if ((await tx.read(collection, id)).exists) throw createError({ statusCode: 409, statusMessage: 'Recipe already exists.' })
    const stamp = serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId })
    tx.create(collection, id, { ...patch, preparation, slug: id, kitchen_id: kitchenId, source_language: source_language.trim(), created: stamp, updated: stamp })
    return { id }
  })
}
export async function updateRecipe(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'recipeId', 'changes'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const recipeId = requireFirestoreDocumentId(value.recipeId, 'Recipe id')
  const patch = validate(() => readRecipeUpdate(value.changes))
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const collection = target(kitchenId)
    const existing = await tx.read(collection, recipeId)
    if (!existing.exists) throw createError({ statusCode: 404, statusMessage: 'Recipe not found.' })
    const changes = value.changes as Record<string, unknown>
    const merged = { ...patch }
    for (const field of ['names', 'descriptions'] as const) {
      if (!(field in changes)) continue
      const delta = Object.fromEntries(Object.entries(changes[field] as Record<string, string>)
        .map(([language, text]) => [language.trim().replace(/_/g, '-'), text.trim()])
        .filter(([language]) => language))
      merged[field] = normalizeTranslatedText({ ...normalizeTranslatedText(existing.data?.[field]), ...delta })
    }
    tx.update(collection, recipeId, { ...merged, updated: serverAuditStamp({ by: actor.uid }) })
    return { id: recipeId }
  })
}
export async function deleteRecipe(event: H3Event, input: unknown) {
  const value = fields(input, ['kitchenId', 'recipeId'])
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const recipeId = requireFirestoreDocumentId(value.recipeId, 'Recipe id')
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async tx => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    tx.delete(target(kitchenId), recipeId)
    return { id: recipeId }
  })
}
