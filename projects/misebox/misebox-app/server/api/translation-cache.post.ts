import { createError, defineEventHandler, readBody } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import {
  buildTranslationCacheDoc,
  getTranslationDatabases,
  makeMenuTranslationCacheKey,
  makeTranslationGlossaryKey,
  makeTranslationSourceHash,
  menuTranslationCacheDocRef,
  RESTAURANT_MENU_GLOSSARY_VERSION,
  translateTextBatch,
  translationGlossaryDocRef,
} from '../utils/translation-cache'

type TranslationCacheRequestItem = {
  id?: unknown
  sourceLanguage?: unknown
  sourceText?: unknown
}

type TranslationCacheRequestBody = {
  domain?: unknown
  glossaryVersion?: unknown
  kitchenCollectionPath?: unknown
  kitchenId?: unknown
  menuId?: unknown
  targetLanguage?: unknown
  items?: unknown
}

const MAX_ITEMS = 250
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) => normalizeString(value).replace(/_/g, '-')
const normalizeDomain = (value: unknown) =>
  normalizeString(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '_') || 'general'

function parseItems(value: unknown): TranslationCacheRequestItem[] {
  if (!Array.isArray(value)) return []

  return value
    .slice(0, MAX_ITEMS)
    .map((entry) => entry && typeof entry === 'object' ? entry as TranslationCacheRequestItem : null)
    .filter((entry): entry is TranslationCacheRequestItem => Boolean(entry))
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => null)) as TranslationCacheRequestBody | null
  const domain = normalizeDomain(body?.domain || 'restaurant_menu')
  const glossaryVersion = normalizeDomain(body?.glossaryVersion || RESTAURANT_MENU_GLOSSARY_VERSION)
  const kitchenCollectionPath = normalizeString(
    body?.kitchenCollectionPath || 'apps/misebox-app/kitchens'
  )
  const kitchenId = normalizeString(body?.kitchenId)
  const menuId = normalizeString(body?.menuId)
  const targetLanguage = normalizeLanguageCode(body?.targetLanguage)
  const items = parseItems(body?.items)

  if (!targetLanguage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Target language is required',
    })
  }

  if (!items.length) {
    return { items: [], failures: [] }
  }

  if (!kitchenId || !menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen id and menu id are required for menu translation cache',
    })
  }

  const normalizedItems = items.map((item, index) => {
    const sourceLanguage = normalizeLanguageCode(item.sourceLanguage)
    const sourceText = normalizeString(item.sourceText)
    const id = normalizeString(item.id) || String(index)
    const cacheId = makeMenuTranslationCacheKey({
      fieldId: id,
      targetLanguage,
    })

    return {
      id,
      sourceLanguage,
      sourceText,
      sourceHash: makeTranslationSourceHash(sourceText),
      cacheId,
      glossaryId: makeTranslationGlossaryKey({
        domain,
        sourceLanguage,
        sourceText,
      }),
    }
  })

  const passThrough = normalizedItems.filter(
    (item) => !item.sourceText || !item.cacheId || item.sourceLanguage === targetLanguage
  )
  const cacheable = normalizedItems.filter(
    (item) =>
      item.sourceText &&
      item.sourceLanguage &&
      item.cacheId &&
      item.sourceLanguage !== targetLanguage
  )
  const uniqueByCacheId = new Map<string, typeof cacheable[number]>()
  for (const item of cacheable) {
    if (!uniqueByCacheId.has(item.cacheId)) uniqueByCacheId.set(item.cacheId, item)
  }

  const { defaultDb, nativeDb, account } = await getTranslationDatabases()
  const unique = Array.from(uniqueByCacheId.values())
  const cacheSnapshots = await Promise.all(
    unique.map((item) => menuTranslationCacheDocRef(nativeDb, {
      kitchenCollectionPath,
      kitchenId,
      menuId,
      id: item.cacheId,
    }).get())
  )
  const byCacheId = new Map<string, {
    text: string
    provider: string
    cached: boolean
  }>()
  const cacheMissing: typeof unique = []
  let batch = nativeDb.batch()
  let ops = 0

  cacheSnapshots.forEach((snap, index) => {
    const item = unique[index]
    const data = snap.data() || {}
    const translatedText = normalizeString(data.translated_text)
    const sourceHash = normalizeString(data.source_hash)

    if (!snap.exists || !translatedText || sourceHash !== item.sourceHash) {
      cacheMissing.push(item)
      return
    }

    byCacheId.set(item.cacheId, {
      text: translatedText,
      provider: normalizeString(data.provider) || 'menu_cache',
      cached: true,
    })
    batch.set(snap.ref, {
      usage_count: FieldValue.increment(
        cacheable.filter((entry) => entry.cacheId === item.cacheId).length
      ),
      updated: {
        at: FieldValue.serverTimestamp(),
        by: 'system:translation-cache',
      },
    }, { merge: true })
    ops += 1
  })

  const glossarySnapshots = await Promise.all(
    cacheMissing.map((item) => item.glossaryId
      ? translationGlossaryDocRef(defaultDb, item.glossaryId).get()
      : Promise.resolve(null)
    )
  )
  const providerMissing: typeof unique = []
  const failures: Array<{ id: string; message: string }> = []

  glossarySnapshots.forEach((snap, index) => {
    const item = cacheMissing[index]
    if (!snap?.exists) {
      providerMissing.push(item)
      return
    }

    const data = snap.data() || {}
    const translations =
      data.translations && typeof data.translations === 'object'
        ? data.translations as Record<string, unknown>
        : {}
    const translatedText = normalizeString(translations[targetLanguage])
    if (!translatedText) {
      providerMissing.push(item)
      return
    }

    byCacheId.set(item.cacheId, {
      text: translatedText,
      provider: normalizeString(data.provider || data.kind) || 'translation_glossary',
      cached: false,
    })
    batch.set(
      menuTranslationCacheDocRef(nativeDb, {
        kitchenCollectionPath,
        kitchenId,
        menuId,
        id: item.cacheId,
      }),
      {
        ...buildTranslationCacheDoc({
          id: item.cacheId,
          fieldId: item.id,
          domain,
          glossaryVersion,
          sourceLanguage: item.sourceLanguage,
          targetLanguage,
          sourceText: item.sourceText,
          translatedText,
          provider: normalizeString(data.provider || data.kind) || 'translation_glossary',
        }),
        reviewed: data.verified === true,
      },
      { merge: false }
    )
    ops += 1
  })

  const missingGroups = new Map<string, typeof providerMissing>()
  for (const item of providerMissing) {
    const key = item.sourceLanguage
    const group = missingGroups.get(key) || []
    group.push(item)
    missingGroups.set(key, group)
  }

  for (const [sourceLanguage, group] of missingGroups) {
    try {
      const translated = await translateTextBatch(account, {
        sourceLanguage,
        targetLanguage,
        texts: group.map((item) => item.sourceText),
      })

      group.forEach((item, index) => {
        const translatedText = normalizeString(translated[index])
        if (!translatedText) {
          failures.push({ id: item.id, message: 'Empty translation result' })
          return
        }

        byCacheId.set(item.cacheId, {
          text: translatedText,
          provider: 'google',
          cached: false,
        })
        batch.set(
          menuTranslationCacheDocRef(nativeDb, {
            kitchenCollectionPath,
            kitchenId,
            menuId,
            id: item.cacheId,
          }),
          {
            ...buildTranslationCacheDoc({
              id: item.cacheId,
              fieldId: item.id,
              domain,
              glossaryVersion,
              sourceLanguage,
              targetLanguage,
              sourceText: item.sourceText,
              translatedText,
              provider: 'google',
            }),
            reviewed: false,
          },
          { merge: false }
        )
        ops += 1
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      group.forEach((item) => failures.push({ id: item.id, message }))
    }
  }

  if (ops > 0) await batch.commit()

  return {
    cache_path: `${kitchenCollectionPath}/${kitchenId}/menus/${menuId}/translation_cache`,
    glossary_collection: 'translation_glossary',
    items: normalizedItems.map((item) => {
      const cached = item.cacheId ? byCacheId.get(item.cacheId) : null
      return {
        id: item.id,
        cache_id: item.cacheId,
        source_language: item.sourceLanguage,
        target_language: targetLanguage,
        source_text: item.sourceText,
        translated_text: cached?.text || '',
        provider: cached?.provider || '',
        cached: cached?.cached === true,
        skipped: passThrough.some((entry) => entry.id === item.id),
      }
    }),
    failures,
  }
})
