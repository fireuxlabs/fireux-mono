import { createError, defineEventHandler, readBody } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import {
  buildTranslationCacheDoc,
  getTranslationDatabases,
  makeMenuTranslationCacheKey,
  menuTranslationCacheDocRef,
  RESTAURANT_MENU_GLOSSARY_VERSION,
  translateTextBatch,
} from '../utils/translation-cache'

type SyncField = 'name' | 'description'

type KitchenMenuTranslationSyncBody = {
  attachedLanguages?: unknown
  cacheLanguages?: unknown
  field?: unknown
  glossaryVersion?: unknown
  kitchenCollectionPath?: unknown
  kitchenId?: unknown
  menuId?: unknown
  sourceLanguage?: unknown
  sourceText?: unknown
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) => normalizeString(value).replace(/_/g, '-')
const uniqueLanguages = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.map(normalizeLanguageCode).filter(Boolean))]
    : []

const fieldMap: Record<SyncField, 'names' | 'descriptions'> = {
  name: 'names',
  description: 'descriptions',
}

function normalizeField(value: unknown): SyncField {
  return normalizeString(value) === 'description' ? 'description' : 'name'
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: 'system:kitchen-menu-translation-sync',
  }
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => null)) as KitchenMenuTranslationSyncBody | null
  const kitchenCollectionPath = normalizeString(
    body?.kitchenCollectionPath || 'apps/misebox-app/kitchens'
  )
  const kitchenId = normalizeString(body?.kitchenId)
  const menuId = normalizeString(body?.menuId)
  const field = normalizeField(body?.field)
  const mapField = fieldMap[field]
  const sourceLanguage = normalizeLanguageCode(body?.sourceLanguage || 'de')
  const sourceText = normalizeString(body?.sourceText)
  const attachedLanguages = uniqueLanguages(body?.attachedLanguages)
  const cacheLanguages = uniqueLanguages(body?.cacheLanguages)
  const targetLanguages = [...new Set([...attachedLanguages, ...cacheLanguages])]

  if (!kitchenId || !menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen id and menu id are required',
    })
  }

  if (!sourceLanguage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Source language is required',
    })
  }

  const { nativeDb, account } = await getTranslationDatabases()
  const menuRef = nativeDb.doc(`${kitchenCollectionPath}/${kitchenId}/menus/${menuId}`)
  const menuSnap = await menuRef.get()
  if (!menuSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: `Menu not found: ${menuRef.path}`,
    })
  }

  const fieldId = `menu:${menuId}:${field}`
  const batch = nativeDb.batch()
  const attachedPatch: Record<string, string> = {}
  const cacheWrites: Array<{
    id: string
    targetLanguage: string
    translatedText: string
  }> = []
  const cacheDeletes: string[] = []
  const failures: Array<{ language: string; message: string }> = []

  if (!sourceText) {
    for (const language of attachedLanguages) {
      attachedPatch[language] = ''
    }

    for (const language of cacheLanguages) {
      const id = makeMenuTranslationCacheKey({ fieldId, targetLanguage: language })
      if (id) cacheDeletes.push(id)
    }
  } else {
    for (const language of targetLanguages) {
      try {
        const translatedText =
          language === sourceLanguage
            ? sourceText
            : normalizeString(
                (await translateTextBatch(account, {
                  sourceLanguage,
                  targetLanguage: language,
                  texts: [sourceText],
                }))[0]
              )

        if (!translatedText) {
          failures.push({ language, message: 'Empty translation result' })
          continue
        }

        if (attachedLanguages.includes(language)) {
          attachedPatch[language] = translatedText
        }

        if (cacheLanguages.includes(language)) {
          const id = makeMenuTranslationCacheKey({ fieldId, targetLanguage: language })
          if (id) cacheWrites.push({ id, targetLanguage: language, translatedText })
        }
      } catch (error) {
        failures.push({
          language,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  batch.set(
    menuRef,
    {
      [mapField]: attachedPatch,
      updated: updatedStamp(),
    },
    { merge: true }
  )

  for (const id of cacheDeletes) {
    batch.delete(
      menuTranslationCacheDocRef(nativeDb, {
        kitchenCollectionPath,
        kitchenId,
        menuId,
        id,
      })
    )
  }

  for (const entry of cacheWrites) {
    batch.set(
      menuTranslationCacheDocRef(nativeDb, {
        kitchenCollectionPath,
        kitchenId,
        menuId,
        id: entry.id,
      }),
      buildTranslationCacheDoc({
        id: entry.id,
        fieldId,
        domain: 'restaurant_menu',
        glossaryVersion: normalizeString(body?.glossaryVersion) || RESTAURANT_MENU_GLOSSARY_VERSION,
        sourceLanguage,
        targetLanguage: entry.targetLanguage,
        sourceText,
        translatedText: entry.translatedText,
        provider: entry.targetLanguage === sourceLanguage ? 'source' : 'google',
      }),
      { merge: false }
    )
  }

  await batch.commit()

  return {
    menu_path: menuRef.path,
    field,
    source_language: sourceLanguage,
    attached_languages: attachedLanguages,
    cache_languages: cacheLanguages,
    attached: attachedPatch,
    cache_written: cacheWrites.map((entry) => entry.targetLanguage),
    cache_deleted: cacheDeletes.length,
    failures,
  }
})
