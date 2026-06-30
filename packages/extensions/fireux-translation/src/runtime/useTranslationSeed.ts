import { FIREUX_CORE_LANGUAGE_CODES } from './languages'
import { useTranslate } from './useTranslate'

const DEFAULT_SOURCE_LANGUAGE = 'en'
const DEFAULT_TARGET_LANGUAGE_CODES = FIREUX_CORE_LANGUAGE_CODES

export type TranslationSeedInput = {
  text: string
  sourceLanguage?: string
  languageCodes?: string[]
  existingText?: unknown
  translate?: boolean
}

export type TranslationSeedResult = {
  sourceLanguage: string
  text: Record<string, string>
  failedLanguages: string[]
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) =>
  normalizeString(value).replace(/_/g, '-')

const normalizeLanguageCodes = (values: unknown) => {
  if (!Array.isArray(values)) return []

  const seen = new Set<string>()
  const codes: string[] = []
  for (const value of values) {
    const code = normalizeLanguageCode(value)
    if (!code || seen.has(code)) continue
    seen.add(code)
    codes.push(code)
  }

  return codes
}

const normalizeTextMap = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const text: Record<string, string> = {}
  for (const [language, entry] of Object.entries(value as Record<string, unknown>)) {
    const code = normalizeLanguageCode(language)
    const copy = normalizeString(entry)
    if (code && copy) text[code] = copy
  }

  return text
}

const resolveTargetLanguages = (languageCodes?: string[]) => {
  const configured = normalizeLanguageCodes(languageCodes)
  return configured.length ? configured : DEFAULT_TARGET_LANGUAGE_CODES
}

export function useTranslationSeed() {
  const { translate } = useTranslate()

  const seedTranslations = async (
    input: TranslationSeedInput
  ): Promise<TranslationSeedResult> => {
    const sourceText = normalizeString(input.text)
    if (!sourceText) throw new Error('Translation seed text is required')

    const sourceLanguage =
      normalizeLanguageCode(input.sourceLanguage) || DEFAULT_SOURCE_LANGUAGE
    const targetLanguages = resolveTargetLanguages(input.languageCodes)
    const text = normalizeTextMap(input.existingText)
    const failedLanguages: string[] = []

    // Source text is canonical for its language; existing target translations are preserved.
    // Failed target languages are reported without blocking the rest of the seed.
    text[sourceLanguage] = sourceText

    if (input.translate !== false) {
      await Promise.all(
        targetLanguages.map(async (language) => {
          if (language === sourceLanguage || text[language]) return

          try {
            const result = await translate({
              text: sourceText,
              from: sourceLanguage,
              to: language,
            })
            const translated = normalizeString(result.text)
            if (!translated) {
              failedLanguages.push(language)
              return
            }

            text[language] = translated
          } catch {
            failedLanguages.push(language)
          }
        })
      )
    }

    return {
      sourceLanguage,
      text,
      failedLanguages,
    }
  }

  return { seedTranslations }
}
