export type SproochliCopyReviewStatus =
  | 'ai_draft'
  | 'in_review'
  | 'approved'
  | 'retired'

export type SproochliCopyTargetLanguage = 'gsw' | 'de'
export type SproochliReviewedCopyLanguage =
  | 'en'
  | SproochliCopyTargetLanguage

export type SproochliCopyProvenance = {
  kind: 'human' | 'ai'
  provider?: string
  generated_at?: string
  reviewed_by?: string
  reviewed_at?: string
}

export type SproochliCopyProfile<
  Language extends SproochliCopyTargetLanguage =
    SproochliCopyTargetLanguage,
> = {
  id: string
  language_code: Language
  locale: string
  region: string
  style: string
  glossary: Record<string, string>
}

export type SproochliDialectProfile = SproochliCopyProfile<'gsw'>

export type SproochliCopyTranslation = {
  text: string
  profile_id: string
  status: SproochliCopyReviewStatus
  provenance: SproochliCopyProvenance
}

export type SproochliCopyTranslations = Partial<{
  [Language in SproochliCopyTargetLanguage]: SproochliCopyTranslation
}>

export type SproochliCopyProfiles = Partial<{
  [Language in SproochliCopyTargetLanguage]:
    SproochliCopyProfile<Language>
}>

export type SproochliCopyEntry = {
  key: string
  source_language: 'en'
  source_text: string
  translations: SproochliCopyTranslations
}

export type SproochliCopyPack<
  Entries extends Record<string, SproochliCopyEntry> =
    Record<string, SproochliCopyEntry>,
  Profiles extends SproochliCopyProfiles = SproochliCopyProfiles,
> = {
  id: string
  profiles: Profiles
  entries: Entries
}

export type SproochliCopyVariables = Record<string, string | number>

const SPROOCHLI_COPY_TARGET_LANGUAGES = ['gsw', 'de'] as const
const SPROOCHLI_COPY_REVIEW_STATUSES = [
  'ai_draft',
  'in_review',
  'approved',
  'retired',
] as const

const clean = (value: unknown) => String(value ?? '').trim()
const copyTokens = (value: string) =>
  [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)]
    .map(match => match[1]!)
    .sort()

function isCopyTargetLanguage(
  value: unknown
): value is SproochliCopyTargetLanguage {
  return SPROOCHLI_COPY_TARGET_LANGUAGES.includes(
    value as SproochliCopyTargetLanguage
  )
}

