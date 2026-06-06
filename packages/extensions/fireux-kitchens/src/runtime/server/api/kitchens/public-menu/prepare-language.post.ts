import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, defineEventHandler, readBody } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { sproochliProviderUrl } from 'fireux-sproochli/runtime/composables/fireux/sproochli/provider'
import {
  normalizeSproochliLanguage,
  type SproochliLanguageCode,
} from 'fireux-sproochli/runtime/composables/fireux/sproochli/publicLanguage'

type PrepareLanguageBody = {
  kitchenSlug?: unknown
  menuId?: unknown
  language?: unknown
}

type MenuField = {
  id: string
  sourceLanguage: string
  sourceText: string
}

type SproochliTranslation = {
  cache_id?: string
  language?: string
  provider?: string
  text?: string
}

type SproochliTranslateResponse = {
  fields?: Array<{
    id?: string
    source_hash?: string
    source_text?: string
    translations?: SproochliTranslation[]
  }>
  failures?: Array<{
    field_id?: string
    language?: string
    message?: string
  }>
  glossary_version?: string
}

const CACHE_COLLECTION = 'translation_cache'
const DEFAULT_GLOSSARY_VERSION = 'restaurant_menu_v1'
const SYSTEM_ACTOR = 'system:sproochli-on-demand'
const MAX_FIELDS = 100

const text = (value: unknown) => String(value ?? '').trim()
const lower = (value: unknown) => text(value).toLowerCase()
const unique = (values: string[]) => [...new Set(values.map(text).filter(Boolean))]
const appIdFromRuntime = () => {
  const runtime = useRuntimeConfig()
  return text((runtime.public?.fireux as Record<string, unknown> | undefined)?.id)
}
const sourceLanguageFor = (
  menu: Record<string, unknown>,
  kitchen: Record<string, unknown>
) => {
  const settings =
    kitchen.language_settings &&
    typeof kitchen.language_settings === 'object' &&
    !Array.isArray(kitchen.language_settings)
      ? kitchen.language_settings as Record<string, unknown>
      : {}

  return (
    lower(menu.source_language) ||
    lower(settings.default_language) ||
    'en'
  )
}
const isActiveChild = (value: Record<string, unknown>) =>
  text(value.status) !== 'archived'
const field = (
  id: string,
  sourceLanguage: string,
  sourceText: unknown
): MenuField | null => {
  const normalizedId = text(id)
  const normalizedText = text(sourceText)
  if (!normalizedId || !normalizedText) return null
  return {
    id: normalizedId,
    sourceLanguage,
    sourceText: normalizedText,
  }
}

