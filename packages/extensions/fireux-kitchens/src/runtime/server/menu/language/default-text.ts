const text = (value: unknown) => String(value ?? '').trim()

const translatedScriptPattern =
  /[\u0590-\u05ff\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\u3040-\u30ff\u3400-\u9fff]/
const latinPattern = /[A-Za-zÀ-ÖØ-öø-ÿ]/

const hasTranslatedScript = (value: string) => translatedScriptPattern.test(value)
const hasLatin = (value: string) => latinPattern.test(value)

function stripTranslatedParentheticals(value: string) {
  if (!hasLatin(value)) return value

  return value
    .replace(/\s*[\[(][^\])]*(?:[\u0590-\u05ff\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\u3040-\u30ff\u3400-\u9fff])[^\])]*[\])]/g, '')
    .trim()
}

export function defaultMenuLanguageText(value: unknown) {
  const source = stripTranslatedParentheticals(text(value))
  if (!source.includes('/')) return source

  const parts = source
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length < 2) return source

  const hasLatinPart = parts.some(hasLatin)
  const hasTranslatedPart = parts.some(hasTranslatedScript)
  if (!hasLatinPart || !hasTranslatedPart) return source

  const defaultParts = parts.filter((part) => hasLatin(part) && !hasTranslatedScript(part))
  return defaultParts.length ? defaultParts.join(' / ') : parts.find(hasLatin) || parts[0] || ''
}
