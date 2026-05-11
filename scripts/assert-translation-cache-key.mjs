#!/usr/bin/env node

import { createHash } from 'node:crypto'

const normalizeString = (value) => String(value ?? '').trim()
const normalizeLanguageCode = (value) => normalizeString(value).replace(/_/g, '-')
const normalizeDomain = (value) =>
  normalizeString(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '_') || 'general'

function makeMenuTranslationCacheKey(input) {
  const fieldId = normalizeString(input.fieldId)
  const targetLanguage = normalizeLanguageCode(input.targetLanguage)
  const fieldHash = createHash('sha256')
    .update([fieldId, targetLanguage].join('\n'), 'utf8')
    .digest('hex')

  if (!fieldId || !targetLanguage) return ''

  return `${targetLanguage}__${fieldHash.slice(0, 40)}`
}

function makeTranslationGlossaryKey(input) {
  const domain = normalizeDomain(input.domain)
  const sourceLanguage = normalizeLanguageCode(input.sourceLanguage)
  const sourceText = normalizeString(input.sourceText)
  const sourceHash = createHash('sha256')
    .update([domain, sourceLanguage, sourceText].join('\n'), 'utf8')
    .digest('hex')

  if (!sourceText) return ''
  if (!sourceLanguage) return ''

  return `${domain}__${sourceLanguage}__${sourceHash.slice(0, 40)}`
}

const menuCacheBase = {
  fieldId: 'dish:margherita:description',
  targetLanguage: 'es',
}
const glossaryBase = {
  domain: 'restaurant_menu',
  sourceLanguage: 'de',
  sourceText: 'Peperoni',
}

const first = makeMenuTranslationCacheKey(menuCacheBase)
const second = makeMenuTranslationCacheKey({ ...menuCacheBase })
const differentLanguage = makeMenuTranslationCacheKey({ ...menuCacheBase, targetLanguage: 'pt' })
const emptyField = makeMenuTranslationCacheKey({ ...menuCacheBase, fieldId: '' })
const glossaryFirst = makeTranslationGlossaryKey(glossaryBase)
const glossarySecond = makeTranslationGlossaryKey({ ...glossaryBase })
const differentGlossaryText = makeTranslationGlossaryKey({ ...glossaryBase, sourceText: 'Rahmsauce' })
const emptyGlossaryText = makeTranslationGlossaryKey({ ...glossaryBase, sourceText: '' })

const failures = []
if (!first) failures.push('base key should exist')
if (first !== second) failures.push('same menu cache input should produce the same key')
if (first === differentLanguage) failures.push('different target language should produce a different key')
if (emptyField) failures.push('empty menu field should not produce a cache key')
if (!glossaryFirst) failures.push('glossary key should exist')
if (glossaryFirst !== glossarySecond) failures.push('same glossary input should produce the same key')
if (glossaryFirst === differentGlossaryText) failures.push('different glossary source text should produce a different key')
if (emptyGlossaryText) failures.push('empty glossary text should not produce a key')

if (failures.length) {
  console.error('[translation-cache-key] assertions failed', failures)
  process.exit(1)
}

console.log('[translation-cache-key] assertions passed', {
  menuCacheKey: first,
  glossaryKey: glossaryFirst,
})
