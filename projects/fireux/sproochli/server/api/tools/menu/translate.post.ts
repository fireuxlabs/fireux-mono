import { createError, defineEventHandler, readBody } from 'h3'
import { setSproochliToolHeaders } from '../../../utils/sproochliTools'
import {
  makeSproochliMenuCacheKey,
  makeSproochliSourceHash,
  normalizeSproochliLanguageCode,
  normalizeSproochliText,
  resolveSproochliServiceAccount,
  translateSproochliTextBatch,
} from '../../../utils/sproochliTranslate'

type MenuTranslateBody = {
  fields?: unknown
  glossaryVersion?: unknown
  sourceLanguage?: unknown
  targetLanguages?: unknown
}

type MenuTranslateField = {
  id: string
  sourceText: string
}

const MAX_FIELDS = 100
const DEFAULT_GLOSSARY_VERSION = 'restaurant_menu_v1'

function uniqueLanguages(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.map(normalizeSproochliLanguageCode).filter(Boolean))]
    : []
}

function parseFields(value: unknown): MenuTranslateField[] {
  if (!Array.isArray(value)) return []

  return value
    .slice(0, MAX_FIELDS)
    .map((entry, index) => {
      const record = entry && typeof entry === 'object'
        ? entry as Record<string, unknown>
        : {}
      return {
        id: normalizeSproochliText(record.id) || `field:${index}`,
        sourceText: normalizeSproochliText(record.sourceText),
      }
    })
    .filter((entry) => entry.id)
}

export default defineEventHandler(async (event) => {
  setSproochliToolHeaders(event)

  const body = (await readBody(event).catch(() => null)) as MenuTranslateBody | null
  const sourceLanguage = normalizeSproochliLanguageCode(body?.sourceLanguage || 'en')
  const targetLanguages = uniqueLanguages(body?.targetLanguages)
  const glossaryVersion =
    normalizeSproochliText(body?.glossaryVersion) || DEFAULT_GLOSSARY_VERSION
  const fields = parseFields(body?.fields)

  if (!sourceLanguage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Source language is required.',
    })
  }

  if (!targetLanguages.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Target languages are required.',
    })
  }

  if (!fields.length) {
    return {
      ok: true,
      provider: 'sproochli',
      source_language: sourceLanguage,
      target_languages: targetLanguages,
      glossary_version: glossaryVersion,
      fields: [],
      failures: [],
    }
  }

  const responseFields = fields.map((field) => ({
    id: field.id,
    source_text: field.sourceText,
    source_hash: makeSproochliSourceHash(field.sourceText),
    translations: targetLanguages.map((language) => ({
      language,
      text:
        !field.sourceText || language === sourceLanguage
          ? field.sourceText
          : '',
      provider:
        !field.sourceText
          ? 'empty'
          : language === sourceLanguage
            ? 'source'
            : 'sproochli',
      cache_id: makeSproochliMenuCacheKey({
        fieldId: field.id,
        targetLanguage: language,
      }),
    })),
  }))
  const failures: Array<{ field_id: string; language: string; message: string }> = []
  const translationTargets = targetLanguages.filter((language) => language !== sourceLanguage)
  const fieldsWithText = fields.filter((field) => field.sourceText)

  if (translationTargets.length && fieldsWithText.length) {
    const account = await resolveSproochliServiceAccount()

    for (const language of translationTargets) {
      try {
        const translated = await translateSproochliTextBatch(account, {
          sourceLanguage,
          targetLanguage: language,
          texts: fieldsWithText.map((field) => field.sourceText),
        })

        fieldsWithText.forEach((field, index) => {
          const translatedText = normalizeSproochliText(translated[index])
          const responseField = responseFields.find((entry) => entry.id === field.id)
          const translation = responseField?.translations.find(
            (entry) => entry.language === language
          )

          if (!translatedText) {
            failures.push({
              field_id: field.id,
              language,
              message: 'Empty translation result.',
            })
            return
          }

          if (translation) translation.text = translatedText
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        fieldsWithText.forEach((field) => {
          failures.push({ field_id: field.id, language, message })
        })
      }
    }
  }

  return {
    ok: true,
    provider: 'sproochli',
    source_language: sourceLanguage,
    target_languages: targetLanguages,
    glossary_version: glossaryVersion,
    fields: responseFields,
    failures,
  }
})
