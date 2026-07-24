import { createError, defineEventHandler, readBody } from 'h3'
import { SPROOCHLI_LANGUAGE_OPTIONS } from 'fireux-sproochli/runtime/composables/fireux/sproochli/publicLanguage.ts'
import { setSproochliToolHeaders } from '../../../utils/sproochliTools'
import { translateSproochliMenuFieldWithAi } from '../../../utils/sproochliMenuAi'
import { restaurantMenuFieldKind } from '../../../utils/restaurantMenuContext'
import {
  normalizeSproochliLanguageCode,
  normalizeSproochliText,
  resolveSproochliServiceAccount,
  translateSproochliTextBatch,
} from '../../../utils/sproochliTranslate'
import { makeSproochliSourceHash } from '../../../utils/sproochliTranslationKey'
import {
  readSproochliTranslationMemory,
  sproochliTranslationMemoryId,
  writeSproochliTranslationMemory,
  type SproochliTranslationMemoryCandidate,
  type SproochliTranslationMemoryValue,
} from '../../../utils/sproochliTranslationMemory'

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
const MAX_FIELD_ID_LENGTH = 240
const MAX_SOURCE_TEXT_LENGTH = 4_000
const MAX_TOTAL_SOURCE_TEXT_LENGTH = 40_000
const MAX_TARGET_LANGUAGES = 8
const MAX_TRANSLATION_UNITS = 200
const MAX_GLOSSARY_VERSION_LENGTH = 120
const DEFAULT_GLOSSARY_VERSION = 'restaurant_menu_v1'
const TRANSLATION_MEMORY_CACHE_VERSION = 'menu_translation_memory_v1'
const TRANSLATION_MEMORY_DOMAIN = 'restaurant_menu'
const SUPPORTED_LANGUAGES = new Set<string>(
  SPROOCHLI_LANGUAGE_OPTIONS.map(option => option.code).filter(Boolean)
)

function uniqueLanguages(value: unknown) {
  if (!Array.isArray(value)) return []

  const requested = value
    .map(normalizeSproochliLanguageCode)
    .filter(Boolean)
  const unsupported = requested.find(
    language => !SUPPORTED_LANGUAGES.has(language)
  )
  if (unsupported) {
    throw createError({
      statusCode: 400,
      statusMessage: `Target language is not supported: ${unsupported}.`,
    })
  }

  const languages = [...new Set(requested)]
  if (languages.length > MAX_TARGET_LANGUAGES) {
    throw createError({
      statusCode: 400,
      statusMessage:
        `A maximum of ${MAX_TARGET_LANGUAGES} target languages is allowed.`,
    })
  }

  return languages
}

function parseFields(value: unknown): MenuTranslateField[] {
  if (!Array.isArray(value)) return []
  if (value.length > MAX_FIELDS) {
    throw createError({
      statusCode: 400,
      statusMessage: `A maximum of ${MAX_FIELDS} fields is allowed.`,
    })
  }

  const fields = value
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

  if (new Set(fields.map(field => field.id)).size !== fields.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Field ids must be unique within a translation request.',
    })
  }

  if (fields.some(field => field.id.length > MAX_FIELD_ID_LENGTH)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Field ids must be ${MAX_FIELD_ID_LENGTH} characters or fewer.`,
    })
  }

  if (fields.some(field => field.sourceText.length > MAX_SOURCE_TEXT_LENGTH)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Source text must be ${MAX_SOURCE_TEXT_LENGTH} characters or fewer.`,
    })
  }

  const totalSourceCharacters = fields.reduce(
    (total, field) => total + field.sourceText.length,
    0
  )
  if (totalSourceCharacters > MAX_TOTAL_SOURCE_TEXT_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage:
        `Source text must total ${MAX_TOTAL_SOURCE_TEXT_LENGTH} characters or fewer.`,
    })
  }

  return fields
}

