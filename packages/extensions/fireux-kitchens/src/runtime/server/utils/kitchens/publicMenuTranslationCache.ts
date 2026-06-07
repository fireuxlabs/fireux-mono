import {
  FieldValue,
  type DocumentReference,
  type Firestore,
} from 'firebase-admin/firestore'
import type { SproochliMenuTranslateResponse } from 'fireux-sproochli/runtime/sproochli'
import type { KitchenPublicMenuLanguageField } from './publicMenuLanguageFields'

export const KITCHEN_PUBLIC_MENU_TRANSLATION_CACHE_COLLECTION = 'translation_cache'

const DEFAULT_GLOSSARY_VERSION = 'restaurant_menu_v1'
const SYSTEM_ACTOR = 'system:sproochli-on-demand'
const text = (value: unknown) => String(value ?? '').trim()
const lower = (value: unknown) => text(value).toLowerCase()

export async function readMissingKitchenPublicMenuLanguageFields(input: {
  menuRef: DocumentReference
  language: string
  fields: KitchenPublicMenuLanguageField[]
}) {
  const cacheSnap = await input.menuRef
    .collection(KITCHEN_PUBLIC_MENU_TRANSLATION_CACHE_COLLECTION)
    .where('target_language', '==', input.language)
    .get()
  const currentCache = new Map(
    cacheSnap.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>
      return [text(data.field_id), data]
    })
  )

  return input.fields.filter((entry) => {
    const cached = currentCache.get(entry.id)
    return !(
      cached &&
      text(cached.source_text) === entry.sourceText &&
      text(cached.translated_text)
    )
  })
}

export async function writeKitchenPublicMenuTranslationCache(input: {
  db: Firestore
  menuRef: DocumentReference
  appId: string
  language: string
  fields: KitchenPublicMenuLanguageField[]
  responses: SproochliMenuTranslateResponse[]
}) {
  const batch = input.db.batch()
  const sourceFieldById = new Map(input.fields.map((entry) => [entry.id, entry]))
  const failures = input.responses.flatMap((response) => response.failures ?? [])
  let written = 0

  for (const response of input.responses) {
    for (const responseField of response.fields ?? []) {
      const fieldId = text(responseField.id)
      const sourceField = sourceFieldById.get(fieldId)
      const translation = (responseField.translations ?? []).find(
        (entry) => lower(entry.language) === input.language
      )
      const translatedText = text(translation?.text)
      const cacheId = text(translation?.cache_id)

      if (!fieldId || !sourceField || !translatedText || !cacheId) continue

      batch.set(
        input.menuRef
          .collection(KITCHEN_PUBLIC_MENU_TRANSLATION_CACHE_COLLECTION)
          .doc(cacheId),
        {
          id: cacheId,
          field_id: fieldId,
          domain: 'restaurant_menu',
          glossary_version:
            text(response.glossary_version) || DEFAULT_GLOSSARY_VERSION,
          source_language: sourceField.sourceLanguage,
          target_language: input.language,
          source_text: sourceField.sourceText,
          translated_text: translatedText,
          provider: text(translation?.provider) || 'sproochli',
          source_hash: text(responseField.source_hash),
          usage_count: FieldValue.increment(1),
          reviewed: false,
          created: {
            at: FieldValue.serverTimestamp(),
            by: SYSTEM_ACTOR,
            app_id: input.appId,
          },
          updated: {
            at: FieldValue.serverTimestamp(),
            by: SYSTEM_ACTOR,
          },
        },
        { merge: true }
      )
      written += 1
    }
  }

  if (written) await batch.commit()

  return { written, failures }
}
