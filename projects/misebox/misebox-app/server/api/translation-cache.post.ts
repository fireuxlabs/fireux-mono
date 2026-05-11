import { createError, defineEventHandler, readBody } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import {
  buildTranslationCacheDoc,
  getDefaultTranslationCacheDb,
  makeTranslationCacheKey,
  RESTAURANT_MENU_GLOSSARY_VERSION,
  translateTextBatch,
  translationCacheDocRef,
} from '../utils/translation-cache'
import { getRestaurantGlossaryTranslation } from '../utils/restaurant-translation-glossary'

type TranslationCacheRequestItem = {
  id?: unknown
  sourceLanguage?: unknown
  sourceText?: unknown
}

type TranslationCacheRequestBody = {
  domain?: unknown
  glossaryVersion?: unknown
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

  const normalizedItems = items.map((item, index) => {
    const sourceLanguage = normalizeLanguageCode(item.sourceLanguage)
    const sourceText = normalizeString(item.sourceText)
    const id = normalizeString(item.id) || String(index)
    const cacheId = makeTranslationCacheKey({
      domain,
      glossaryVersion,
      sourceLanguage,
      targetLanguage,
      sourceText,
    })

    return {
      id,
      sourceLanguage,
      sourceText,
      cacheId,
    }
  })

  const passThrough = normalizedItems.filter(
    (item) => !item.sourceText || !item.cacheId || item.sourceLanguage === targetLanguage
  )
  const cacheable = normalizedItems.filter((item) => item.sourceText && item.cacheId)
  const uniqueByCacheId = new Map<string, typeof cacheable[number]>()
  for (const item of cacheable) {
    if (!uniqueByCacheId.has(item.cacheId)) uniqueByCacheId.set(item.cacheId, item)
  }

  const { db, account } = await getDefaultTranslationCacheDb()
  const unique = Array.from(uniqueByCacheId.values())
  const snapshots = await Promise.all(
    unique.map((item) => translationCacheDocRef(db, item.cacheId).get())
  )
  const byCacheId = new Map<string, {
    text: string
    provider: string
    cached: boolean
  }>()
  const missing: typeof unique = []
  let usageBatch = db.batch()
  let usageOps = 0

  snapshots.forEach((snap, index) => {
    const item = unique[index]
    const data = snap.data() || {}
    const translatedText = normalizeString(data.translated_text)
    if (!snap.exists || !translatedText) {
      missing.push(item)
      return
    }

    byCacheId.set(item.cacheId, {
      text: translatedText,
      provider: normalizeString(data.provider) || 'cache',
      cached: true,
    })
    usageBatch.set(snap.ref, {
      usage_count: FieldValue.increment(
        cacheable.filter((entry) => entry.cacheId === item.cacheId).length
      ),
      updated: {
        at: FieldValue.serverTimestamp(),
        by: 'system:translation-cache',
      },
    }, { merge: true })
    usageOps += 1
  })

  const failures: Array<{ id: string; message: string }> = []
  const providerMissing: typeof missing = []

  for (const item of missing) {
    const glossaryText = domain === 'restaurant_menu'
      ? normalizeString(getRestaurantGlossaryTranslation({
          sourceText: item.sourceText,
          targetLanguage,
        }))
      : ''

    if (glossaryText) {
      byCacheId.set(item.cacheId, {
        text: glossaryText,
        provider: 'restaurant_glossary',
        cached: false,
      })
      usageBatch.set(
        translationCacheDocRef(db, item.cacheId),
        buildTranslationCacheDoc({
          id: item.cacheId,
          domain,
          glossaryVersion,
          sourceLanguage: item.sourceLanguage,
          targetLanguage,
          sourceText: item.sourceText,
          translatedText: glossaryText,
          provider: 'restaurant_glossary',
        }),
        { merge: false }
      )
      usageOps += 1
      continue
    }

    providerMissing.push(item)
  }

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
        usageBatch.set(
          translationCacheDocRef(db, item.cacheId),
          buildTranslationCacheDoc({
            id: item.cacheId,
            domain,
            glossaryVersion,
            sourceLanguage,
            targetLanguage,
            sourceText: item.sourceText,
            translatedText,
            provider: 'google',
          }),
          { merge: false }
        )
        usageOps += 1
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      group.forEach((item) => failures.push({ id: item.id, message }))
    }
  }

  if (usageOps > 0) await usageBatch.commit()

  return {
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
