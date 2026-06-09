import restaurantGlossarySeed from '../../../../../scripts/data/restaurant-translation-glossary.seed.json'
import {
  normalizeSproochliLanguageCode,
  normalizeSproochliText,
} from './sproochliTranslate'

type RestaurantGlossaryEntry = {
  source_text?: unknown
  aliases?: unknown
  translations?: unknown
}

const entries = Array.isArray((restaurantGlossarySeed as { entries?: unknown }).entries)
  ? (restaurantGlossarySeed as { entries: RestaurantGlossaryEntry[] }).entries
  : []

function normalizeLookupText(value: unknown) {
  return normalizeSproochliText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s*[/|]\s*/g, ' / ')
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s/|:;,.–—-]+|[\s/|:;,.–—-]+$/g, '')
}

function translationMap(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function lookupValues(entry: RestaurantGlossaryEntry) {
  const translations = translationMap(entry.translations)
  return [
    entry.source_text,
    ...(Array.isArray(entry.aliases) ? entry.aliases : []),
    ...Object.values(translations),
  ]
}

export function restaurantMenuFieldKind(fieldId: unknown) {
  const id = normalizeSproochliText(fieldId)
  if (/^menu:[^:]+:name$/.test(id)) return 'menu_name'
  if (/^menu:[^:]+:description$/.test(id)) return 'menu_description'
  if (/^section:[^:]+:label$/.test(id)) return 'section_label'
  if (/^section:[^:]+:description$/.test(id)) return 'section_description'
  if (/^dish:[^:]+:name$/.test(id)) return 'dish_name'
  if (/^dish:[^:]+:description$/.test(id)) return 'dish_description'
  return 'menu_field'
}

export function restaurantMenuGlossaryHints(input: {
  sourceText: unknown
  targetLanguage: unknown
}) {
  const sourceKey = normalizeLookupText(input.sourceText)
  const targetLanguage = normalizeSproochliLanguageCode(input.targetLanguage)
  if (!sourceKey || !targetLanguage) return []

  return entries
    .filter((entry) =>
      lookupValues(entry).some((value) => normalizeLookupText(value) === sourceKey)
    )
    .map((entry) => {
      const translations = translationMap(entry.translations)

      return {
        sourceText: normalizeSproochliText(entry.source_text),
        aliases: Array.isArray(entry.aliases)
          ? entry.aliases.map(normalizeSproochliText).filter(Boolean)
          : [],
        targetLanguage,
        suggestedTranslation: normalizeSproochliText(translations[targetLanguage]),
      }
    })
}