export default defineEventHandler(async (event) => {
  setSproochliToolHeaders(event)

  const body = (await readBody(event).catch(() => null)) as MenuTranslateBody | null
  const sourceLanguage = normalizeSproochliLanguageCode(body?.sourceLanguage || 'auto')
  const targetLanguages = uniqueLanguages(body?.targetLanguages)
  const glossaryVersion =
    normalizeSproochliText(body?.glossaryVersion) || DEFAULT_GLOSSARY_VERSION
  const fields = parseFields(body?.fields)

  if (glossaryVersion.length > MAX_GLOSSARY_VERSION_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage:
        `Glossary version must be ${MAX_GLOSSARY_VERSION_LENGTH} characters or fewer.`,
    })
  }

  if (!sourceLanguage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Source language is required.',
    })
  }

  if (sourceLanguage !== 'auto' && !SUPPORTED_LANGUAGES.has(sourceLanguage)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Source language is not supported.',
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

  if (fields.length * targetLanguages.length > MAX_TRANSLATION_UNITS) {
    throw createError({
      statusCode: 400,
      statusMessage:
        `A maximum of ${MAX_TRANSLATION_UNITS} field-language translations is allowed.`,
    })
  }

  const memoryCandidate = (
    field: MenuTranslateField,
    targetLanguage: string
  ): SproochliTranslationMemoryCandidate => ({
    cacheVersion: TRANSLATION_MEMORY_CACHE_VERSION,
    domain: TRANSLATION_MEMORY_DOMAIN,
    fieldKind: restaurantMenuFieldKind(field.id),
    fieldId: field.id,
    sourceLanguage,
    sourceText: field.sourceText,
    sourceHash: makeSproochliSourceHash(field.sourceText),
    targetLanguage,
    glossaryVersion,
  })

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
      cache_id: sproochliTranslationMemoryId(
        memoryCandidate(field, language)
      ),
      memory_hit: false,
    })),
  }))
  const failures: Array<{ field_id: string; language: string; message: string }> = []
  const translationTargets = targetLanguages.filter((language) => language !== sourceLanguage)
  const fieldsWithText = fields.filter((field) => field.sourceText)
  const responseFieldById = new Map(responseFields.map((field) => [field.id, field]))
  const memoryCandidates: SproochliTranslationMemoryCandidate[] =
    translationTargets.flatMap(targetLanguage =>
      fieldsWithText.map(field => memoryCandidate(field, targetLanguage))
    )
  const generatedMemoryValues: SproochliTranslationMemoryValue[] = []
  let memoryHits = new Map<string, { provider: string, text: string }>()
  let memoryStatus: 'ready' | 'degraded' = 'ready'
  let memoryWrites = 0
  let serviceAccountPromise: ReturnType<
    typeof resolveSproochliServiceAccount
  > | null = null

  if (memoryCandidates.length) {
    try {
      memoryHits = await readSproochliTranslationMemory(memoryCandidates)
    } catch (error) {
      memoryStatus = 'degraded'
      console.warn(
        '[sproochli] Translation-memory read unavailable; continuing with provider generation.',
        error instanceof Error ? error.message : String(error)
      )
    }

    memoryCandidates.forEach((candidate) => {
      const hit = memoryHits.get(sproochliTranslationMemoryId(candidate))
      const translation = responseFieldById.get(candidate.fieldId)?.translations.find(
        entry => entry.language === candidate.targetLanguage
      )
      if (!hit || !translation) return

      translation.text = hit.text
      translation.provider = hit.provider
      translation.memory_hit = true
    })
  }

  if (translationTargets.length && fieldsWithText.length) {
    for (const language of translationTargets) {
      const fieldsNeedingMachineTranslation = []

      for (const field of fieldsWithText) {
        const translation = responseFieldById.get(field.id)?.translations.find(
          entry => entry.language === language
        )
        if (translation?.text) continue

        const aiTranslation = await translateSproochliMenuFieldWithAi(event, {
          fieldId: field.id,
          sourceText: field.sourceText,
          sourceLanguage,
          targetLanguage: language,
          glossaryVersion,
        })

        if (aiTranslation?.text && translation) {
          translation.text = aiTranslation.text
          translation.provider = aiTranslation.provider
          generatedMemoryValues.push({
            ...memoryCandidate(field, language),
            provider: aiTranslation.provider,
            translatedText: aiTranslation.text,
          })
        } else {
          fieldsNeedingMachineTranslation.push(field)
        }
      }

      if (!fieldsNeedingMachineTranslation.length) continue

      try {
        serviceAccountPromise ||= resolveSproochliServiceAccount()
        const account = await serviceAccountPromise
        const translated = await translateSproochliTextBatch(account, {
          sourceLanguage,
          targetLanguage: language,
          texts: fieldsNeedingMachineTranslation.map((field) => field.sourceText),
        })

        fieldsNeedingMachineTranslation.forEach((field, index) => {
          const translatedText = normalizeSproochliText(translated[index])
          const responseField = responseFieldById.get(field.id)
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

          if (translation) {
            translation.text = translatedText
            translation.provider = 'google-cloud-translation'
            generatedMemoryValues.push({
              ...memoryCandidate(field, language),
              provider: translation.provider,
              translatedText,
            })
          }
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        fieldsNeedingMachineTranslation.forEach((field) => {
          failures.push({ field_id: field.id, language, message })
        })
      }
    }
  }

  if (generatedMemoryValues.length) {
    try {
      memoryWrites = await writeSproochliTranslationMemory(generatedMemoryValues)
    } catch (error) {
      memoryStatus = 'degraded'
      console.warn(
        '[sproochli] Translation-memory write unavailable; returning generated translations.',
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  return {
    ok: true,
    provider: 'sproochli',
    source_language: sourceLanguage,
    target_languages: targetLanguages,
    glossary_version: glossaryVersion,
    translation_memory: {
      status: memoryStatus,
      hits: memoryHits.size,
      writes: memoryWrites,
    },
    fields: responseFields,
    failures,
  }
})
