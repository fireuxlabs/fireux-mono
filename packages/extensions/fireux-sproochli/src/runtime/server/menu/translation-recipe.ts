import { makeSproochliSourceHash } from './key'
import type { SproochliTranslationMemoryCandidate } from './translation-memory'

export const SPROOCHLI_MENU_GLOSSARY_VERSION = 'restaurant_menu_v1'
export const SPROOCHLI_MENU_MEMORY_CACHE_VERSION =
  'menu_translation_memory_v1'
export const SPROOCHLI_MENU_MEMORY_DOMAIN = 'restaurant_menu'

const text = (value: unknown) => String(value ?? '').trim()
const language = (value: unknown) =>
  text(value).replace(/_/g, '-').toLowerCase()

export function sproochliMenuFieldKind(fieldId: unknown) {
  const id = text(fieldId)
  if (/^menu:[^:]+:name$/.test(id)) return 'menu_name'
  if (/^menu:[^:]+:description$/.test(id)) return 'menu_description'
  if (/^section:[^:]+:label$/.test(id)) return 'section_label'
  if (/^section:[^:]+:description$/.test(id)) return 'section_description'
  if (/^dish:[^:]+:name$/.test(id)) return 'dish_name'
  if (/^dish:[^:]+:description$/.test(id)) return 'dish_description'
  return 'menu_field'
}

export function sproochliMenuTranslationMemoryCandidate(input: {
  fieldId: string
  sourceText: string
  sourceLanguage?: string
  targetLanguage: string
  glossaryVersion?: string
}): SproochliTranslationMemoryCandidate {
  const fieldId = text(input.fieldId)
  const sourceText = text(input.sourceText)

  return {
    cacheVersion: SPROOCHLI_MENU_MEMORY_CACHE_VERSION,
    domain: SPROOCHLI_MENU_MEMORY_DOMAIN,
    fieldKind: sproochliMenuFieldKind(fieldId),
    fieldId,
    sourceLanguage: language(input.sourceLanguage) || 'auto',
    sourceText,
    sourceHash: makeSproochliSourceHash(sourceText),
    targetLanguage: language(input.targetLanguage),
    glossaryVersion:
      text(input.glossaryVersion) || SPROOCHLI_MENU_GLOSSARY_VERSION,
  }
}