function isCopyReviewStatus(
  value: unknown
): value is SproochliCopyReviewStatus {
  return SPROOCHLI_COPY_REVIEW_STATUSES.includes(
    value as SproochliCopyReviewStatus
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function sameTokens(sourceText: string, targetText: string) {
  const sourceTokens = copyTokens(sourceText)
  const targetTokens = copyTokens(targetText)
  return (
    sourceTokens.length === targetTokens.length &&
    sourceTokens.every((token, index) => token === targetTokens[index])
  )
}

export function defineSproochliCopyProfile<
  const Profile extends SproochliCopyProfile,
>(profile: Profile): Profile {
  const validGlossary =
    isRecord(profile.glossary) &&
    Object.entries(profile.glossary).every(
      ([source, translation]) =>
        clean(source) &&
        typeof translation === 'string' &&
        Boolean(clean(translation))
    )

  if (
    !clean(profile.id) ||
    !isCopyTargetLanguage(profile.language_code) ||
    !clean(profile.locale) ||
    !clean(profile.region) ||
    !clean(profile.style) ||
    !validGlossary
  ) {
    throw new Error('[fireux-sproochli] A complete copy profile is required.')
  }
  return profile
}

export function defineSproochliDialectProfile<
  const Profile extends SproochliDialectProfile,
>(profile: Profile): Profile {
  if (profile.language_code !== 'gsw') {
    throw new Error(
      '[fireux-sproochli] A complete gsw dialect profile is required.'
    )
  }
  return defineSproochliCopyProfile(profile)
}

export function defineSproochliCopyPack<
  const Entries extends Record<string, SproochliCopyEntry>,
  const Profiles extends SproochliCopyProfiles,
>(
  pack: SproochliCopyPack<Entries, Profiles>
): SproochliCopyPack<Entries, Profiles> {
  if (!clean(pack.id)) {
    throw new Error('[fireux-sproochli] Copy pack id is required.')
  }

  const profiles = isRecord(pack.profiles)
    ? pack.profiles as Record<string, SproochliCopyProfile>
    : {}
  const profileEntries = Object.entries(profiles)
  if (!profileEntries.length) {
    throw new Error('[fireux-sproochli] Copy pack profiles are required.')
  }

  const profileIds = new Set<string>()
  for (const [language, profile] of profileEntries) {
    if (
      !isCopyTargetLanguage(language) ||
      !isRecord(profile) ||
      profile.language_code !== language
    ) {
      throw new Error(
        `[fireux-sproochli] Copy profile language mismatch: ${language}.`
      )
    }
    defineSproochliCopyProfile(profile)
    if (profileIds.has(profile.id)) {
      throw new Error(
        `[fireux-sproochli] Copy profile id must be unique: ${profile.id}.`
      )
    }
    profileIds.add(profile.id)
  }

  for (const [key, entry] of Object.entries(pack.entries)) {
    if (
      entry.key !== key ||
      entry.source_language !== 'en' ||
      !clean(entry.source_text) ||
      !isRecord(entry.translations) ||
      !Object.keys(entry.translations).length
    ) {
      throw new Error(`[fireux-sproochli] Invalid copy entry: ${key}.`)
    }

    for (const [language, translation] of Object.entries(
      entry.translations
    )) {
      if (!isCopyTargetLanguage(language) || !isRecord(translation)) {
        throw new Error(
          `[fireux-sproochli] Invalid ${language} translation: ${key}.`
        )
      }

      const profile = profiles[language]
      const provenance = translation.provenance
      if (
        !profile ||
        profile.language_code !== language ||
        translation.profile_id !== profile.id ||
        !clean(translation.text) ||
        !sameTokens(entry.source_text, clean(translation.text)) ||
        !isCopyReviewStatus(translation.status) ||
        !isRecord(provenance) ||
        (provenance.kind !== 'human' && provenance.kind !== 'ai') ||
        (
          translation.status === 'approved' &&
          !clean(provenance.reviewed_by)
        )
      ) {
        throw new Error(
          `[fireux-sproochli] Invalid ${language} translation: ${key}.`
        )
      }
    }
  }
  return pack
}

export function formatSproochliCopy(
  value: string,
  variables: SproochliCopyVariables = {}
): string {
  const missing = copyTokens(value).filter(token => !(token in variables))
  if (missing.length) {
    throw new Error(
      `[fireux-sproochli] Missing copy variables: ${[...new Set(missing)].join(', ')}.`
    )
  }

  return value.replace(
    /\{([A-Za-z][A-Za-z0-9_]*)\}/g,
    (_, token: string) => String(variables[token])
  )
}

export function resolveApprovedSproochliCopy<
  Entries extends Record<string, SproochliCopyEntry>,
  Profiles extends SproochliCopyProfiles,
  Key extends Extract<keyof Entries, string>,
>(
  pack: SproochliCopyPack<Entries, Profiles>,
  key: Key,
  language: SproochliReviewedCopyLanguage = 'gsw',
  variables: SproochliCopyVariables = {}
): string {
  const entry = pack.entries[key]
  if (
    !entry ||
    entry.key !== key ||
    entry.source_language !== 'en' ||
    !clean(entry.source_text)
  ) {
    throw new Error(`[fireux-sproochli] Public copy is invalid: ${key}.`)
  }

  if (language === 'en') {
    return formatSproochliCopy(entry.source_text, variables)
  }
  if (!isCopyTargetLanguage(language)) {
    throw new Error(
      `[fireux-sproochli] Unsupported public copy language: ${language}.`
    )
  }

  const profile = pack.profiles[language]
  const translation = entry.translations[language]
  if (
    !profile ||
    profile.language_code !== language ||
    !translation ||
    translation.profile_id !== profile.id ||
    translation.status !== 'approved' ||
    !clean(translation.provenance.reviewed_by) ||
    !clean(translation.text) ||
    !sameTokens(entry.source_text, translation.text)
  ) {
    throw new Error(
      `[fireux-sproochli] Public copy is not approved for ${language}: ${key}.`
    )
  }

  return formatSproochliCopy(translation.text, variables)
}
