import type { SproochliCopyEntry } from 'fireux-sproochli/runtime/sproochli'

export const INTERLAKEN_DIALECT_PROFILE_ID =
  'interlaken-berner-oberland-v1'

type InterlakenBilingualCopy = {
  en: string
  gsw: string
}

type InterlakenCopyEntries<
  Entries extends Record<string, InterlakenBilingualCopy>,
> = {
  [Key in keyof Entries]: SproochliCopyEntry & {
    key: Extract<Key, string>
  }
}

export function defineInterlakenCopyEntries<
  const Entries extends Record<string, InterlakenBilingualCopy>,
>(entries: Entries): InterlakenCopyEntries<Entries> {
  return Object.fromEntries(
    Object.entries(entries).map(([key, copy]) => [
      key,
      {
        key,
        source_language: 'en',
        source_text: copy.en,
        target_language: 'gsw',
        target_text: copy.gsw,
        profile_id: INTERLAKEN_DIALECT_PROFILE_ID,
        status: 'approved',
        provenance: {
          kind: 'human',
          reviewed_by: 'interlaken-essen',
          reviewed_at: '2026-07-24',
        },
      } satisfies SproochliCopyEntry,
    ])
  ) as InterlakenCopyEntries<Entries>
}
