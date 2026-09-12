import {
  defineSproochliCopyPack,
  defineSproochliCopyProfile,
  defineSproochliDialectProfile,
  resolveApprovedSproochliCopy,
  type SproochliCopyVariables,
  type SproochliReviewedCopyLanguage,
} from 'fireux-sproochli/runtime/sproochli'
import { interlakenAccountCopyEntries } from './sproochli-copy-account.ts'
import {
  INTERLAKEN_DIALECT_PROFILE_ID,
  INTERLAKEN_STANDARD_GERMAN_PROFILE_ID,
} from './sproochli-copy-entry.ts'
import { interlakenProfileCopyEntries } from './sproochli-copy-profile.ts'
import { interlakenMarketplaceCopyEntries } from './sproochli-copy-marketplace.ts'
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

export const interlakenStandardGermanProfile =
  defineSproochliCopyProfile({
    id: INTERLAKEN_STANDARD_GERMAN_PROFILE_ID,
    language_code: 'de',
    locale: 'de-CH',
    region: 'Switzerland, with Berner Oberland context',
    style:
      'Clear, warm and professional Swiss Standard German. Use ss rather than ß and address readers formally with Sie and Ihr.',
    glossary: {
      buy: 'Kaufen',
      sell: 'Verkaufen',
      feed: 'Neuigkeiten',
      'come and eat': 'Kommen Sie essen',
      'from the region': 'Aus der Region',
    },
  })

export const interlakenCopyPack = defineSproochliCopyPack({
  id: 'interlaken-public-v2',
  profiles: {
    de: interlakenStandardGermanProfile,
    gsw: interlakenDialectProfile,
  },
  entries: {
    ...interlakenPublicCopyEntries,
    ...interlakenProfileCopyEntries,
    ...interlakenAccountCopyEntries,
    ...interlakenMarketplaceCopyEntries,
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
