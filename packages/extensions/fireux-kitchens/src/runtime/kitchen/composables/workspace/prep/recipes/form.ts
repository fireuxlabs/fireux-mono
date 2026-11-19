import type { Recipe } from '../../../../../recipe/models/model'
import { readRecipeChanges, type RecipeChanges } from '../../../../../recipe/utils/changes'
export function recipeDraft(recipe: Recipe) {
  return {
    name: recipe.name,
    description: recipe.description || '',
    output: recipe.output_preparation_id || '',
    yieldQuantity: recipe.yield?.quantity ?? ('' as string | number),
    yieldUnit: recipe.yield?.unit || '',
    inputs: recipe.inputs.map((row) => ({
      ...row,
      quantity: row.quantity as string | number,
      note: row.note || '',
    })),
    method: [...recipe.method],
    sourceTitle: recipe.source?.title || '',
    sourceUrl: recipe.source?.url || '',
  }
}
export type RecipeDraft = ReturnType<typeof recipeDraft>
export function recipeDraftRecord(draft: RecipeDraft) {
  return {
    name: draft.name,
    description: draft.description,
    output_preparation_id: draft.output || null,
    yield:
      String(draft.yieldQuantity).trim() || draft.yieldUnit.trim()
        ? { quantity: Number(draft.yieldQuantity), unit: draft.yieldUnit }
        : null,
    inputs: draft.inputs.map((row) => ({
      ...row,
      quantity: Number(row.quantity),
    })),
    method: draft.method,
    source:
      draft.sourceTitle.trim() || draft.sourceUrl.trim()
        ? { title: draft.sourceTitle, url: draft.sourceUrl }
        : null,
  }
}
/** Send only fields explicitly changed in this editor, preserving unrelated historical data. */
export function recipeDraftChanges(
  draft: RecipeDraft,
  baseline: RecipeDraft
): RecipeChanges {
  const next = readRecipeChanges(recipeDraftRecord(draft))
  const before = recipeDraftRecord(baseline)
  return Object.fromEntries(
    Object.entries(next).filter(
      ([key, value]) =>
        JSON.stringify(value) !==
        JSON.stringify(before[key as keyof typeof before])
    )
  ) as RecipeChanges
}
