import { createError } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { requireKitchenIngredientReferences } from '../../server/core/preparation-references'
import type { RecipeChanges } from '../changes'
export async function requireRecipeDefinitionReferences(
  tx: GuardedServerTransaction,
  kitchenId: string,
  changes: RecipeChanges,
  existing: Record<string, unknown>
) {
  if (changes.inputs)
    await requireKitchenIngredientReferences(
      tx,
      kitchenId,
      changes.inputs
        .filter((row) => row.kind === 'ingredient')
        .map((row) => row.reference_id)
    )
  const target = defineFirestoreMutationTarget({
    key: 'kitchens.prep-items',
    lane: 'server',
    verbs: ['update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchenId}/prep-items`,
  })
  const output =
    'output_preparation_id' in changes
      ? changes.output_preparation_id
      : existing.output_preparation_id
  const historical = existing.preparation as
    | { prep_items?: { prep_item_id: string }[] }
    | undefined
  const inputs =
    changes.inputs ??
    (Array.isArray(existing.inputs)
      ? (existing.inputs.filter((row) => row && typeof row === 'object') as {
          kind: string
          reference_id: string
        }[])
      : (Array.isArray(historical?.prep_items)
          ? historical.prep_items
          : []
        ).map((row) => ({
          kind: 'preparation',
          reference_id: row.prep_item_id,
        })))
  if (
    output &&
    inputs.some(
      (row) => row.kind === 'preparation' && row.reference_id === output
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'A Recipe cannot consume its own output.',
    })
  const ids = new Set(
    changes.inputs
      ?.filter((row) => row.kind === 'preparation')
      .map((row) => row.reference_id) || []
  )
  if ('output_preparation_id' in changes && changes.output_preparation_id)
    ids.add(changes.output_preparation_id)
  for (const id of ids) {
    const row = await tx.read(target, id)
    if (
      !row.exists ||
      row.data?.status === 'archived' ||
      (row.data?.kitchen_id != null && row.data.kitchen_id !== kitchenId)
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'Choose an available Preparation from this Kitchen.',
      })
  }
}
