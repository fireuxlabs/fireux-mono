import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, readBody } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  normalizeSproochliLanguage,
  requestSproochliMenuTranslations,
} from 'fireux-sproochli/runtime/sproochli'
import {
  readKitchenPublicMenuLanguageFields,
  readKitchenPublicMenuLanguageSource,
} from '../../../utils/kitchens/publicMenuLanguageFields'
import {
  readMissingKitchenPublicMenuLanguageFields,
  writeKitchenPublicMenuTranslationCache,
} from '../../../utils/kitchens/publicMenuTranslationCache'

type PrepareLanguageBody = {
  kitchenSlug?: unknown
  menuId?: unknown
  language?: unknown
}

const MAX_FIELDS = 100

const text = (value: unknown) => String(value ?? '').trim()
const lower = (value: unknown) => text(value).toLowerCase()
const appIdFromRuntime = () => {
  const runtime = useRuntimeConfig()
  return text((runtime.public?.fireux as Record<string, unknown> | undefined)?.id)
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
  const source = await readKitchenPublicMenuLanguageSource(db, {
    appId,
    kitchenSlug,
    menuId,
  })

  if (!source.ok && source.reason === 'kitchen') {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }
  if (!source.ok && source.reason === 'menu') {
    throw createError({ statusCode: 404, statusMessage: 'Menu not found.' })
  }
  if (!source.ok) {
    throw createError({ statusCode: 404, statusMessage: 'Public menu source not found.' })
  }

  if (source.kitchen.sproochli_enabled !== true) {
    throw createError({ statusCode: 404, statusMessage: 'Sproochli is not enabled.' })
  }
  if (text(source.menu.status) !== 'published') {
    throw createError({ statusCode: 404, statusMessage: 'Menu is not published.' })
  }

  const fields = await readKitchenPublicMenuLanguageFields({
    appKitchenRef: source.appKitchenRef,
    menu: source.menu,
    menuId,
    menuRef: source.menuRef,
    maxFields: MAX_FIELDS,
  })

  if (!fields.length) {
    return { ok: true, prepared: false, reason: 'empty-menu' }
  }

  const missingFields = await readMissingKitchenPublicMenuLanguageFields({
    menuRef: source.menuRef,
    language,
    fields,
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

  const responses: Awaited<ReturnType<typeof requestSproochliMenuTranslations>>[] = []
  const grouped = new Map<string, typeof missingFields>()
  for (const entry of missingFields) {
    grouped.set(entry.sourceLanguage, [...(grouped.get(entry.sourceLanguage) ?? []), entry])
  }

  for (const [sourceLanguage, sourceFields] of grouped.entries()) {
    try {
      responses.push(
        await requestSproochliMenuTranslations({
          sourceLanguage,
          targetLanguages: [language],
          fields: sourceFields.map((entry) => ({
            id: entry.id,
            sourceText: entry.sourceText,
          })),
        })
      )
    } catch (error) {
      throw createError({
        statusCode: 502,
        statusMessage: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const { written, failures } = await writeKitchenPublicMenuTranslationCache({
    db,
    menuRef: source.menuRef,
    appId,
    language,
    fields: missingFields,
    responses,
  })

  return {
    ok: true,
    prepared: true,
    language,
    fields: fields.length,
    requested: missingFields.length,
    written,
    failures,
    collectionPath: source.menuRef.path,
  }
})