async function requestTranslations(input: {
  sourceLanguage: string
  targetLanguage: SproochliLanguageCode
  fields: MenuField[]
}) {
  const response = await fetch(sproochliProviderUrl('/api/tools/menu/translate'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sourceLanguage: input.sourceLanguage,
      targetLanguages: [input.targetLanguage],
      fields: input.fields.map((entry) => ({
        id: entry.id,
        sourceText: entry.sourceText,
      })),
    }),
  })

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: `Sproochli translation request failed: ${response.status}`,
    })
  }

  return await response.json() as SproochliTranslateResponse
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => null)) as PrepareLanguageBody | null
  const kitchenSlug = lower(body?.kitchenSlug)
  const menuId = text(body?.menuId)
  const language = normalizeSproochliLanguage(body?.language)
  const appId = appIdFromRuntime()

  if (!kitchenSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Kitchen slug is required.' })
  }
  if (!menuId) {
    throw createError({ statusCode: 400, statusMessage: 'Menu id is required.' })
  }
  if (!language) {
    return { ok: true, prepared: false, reason: 'original-language' }
  }
  if (!appId) {
    throw createError({ statusCode: 500, statusMessage: 'Runtime app id is missing.' })
  }

  const db = getRuntimeFirestore()
  const kitchenCollectionPath = `apps/${appId}/kitchens`
  const kitchenSnap = await db
    .collection(kitchenCollectionPath)
    .where('slug', '==', kitchenSlug)
    .limit(1)
    .get()
  const kitchenDoc = kitchenSnap.docs[0]

  if (!kitchenDoc) {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }

  const kitchen = kitchenDoc.data() as Record<string, unknown>
  if (kitchen.sproochli_enabled !== true) {
    throw createError({ statusCode: 404, statusMessage: 'Sproochli is not enabled.' })
  }

  const menuRef = kitchenDoc.ref.collection('menus').doc(menuId)
  const menuSnap = await menuRef.get()
  if (!menuSnap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Menu not found.' })
  }

  const menu = menuSnap.data() as Record<string, unknown>
  if (text(menu.status) !== 'published') {
    throw createError({ statusCode: 404, statusMessage: 'Menu is not published.' })
  }

  const menuSourceLanguage = sourceLanguageFor(menu, kitchen)
  const sectionsSnap = await menuRef.collection('sections').get()
  const sections = sectionsSnap.docs
    .map((doc) => ({ id: doc.id, ref: doc.ref, data: doc.data() as Record<string, unknown> }))
    .filter((entry) => isActiveChild(entry.data))
  const itemSnaps = await Promise.all(
    sections.map((section) => section.ref.collection('items').get())
  )
  const items = itemSnaps
    .flatMap((snap) => snap.docs.map((doc) => doc.data() as Record<string, unknown>))
    .filter(isActiveChild)
  const dishIds = unique(items.map((item) => text(item.dish_id)))
  const dishSnaps = await Promise.all(
    dishIds.map((dishId) => kitchenDoc.ref.collection('dishes').doc(dishId).get())
  )
  const dishes = dishSnaps
    .filter((snap) => snap.exists)
    .map((snap) => ({ id: snap.id, data: snap.data() as Record<string, unknown> }))
  const fields = [
    field(`menu:${menuId}:name`, menuSourceLanguage, menu.name),
    field(`menu:${menuId}:description`, menuSourceLanguage, menu.description),
    ...sections.flatMap((section) => [
      field(`section:${section.id}:label`, menuSourceLanguage, section.data.label),
      field(`section:${section.id}:description`, menuSourceLanguage, section.data.description),
    ]),
    ...dishes.flatMap((dish) => {
      const dishSourceLanguage = lower(dish.data.source_language) || menuSourceLanguage
      return [
        field(`dish:${dish.id}:name`, dishSourceLanguage, dish.data.name),
        field(`dish:${dish.id}:description`, dishSourceLanguage, dish.data.description),
      ]
    }),
  ]
    .filter((entry): entry is MenuField => Boolean(entry))
    .slice(0, MAX_FIELDS)

  if (!fields.length) {
    return { ok: true, prepared: false, reason: 'empty-menu' }
  }

  const cacheSnap = await menuRef
    .collection(CACHE_COLLECTION)
    .where('target_language', '==', language)
    .get()
  const currentCache = new Map(
    cacheSnap.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>
      return [text(data.field_id), data]
    })
  )
  const missingFields = fields.filter((entry) => {
    const cached = currentCache.get(entry.id)
    return !(
      cached &&
      text(cached.source_text) === entry.sourceText &&
      text(cached.translated_text)
    )
  })

  if (!missingFields.length) {
    return {
      ok: true,
      prepared: true,
      already_cached: true,
      language,
      fields: fields.length,
      written: 0,
    }
  }

  const responses: SproochliTranslateResponse[] = []
  const grouped = new Map<string, MenuField[]>()
  for (const entry of missingFields) {
    grouped.set(entry.sourceLanguage, [...(grouped.get(entry.sourceLanguage) ?? []), entry])
  }

  for (const [sourceLanguage, sourceFields] of grouped.entries()) {
    responses.push(
      await requestTranslations({
        sourceLanguage,
        targetLanguage: language,
        fields: sourceFields,
      })
    )
  }

  const batch = db.batch()
  let written = 0
  const failures = responses.flatMap((response) => response.failures ?? [])

  for (const response of responses) {
    for (const responseField of response.fields ?? []) {
      const fieldId = text(responseField.id)
      const sourceField = missingFields.find((entry) => entry.id === fieldId)
      const translation = (responseField.translations ?? []).find(
        (entry) => lower(entry.language) === language
      )
      const translatedText = text(translation?.text)
      const cacheId = text(translation?.cache_id)

      if (!fieldId || !sourceField || !translatedText || !cacheId) continue

      batch.set(menuRef.collection(CACHE_COLLECTION).doc(cacheId), {
        id: cacheId,
        field_id: fieldId,
        domain: 'restaurant_menu',
        glossary_version: text(response.glossary_version) || DEFAULT_GLOSSARY_VERSION,
        source_language: sourceField.sourceLanguage,
        target_language: language,
        source_text: sourceField.sourceText,
        translated_text: translatedText,
        provider: text(translation?.provider) || 'sproochli',
        source_hash: text(responseField.source_hash),
        usage_count: FieldValue.increment(1),
        reviewed: false,
        created: {
          at: FieldValue.serverTimestamp(),
          by: SYSTEM_ACTOR,
          app_id: appId,
        },
        updated: {
          at: FieldValue.serverTimestamp(),
          by: SYSTEM_ACTOR,
        },
      }, { merge: true })
      written += 1
    }
  }

  if (written) await batch.commit()

  return {
    ok: true,
    prepared: true,
    language,
    fields: fields.length,
    requested: missingFields.length,
    written,
    failures,
    collectionPath: menuRef.path,
  }
})
