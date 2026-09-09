import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(
  new URL(
    '../../../../fireux-places/src/runtime/place/utils/place-onboarding-completion.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/import[\s\S]*?from ['"][^'"]+['"]\n/g, '')
  .replace(/^export /gm, '')
const completePlaceDraft = compileFunction(
  `${stripTypeScriptTypes(source)}\nreturn completePlaceDraft`,
  ['canonicalPlaceId', 'text', 'placeOnboardingErrorMessage']
)(
  (id: string) => id,
  (value: unknown) => String(value || '').trim(),
  (error: Error) => error.message
)

test('required-only onboarding sends defaults and never persists optional branding or enrichment', async () => {
  const writes: unknown[] = []
  const result = await completePlaceDraft({
    draft: {
      id: 'verified-place',
      name: 'Venue',
      short_name: 'Suggested',
      tagline: 'Suggested',
      about: 'Suggested',
      tags: ['food'],
      logo_image: 'https://example.org/logo.png',
    },
    requiredOnly: true,
    needsEnrichment: true,
    currencyCode: 'CHF',
    timezone: 'Europe/Zurich',
    brandPalette: { primary: '#112233' },
    imageFile: {},
    coverFile: {},
    completePlaceOnboarding: async (input: unknown) => {
      writes.push(input)
    },
    ensurePlaceExists: async () => {
      throw new Error('Unexpected ensure')
    },
    uploadImage: async () => {
      throw new Error('Optional image must not upload')
    },
  })
  assert.deepEqual(writes, [
    {
      id: 'verified-place',
      default_currency_code: 'CHF',
      timezone: 'Europe/Zurich',
    },
  ])
  assert.equal(result.id, 'verified-place')
})

test('a complete existing location is reused with no optional write', async () => {
  const ids: string[] = []
  await completePlaceDraft({
    draft: { id: 'existing', name: 'Venue' },
    requiredOnly: true,
    needsEnrichment: false,
    currencyCode: 'CHF',
    timezone: 'Europe/Zurich',
    brandPalette: {},
    imageFile: null,
    coverFile: null,
    ensurePlaceExists: async ({ id }: { id: string }) => {
      ids.push(id)
      return true
    },
    completePlaceOnboarding: async () => {
      throw new Error('No configuration should be written')
    },
    uploadImage: async () => {
      throw new Error('No image should be uploaded')
    },
  })
  assert.deepEqual(ids, ['existing'])
})
