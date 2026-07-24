import {
  SPROOCHLI_LANGUAGE_OPTIONS,
  normalizeSproochliLanguage,
  type SproochliLanguageCode,
  type SproochliLanguageOption,
} from 'fireux-sproochli/runtime/sproochli'

export const INTERLAKEN_SITE_DEFAULT_LANGUAGE = 'gsw' as const

export const INTERLAKEN_SITE_LANGUAGE_CODES = [
  'gsw',
  'en',
] as const satisfies readonly Exclude<SproochliLanguageCode, ''>[]

export type InterlakenSiteLanguage =
  (typeof INTERLAKEN_SITE_LANGUAGE_CODES)[number]

const languageCodeSet = new Set<string>(INTERLAKEN_SITE_LANGUAGE_CODES)
const catalogueByCode = new Map(
  SPROOCHLI_LANGUAGE_OPTIONS.map(option => [option.code, option] as const)
)

export const INTERLAKEN_SITE_LANGUAGE_OPTIONS: SproochliLanguageOption[] =
  INTERLAKEN_SITE_LANGUAGE_CODES.map((code) => {
    const option = catalogueByCode.get(code)
    if (!option) {
      throw new Error(
        `[interlaken-essen] Missing Sproochli language option: ${code}.`
      )
    }

    return {
      ...option,
      source: 'attached',
    }
  })

export function normalizeInterlakenSiteLanguage(
  value: unknown
): InterlakenSiteLanguage | '' {
  const candidate = Array.isArray(value) ? value[0] : value
  const language = normalizeSproochliLanguage(candidate)

  return languageCodeSet.has(language)
    ? language as InterlakenSiteLanguage
    : ''
}

export function resolveInterlakenSiteLanguage(
  value: unknown
): InterlakenSiteLanguage {
  return (
    normalizeInterlakenSiteLanguage(value) ||
    INTERLAKEN_SITE_DEFAULT_LANGUAGE
  )
}
