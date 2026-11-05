import assert from 'node:assert/strict'
import test from 'node:test'
import { seedSproochliText } from '../runtime/utils/translation-seed.ts'

test('source seeding preserves authored translations and does not mutate its input', () => {
  const existingText = { en: 'Old source', de: 'Teig', fr: 'Pâte' }
  const input = { text: '  Dough  ', existingText }
  assert.deepEqual(seedSproochliText(input), {
    sourceLanguage: 'en',
    text: { en: 'Dough', de: 'Teig', fr: 'Pâte' },
  })
  assert.deepEqual(existingText, { en: 'Old source', de: 'Teig', fr: 'Pâte' })
  assert.equal(input.text, '  Dough  ')
})

test('explicit source locales and existing map keys retain their normalized identities', () => {
  assert.deepEqual(
    seedSproochliText({
      text: 'Grüezi',
      sourceLanguage: ' de_CH ',
      existingText: { ' fr_CH ': ' Bonjour ', '': 'Ignored', it: '  ' },
    }),
    {
      sourceLanguage: 'de-CH',
      text: { 'fr-CH': 'Bonjour', 'de-CH': 'Grüezi' },
    }
  )
})

test('empty source text is rejected and malformed maps do not become translations', () => {
  assert.throws(() => seedSproochliText({ text: '  ' }), /text is required/)
  for (const existingText of [null, undefined, [], 'wrong']) {
    assert.deepEqual(seedSproochliText({ text: 'Soup', existingText }), {
      sourceLanguage: 'en',
      text: { en: 'Soup' },
    })
  }
})

test('source seeding is synchronous and makes no network request', (t) => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', () => {
    calls++
    throw new Error('No provider expected')
  })
  const result = seedSproochliText({
    text: 'Soup',
    existingText: { de: 'Suppe' },
  })
  assert.equal(typeof result.then, 'undefined')
  assert.deepEqual(result.text, { en: 'Soup', de: 'Suppe' })
  assert.equal(calls, 0)
})
