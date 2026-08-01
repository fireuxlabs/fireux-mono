import { createHash } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import type { SproochliHostStorage } from './storage'
import {
  matchesSproochliStorageMetadata,
  sproochliStorageMetadata,
} from './storage'
import { makeSproochliSourceHash } from './key'

export const SPROOCHLI_MENU_TRANSLATION_CACHE_COLLECTION =
  'menu_translation_caches'

export type SproochliMenuTranslationCacheField = {
  id: string
  sourceText: string
}

export type SproochliMenuTranslationCacheSource = {
  appId: string
  kitchenId: string
  menuId: string
}

export type SproochliMenuTranslationCacheScope = {
  storage: SproochliHostStorage
  source: SproochliMenuTranslationCacheSource
  fields: SproochliMenuTranslationCacheField[]
}

export type SproochliMenuTranslationCacheInput =
  SproochliMenuTranslationCacheScope & {
    targetLanguage: string
  }

type NormalizedScope = {
  source: SproochliMenuTranslationCacheSource
  fields: Array<{ id: string, source_hash: string }>
  fingerprint: string
}

type NormalizedInput = NormalizedScope & {
  targetLanguage: string
  id: string
}

const text = (value: unknown) => String(value ?? '').trim()
const language = (value: unknown) =>
  text(value).replace(/_/g, '-').toLowerCase()

function normalizeScope(
  input: SproochliMenuTranslationCacheScope
): NormalizedScope | null {
  const fields = input.fields
    .map(field => ({
      id: text(field.id),
      source_hash: makeSproochliSourceHash(text(field.sourceText)),
    }))
    .filter(field => field.id && field.source_hash)
    .sort((left, right) => left.id.localeCompare(right.id))
  if (
    !fields.length ||
    new Set(fields.map(field => field.id)).size !== fields.length
  ) return null

  const source = {
    appId: text(input.source.appId),
    kitchenId: text(input.source.kitchenId),
    menuId: text(input.source.menuId),
  }
  if (!source.appId || !source.kitchenId || !source.menuId) return null

  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ version: 1, source, fields }), 'utf8')
    .digest('hex')
  return { source, fields, fingerprint }
}

function normalize(
  input: SproochliMenuTranslationCacheInput
): NormalizedInput | null {
  const scope = normalizeScope(input)
  const targetLanguage = language(input.targetLanguage)
  if (!scope || !targetLanguage) return null
  const id = `${targetLanguage}__${scope.fingerprint.slice(0, 40)}`
  return { ...scope, targetLanguage, id }
}

export function sproochliMenuTranslationCacheIdentity(
  input: SproochliMenuTranslationCacheInput
) {
  return normalize(input)
}

function translationsFromData(
  input: SproochliMenuTranslationCacheInput,
  normalized: NormalizedInput,
  data: Record<string, unknown>
) {
  if (
    !matchesSproochliStorageMetadata(data.storage, input.storage.target) ||
    data.complete !== true ||
    data.fingerprint !== normalized.fingerprint ||
    data.target_language !== normalized.targetLanguage ||
    !Array.isArray(data.fields)
  ) return null

  const translations = new Map<string, string>()
  for (const field of data.fields) {
    if (!field || typeof field !== 'object') return null
    const record = field as Record<string, unknown>
    const id = text(record.id)
    const sourceHash = text(record.source_hash)
    const translatedText = text(record.translated_text)
    if (!id || !sourceHash || !translatedText) return null
    const expected = normalized.fields.find(candidate => candidate.id === id)
    if (!expected || expected.source_hash !== sourceHash) return null
    translations.set(id, translatedText)
  }
  return translations.size === normalized.fields.length
    ? translations
    : null
}

export async function readSproochliMenuTranslationCache(
  input: SproochliMenuTranslationCacheInput
) {
  const normalized = normalize(input)
  if (!normalized) return null
  const snapshot = await input.storage.db
    .collection(SPROOCHLI_MENU_TRANSLATION_CACHE_COLLECTION)
    .doc(normalized.id)
    .get()
  const data = snapshot.data() || {}
  return snapshot.exists
    ? translationsFromData(input, normalized, data)
    : null
}

export async function readSproochliMenuTranslationCacheLanguages(
  input: SproochliMenuTranslationCacheScope
) {
  const scope = normalizeScope(input)
  if (!scope) return []

  const snapshot = await input.storage.db
    .collection(SPROOCHLI_MENU_TRANSLATION_CACHE_COLLECTION)
    .where('fingerprint', '==', scope.fingerprint)
    .get()
  const languages = snapshot.docs
    .map((document) => {
      const targetLanguage = language(document.data().target_language)
      const candidate = { ...input, targetLanguage }
      const normalized = normalize(candidate)
      return normalized &&
        document.id === normalized.id &&
        translationsFromData(candidate, normalized, document.data())
        ? targetLanguage
        : ''
    })
    .filter((entry): entry is string => Boolean(entry))

  return [...new Set(languages)].sort()
}

export async function writeSproochliMenuTranslationCache(input: {
  cache: SproochliMenuTranslationCacheInput
  translations: Map<string, string>
}) {
  const normalized = normalize(input.cache)
  if (
    !normalized ||
    input.translations.size !== normalized.fields.length
  ) return false
  const fields = normalized.fields.map(field => {
    const translatedText = text(input.translations.get(field.id))
    return translatedText
      ? { ...field, translated_text: translatedText }
      : null
  })
  if (fields.some(field => !field)) return false

  const ref = input.cache.storage.db
    .collection(SPROOCHLI_MENU_TRANSLATION_CACHE_COLLECTION)
    .doc(normalized.id)
  await input.cache.storage.db.runTransaction(async transaction => {
    const existing = await transaction.get(ref)
    if (existing.exists) return
    transaction.create(ref, {
      id: normalized.id,
      version: 1,
      complete: true,
      fingerprint: normalized.fingerprint,
      target_language: normalized.targetLanguage,
      storage: sproochliStorageMetadata(input.cache.storage.target),
      source: {
        app_id: normalized.source.appId,
        kitchen_id: normalized.source.kitchenId,
        menu_id: normalized.source.menuId,
      },
      fields,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    })
  })
  return true
}
