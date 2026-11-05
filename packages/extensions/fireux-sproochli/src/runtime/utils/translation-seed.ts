export type SproochliTextSeedInput = {
  text: string
  sourceLanguage?: string
  existingText?: unknown
}

export type SproochliTextSeed = {
  sourceLanguage: string
  text: Record<string, string>
}

const clean = (value: unknown) => String(value ?? '').trim()
const languageCode = (value: unknown) => clean(value).replace(/_/g, '-')

/** Combine canonical source text with authored translations, without generation. */
export function seedSproochliText(
  input: SproochliTextSeedInput
): SproochliTextSeed {
  const sourceText = clean(input.text)
  if (!sourceText) throw new Error('Translation seed text is required')

  const sourceLanguage = languageCode(input.sourceLanguage) || 'en'
  const text: Record<string, string> = {}
  if (
    input.existingText &&
    typeof input.existingText === 'object' &&
    !Array.isArray(input.existingText)
  ) {
    for (const [language, value] of Object.entries(input.existingText)) {
      const code = languageCode(language)
      const copy = clean(value)
      if (code && copy) text[code] = copy
    }
  }
  text[sourceLanguage] = sourceText
  return { sourceLanguage, text }
}
