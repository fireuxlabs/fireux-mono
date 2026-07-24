import {
  defineSproochliCopyPack,
  defineSproochliDialectProfile,
  resolveApprovedSproochliCopy,
  type SproochliCopyVariables,
  type SproochliReviewedCopyLanguage,
} from 'fireux-sproochli/runtime/sproochli'
import { interlakenAccountCopyEntries } from './sproochli-copy-account.ts'
import {
  INTERLAKEN_DIALECT_PROFILE_ID,
} from './sproochli-copy-entry.ts'
import { interlakenOnboardingCopyEntries } from './sproochli-copy-onboarding.ts'
import { interlakenPublicCopyEntries } from './sproochli-copy-public.ts'

export const interlakenDialectProfile = defineSproochliDialectProfile({
  id: INTERLAKEN_DIALECT_PROFILE_ID,
  language_code: 'gsw',
  locale: 'gsw-CH',
  region: 'Berner Oberland, Interlaken and surrounding communities',
  style: 'Readable, neighbourly, direct and unforced; never dialect theatre.',
  glossary: {
    buy: 'Choufe',
    sell: 'Verchoufe',
    feed: 'Futter',
    'come and eat': 'Chum cho esse',
    'from the region': 'Us dr Region',
  },
})

export const interlakenCopyPack = defineSproochliCopyPack({
  id: 'interlaken-public-v1',
  profile: interlakenDialectProfile,
  entries: {
    ...interlakenPublicCopyEntries,
    ...interlakenOnboardingCopyEntries,
    ...interlakenAccountCopyEntries,
  },
})

export type InterlakenCopyKey =
  keyof typeof interlakenCopyPack.entries

export const interlakenCopy = (
  key: InterlakenCopyKey,
  language: SproochliReviewedCopyLanguage = 'gsw',
  variables: SproochliCopyVariables = {}
) =>
  resolveApprovedSproochliCopy(
    interlakenCopyPack,
    key,
    language,
    variables
  )
