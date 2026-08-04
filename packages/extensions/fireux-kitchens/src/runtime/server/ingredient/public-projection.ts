import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_KINDS,
  INGREDIENT_STATUSES,
  type IngredientCategory,
  type IngredientKind,
  type IngredientStatus,
} from '../../models/ingredient-taxonomy.ts'
import type { PublicIngredient } from '../../models/ingredient-public.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

const member = <T extends string>(
  value: unknown,
  values: readonly T[],
  fallback: T
) => values.includes(value as T) ? value as T : fallback

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

export function projectPublicIngredient(
  document: {
    id: string
    data: () => Record<string, unknown> | undefined
  }
): PublicIngredient | null {
  const source = document.data() || {}
  const id = text(document.id)
  const name = text(source.name)
  if (!isFirestoreDocumentId(id) || !name) return null

  const parentIngredientId = text(source.parent_ingredient_id)
  const replacedByIngredientId = text(source.replaced_by_ingredient_id)

  return {
    id,
    schema_version: 2,
    slug: text(source.slug) || id,
    name,
    aliases: normalizeIngredientAliases(source.aliases),
    category: member<IngredientCategory>(
      source.category,
      INGREDIENT_CATEGORIES,
      'other'
    ),
    kind: member<IngredientKind>(source.kind, INGREDIENT_KINDS, 'base'),
    status: member<IngredientStatus>(
      source.status,
      INGREDIENT_STATUSES,
      'active'
    ),
    image_url: text(source.image_url),
    ...(isFirestoreDocumentId(parentIngredientId)
      ? { parent_ingredient_id: parentIngredientId }
      : {}),
    ...(isFirestoreDocumentId(replacedByIngredientId)
      ? { replaced_by_ingredient_id: replacedByIngredientId }
      : {}),
  }
}
