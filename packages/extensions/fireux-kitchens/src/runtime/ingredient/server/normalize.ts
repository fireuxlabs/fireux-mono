import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readIngredientCategory } from './category-migration'
import { IngredientDefaults, type Ingredient } from '../utils/ingredient.ts'

const text = (value: unknown) => String(value ?? '').trim()

/** Legacy retirement metadata remains authoritative but is not public identity. */
export const isActiveIngredient = (
  source: Record<string, unknown> | undefined
) =>
  Boolean(source) &&
  (source!.status === undefined || source!.status === 'active')

export const normalizeIngredientAliases = (value: unknown) => {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  const aliases: string[] = []
  for (const candidate of value) {
    const alias = text(candidate).normalize('NFC')
    const key = alias.toLocaleLowerCase()
    if (!alias || seen.has(key)) continue
    seen.add(key)
    aliases.push(alias)
  }
  return aliases
}

export function normalizeIngredient(document: {
  id: string
  data: () => Record<string, unknown> | undefined
}): Ingredient | null {
  const source = document.data() || {}
  const id = text(document.id)
  const name = text(source.name)
  if (!isFirestoreDocumentId(id) || !name) return null

  const category = readIngredientCategory(id, source)
  if (!category) return null

  return {
    id,
    slug: text(source.slug) || id,
    name,
    aliases: normalizeIngredientAliases(source.aliases),
    category,
    image_url: text(source.image_url),
    created: (source.created ||
      IngredientDefaults.created) as Ingredient['created'],
    updated: (source.updated ||
      IngredientDefaults.updated) as Ingredient['updated'],
  }
}
