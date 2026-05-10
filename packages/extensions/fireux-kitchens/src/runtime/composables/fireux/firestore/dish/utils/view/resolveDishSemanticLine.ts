import type { Dish } from '../../../../../../models/dish.model'

type SemanticSource = {
  id: string
  name?: string
  names?: Partial<Record<string, string>>
  title?: string
}

export type ResolveDishSemanticLineInput = {
  dish: Pick<Dish, 'mise_ids' | 'ingredient_ids'> | null | undefined
  mise?: SemanticSource[]
  ingredients?: SemanticSource[]
  languageCode?: string
  excludedIds?: string[]
  excludedTerms?: string[]
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) =>
  normalizeString(value).replace(/_/g, '-')
const normalizeComparable = (value: unknown) =>
  normalizeString(value)
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeIdList = (value: unknown) =>
  Array.isArray(value)
    ? Array.from(new Set(value.map((entry) => normalizeString(entry)).filter(Boolean)))
    : []

const sourceName = (source: SemanticSource, languageCode: string) => {
  const localized = source.names?.[languageCode]
  return normalizeString(localized) || normalizeString(source.name) || normalizeString(source.title)
}

const sourceMap = (sources: SemanticSource[] = []) => {
  const map = new Map<string, SemanticSource>()
  sources.forEach((source) => {
    const id = normalizeString(source.id)
    if (id) map.set(id, source)
  })
  return map
}

export function resolveDishSemanticLine(input: ResolveDishSemanticLineInput) {
  const dish = input.dish
  if (!dish) return ''

  const languageCode = normalizeLanguageCode(input.languageCode) || 'en'
  const excludedIds = new Set(normalizeIdList(input.excludedIds))
  const excludedTerms = new Set(
    normalizeIdList(input.excludedTerms).map((term) => normalizeComparable(term))
  )
  const miseById = sourceMap(input.mise)
  const ingredientsById = sourceMap(input.ingredients)

  const names: string[] = []
  const pushSource = (id: string, source: SemanticSource | undefined) => {
    if (!source || excludedIds.has(id)) return

    const name = sourceName(source, languageCode)
    if (!name || excludedTerms.has(normalizeComparable(name))) return
    names.push(name)
  }

  normalizeIdList(dish.mise_ids).forEach((id) => {
    pushSource(id, miseById.get(id))
  })
  normalizeIdList(dish.ingredient_ids).forEach((id) => {
    pushSource(id, ingredientsById.get(id))
  })

  return names.join(', ')
}
