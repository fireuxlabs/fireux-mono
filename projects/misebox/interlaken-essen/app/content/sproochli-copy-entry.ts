import type { SproochliCopyEntry } from 'fireux-sproochli/runtime/sproochli'

export const INTERLAKEN_DIALECT_PROFILE_ID =
  'interlaken-berner-oberland-v1'
export const INTERLAKEN_STANDARD_GERMAN_PROFILE_ID =
  'interlaken-swiss-standard-german-v1'

type InterlakenReviewedCopy = {
  de: string
  en: string
  gsw: string
}

type InterlakenCopyEntries<
  Entries extends Record<string, InterlakenReviewedCopy>,
> = {
  [Key in keyof Entries]: SproochliCopyEntry & {
    key: Extract<Key, string>
  }
}

export function defineInterlakenCopyEntries<
  const Entries extends Record<string, InterlakenReviewedCopy>,
>(entries: Entries): InterlakenCopyEntries<Entries> {
  return Object.fromEntries(
    Object.entries(entries).map(([key, copy]) => [
      key,
      {
        key,
        source_language: 'en',
        source_text: copy.en,
        translations: {
          de: {
            text: copy.de,
            profile_id: INTERLAKEN_STANDARD_GERMAN_PROFILE_ID,
            status: 'approved',
            provenance: {
              kind: 'ai',
              provider: 'openai-codex',
              generated_at: '2026-07-25T00:00:00.000Z',
              reviewed_by: 'interlaken-essen',
              reviewed_at: '2026-07-25',
            },
          },
          gsw: {
            text: copy.gsw,
            profile_id: INTERLAKEN_DIALECT_PROFILE_ID,
            status: 'approved',
            provenance: {
              kind: 'human',
              reviewed_by: 'interlaken-essen',
              reviewed_at: '2026-07-24',
            },
          },
        },
      } satisfies SproochliCopyEntry,
    ])
  ) as InterlakenCopyEntries<Entries>
}
