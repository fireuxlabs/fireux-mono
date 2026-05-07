export type FireuxLanguageTier = 'core' | 'optional'

export type FireuxLanguageOption = {
  code: string
  label: string
  tier: FireuxLanguageTier
}

export const FIREUX_CORE_LANGUAGE_OPTIONS: FireuxLanguageOption[] = [
  { code: 'en', label: 'English', tier: 'core' },
  { code: 'de', label: 'German', tier: 'core' },
  { code: 'fr', label: 'French', tier: 'core' },
  { code: 'it', label: 'Italian', tier: 'core' },
  { code: 'es', label: 'Spanish', tier: 'core' },
  { code: 'pt', label: 'Portuguese', tier: 'core' },
  { code: 'ar', label: 'Arabic', tier: 'core' },
  { code: 'zh-CN', label: 'Simplified Chinese', tier: 'core' },
  { code: 'ko', label: 'Korean', tier: 'core' },
  { code: 'ja', label: 'Japanese', tier: 'core' },
]

export const FIREUX_OPTIONAL_LANGUAGE_OPTIONS: FireuxLanguageOption[] = [
  { code: 'hi', label: 'Hindi', tier: 'optional' },
  { code: 'nl', label: 'Dutch', tier: 'optional' },
  { code: 'pl', label: 'Polish', tier: 'optional' },
  { code: 'tr', label: 'Turkish', tier: 'optional' },
  { code: 'th', label: 'Thai', tier: 'optional' },
]

export const FIREUX_LANGUAGE_OPTIONS: FireuxLanguageOption[] = [
  ...FIREUX_CORE_LANGUAGE_OPTIONS,
  ...FIREUX_OPTIONAL_LANGUAGE_OPTIONS,
]
