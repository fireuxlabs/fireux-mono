import {
  normalizeSproochliLanguage,
  type SproochliLanguageCode,
} from './composables/fireux/sproochli/publicLanguage.ts'

type SproochliSupportedLanguage = Exclude<SproochliLanguageCode, ''>

export type SproochliDefaultLanguage =
  | SproochliSupportedLanguage
  | 'mixed'

export type SproochliAttachmentConfig = {
  enabled: boolean
  default_language?: SproochliDefaultLanguage
  profile_id?: string
  requested_languages: SproochliSupportedLanguage[]
}

const text = (value: unknown) => String(value ?? '').trim()

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export function normalizeSproochliDefaultLanguage(
  value: unknown
): SproochliDefaultLanguage | undefined {
  if (text(value).toLowerCase() === 'mixed') return 'mixed'

  return normalizeSproochliLanguage(value) || undefined
}

export function readSproochliAttachmentConfig(
  value: unknown
): SproochliAttachmentConfig {
  const source = record(value)
  const defaultLanguage = normalizeSproochliDefaultLanguage(
    source.default_language
  )
  const profileId = text(source.profile_id)
  const requestedLanguages = Array.isArray(source.requested_languages)
    ? source.requested_languages
      .map(language => normalizeSproochliLanguage(language))
      .filter((language): language is SproochliSupportedLanguage =>
        Boolean(language)
      )
    : []

  return {
    enabled: source.enabled === true,
    ...(defaultLanguage ? { default_language: defaultLanguage } : {}),
    ...(profileId ? { profile_id: profileId } : {}),
    requested_languages: [...new Set(requestedLanguages)],
  }
}
