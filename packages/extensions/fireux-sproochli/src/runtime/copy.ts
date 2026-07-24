export type SproochliCopyReviewStatus =
  | 'ai_draft'
  | 'in_review'
  | 'approved'
  | 'retired'

export type SproochliReviewedCopyLanguage = 'en' | 'gsw'

export type SproochliCopyProvenance = {
  kind: 'human' | 'ai'
  provider?: string
  generated_at?: string
  reviewed_by?: string
  reviewed_at?: string
}

export type SproochliDialectProfile = {
  id: string
  language_code: 'gsw'
  locale: string
  region: string
  style: string
  glossary: Record<string, string>
}

export type SproochliCopyEntry = {
  key: string
  source_language: 'en'
  source_text: string
  target_language: 'gsw'
  target_text: string
  profile_id: string
  status: SproochliCopyReviewStatus
  provenance: SproochliCopyProvenance
}

export type SproochliCopyPack<
  Entries extends Record<string, SproochliCopyEntry> =
    Record<string, SproochliCopyEntry>,
> = {
  id: string
  profile: SproochliDialectProfile
  entries: Entries
}

export type SproochliCopyVariables = Record<string, string | number>

const clean = (value: unknown) => String(value ?? '').trim()
const copyTokens = (value: string) =>
  [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)]
    .map(match => match[1]!)
    .sort()

function sameTokens(sourceText: string, targetText: string) {
  const sourceTokens = copyTokens(sourceText)
  const targetTokens = copyTokens(targetText)
  return (
    sourceTokens.length === targetTokens.length &&
    sourceTokens.every((token, index) => token === targetTokens[index])
  )
}

export function defineSproochliDialectProfile(
  profile: SproochliDialectProfile
): SproochliDialectProfile {
  if (
    !clean(profile.id) ||
    profile.language_code !== 'gsw' ||
    !clean(profile.locale) ||
    !clean(profile.region) ||
    !clean(profile.style)
  ) {
    throw new Error('[fireux-sproochli] A complete gsw dialect profile is required.')
  }
  return profile
}

export function defineSproochliCopyPack<
  const Entries extends Record<string, SproochliCopyEntry>,
>(
  pack: SproochliCopyPack<Entries>
): SproochliCopyPack<Entries> {
  if (!clean(pack.id)) throw new Error('[fireux-sproochli] Copy pack id is required.')

  for (const [key, entry] of Object.entries(pack.entries)) {
    if (
      entry.key !== key ||
      entry.source_language !== 'en' ||
      entry.target_language !== 'gsw' ||
      entry.profile_id !== pack.profile.id ||
      !clean(entry.source_text) ||
      !clean(entry.target_text) ||
      !sameTokens(entry.source_text, entry.target_text)
    ) {
      throw new Error(`[fireux-sproochli] Invalid copy entry: ${key}.`)
    }
    if (entry.status === 'approved' && !clean(entry.provenance.reviewed_by)) {
      throw new Error(`[fireux-sproochli] Approved copy requires a reviewer: ${key}.`)
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
  Key extends Extract<keyof Entries, string>,
>(
  pack: SproochliCopyPack<Entries>,
  key: Key,
  language: SproochliReviewedCopyLanguage = 'gsw',
  variables: SproochliCopyVariables = {}
): string {
  const entry = pack.entries[key]
  if (!entry || entry.status !== 'approved') {
    throw new Error(`[fireux-sproochli] Public copy is not approved: ${key}.`)
  }

  return formatSproochliCopy(
    language === 'en' ? entry.source_text : entry.target_text,
    variables
  )
}
