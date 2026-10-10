import { validateRecipePreparation } from './recipe-preparation'
import { normalizeTranslatedText, type Recipe } from './recipe'

/** Editable Recipe fields; identity and Kitchen ownership are never patch inputs. */
export function readRecipeUpdate(input: unknown): Partial<Recipe> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Enter Recipe changes.')
  const patch = input as Record<string, unknown>
  const allowed = [
    'name',
    'description',
    'names',
    'descriptions',
    'preparation',
  ]
  if (
    !Object.keys(patch).length ||
    Object.keys(patch).some((key) => !allowed.includes(key))
  )
    throw new Error('Unsupported Recipe field.')
  const next: Partial<Recipe> = {}
  if ('name' in patch) {
    if (typeof patch.name !== 'string' || !patch.name.trim())
      throw new Error('Enter a recipe name.')
    next.name = patch.name.trim()
  }
  if ('description' in patch) {
    if (typeof patch.description !== 'string')
      throw new Error('Enter a recipe description.')
    next.description = patch.description.trim()
  }
  for (const field of ['names', 'descriptions'] as const) {
    if (!(field in patch)) continue
    const value = patch[field]
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      Object.values(value).some((text) => typeof text !== 'string')
    )
      throw new Error('Recipe translations must contain text.')
    // Empty text is an explicit language clear. Keep it until transaction merge.
    next[field] = Object.fromEntries(
      Object.entries(value)
        .map(([language, copy]) => [
          language.trim().replace(/_/g, '-'),
          (copy as string).trim(),
        ])
        .filter(([language]) => language)
    )
  }
  if ('preparation' in patch)
    next.preparation = validateRecipePreparation(patch.preparation)
  return next
}

/** Merge detached language deltas against the current transactional record. */
export function mergeRecipeUpdate(
  existing: Record<string, unknown>,
  patch: Partial<Recipe>
): Partial<Recipe> {
  const merged = { ...patch }
  for (const field of ['names', 'descriptions'] as const) {
    if (!(field in patch)) continue
    merged[field] = normalizeTranslatedText({
      ...normalizeTranslatedText(existing[field]),
      ...patch[field],
    })
  }
  return merged
}
