import { createError, defineEventHandler, readBody } from 'h3'
import {
  SPROOCHLI_LANGUAGE_OPTIONS,
} from 'fireux-sproochli/runtime/composables/fireux/sproochli/publicLanguage'
import {
  SPROOCHLI_HOST_DATABASE_ID,
  type SproochliHostTarget,
} from 'fireux-sproochli/runtime/host'
import type {
  SproochliMenuSource,
  SproochliMenuTranslationField,
} from 'fireux-sproochli/runtime/sproochli'
import {
  setSproochliPrivateToolHeaders,
} from '../../../utils/sproochliTools'
import {
  assertSproochliMenuProviderAccess,
} from '../../../utils/sproochliMenuProviderAuth'
import {
  normalizeSproochliLanguageCode,
  normalizeSproochliText,
  resolveSproochliServiceAccount,
  translateSproochliTextBatch,
} from '../../../utils/sproochliTranslate'

type MenuResolveBody = {
  fields?: unknown
  host?: unknown
  language?: unknown
  source?: unknown
}

const MAX_FIELDS = 200
const MAX_FIELD_ID_LENGTH = 240
const MAX_SOURCE_TEXT_LENGTH = 4_000
const MAX_TOTAL_SOURCE_TEXT_LENGTH = 40_000
const SUPPORTED_LANGUAGES = new Set<string>(
  SPROOCHLI_LANGUAGE_OPTIONS.map(option => option.code).filter(Boolean)
)

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

function parseFields(value: unknown): SproochliMenuTranslationField[] {
  if (!Array.isArray(value) || !value.length || value.length > MAX_FIELDS) {
    throw createError({
      statusCode: 400,
      statusMessage: `Between 1 and ${MAX_FIELDS} Menu fields are required.`,
    })
  }

  const fields = value.map((entry) => {
    const field = record(entry)
    return {
      id: normalizeSproochliText(field.id),
      sourceText: normalizeSproochliText(field.sourceText),
    }
  })
  if (
    fields.some(field =>
      !field.id ||
      !field.sourceText ||
      field.id.length > MAX_FIELD_ID_LENGTH ||
      field.sourceText.length > MAX_SOURCE_TEXT_LENGTH
    ) ||
    new Set(fields.map(field => field.id)).size !== fields.length ||
    fields.reduce((total, field) => total + field.sourceText.length, 0) >
      MAX_TOTAL_SOURCE_TEXT_LENGTH
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu translation fields are invalid.',
    })
  }
  return fields
}

function parseHost(value: unknown): SproochliHostTarget {
  const host = record(value)
  const appId = normalizeSproochliText(host.appId)
  const firebaseProjectId = normalizeSproochliText(host.firebaseProjectId)
  const databaseId = normalizeSproochliText(host.databaseId)
  if (
    !appId ||
    !firebaseProjectId ||
    databaseId !== SPROOCHLI_HOST_DATABASE_ID
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Sproochli host identity is required.',
    })
  }
  return {
    appId,
    firebaseProjectId,
    databaseId: SPROOCHLI_HOST_DATABASE_ID,
  }
}

function parseSource(value: unknown): SproochliMenuSource {
  const source = record(value)
  const result = {
    appId: normalizeSproochliText(source.appId),
    kitchenId: normalizeSproochliText(source.kitchenId),
    menuId: normalizeSproochliText(source.menuId),
  }
  if (!result.appId || !result.kitchenId || !result.menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu source identity is required.',
    })
  }
  return result
}

export default defineEventHandler(async (event) => {
  setSproochliPrivateToolHeaders(event)
  const body = (await readBody(event).catch(() => null)) as
    MenuResolveBody | null
  const host = parseHost(body?.host)
  await assertSproochliMenuProviderAccess(event, host)
  const fields = parseFields(body?.fields)
  const source = parseSource(body?.source)
  const language = normalizeSproochliLanguageCode(body?.language)
  if (!language || !SUPPORTED_LANGUAGES.has(language)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Selected Menu language is not supported.',
    })
  }

  const account = await resolveSproochliServiceAccount()
  const translated = await translateSproochliTextBatch(account, {
    texts: fields.map(field => field.sourceText),
    sourceLanguage: 'auto',
    targetLanguage: language,
  })
  if (
    translated.length !== fields.length ||
    translated.some(value => !value)
  ) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Sproochli returned an incomplete Menu translation.',
    })
  }

  return {
    host,
    language,
    provider: 'google-cloud-translation',
    source,
    translations: Object.fromEntries(
      fields.map((field, index) => [field.id, translated[index]!])
    ),
  }
})
