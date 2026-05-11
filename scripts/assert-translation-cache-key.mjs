#!/usr/bin/env node

import { createHash } from 'node:crypto'

const normalizeString = (value) => String(value ?? '').trim()
const normalizeLanguageCode = (value) => normalizeString(value).replace(/_/g, '-')
const normalizeDomain = (value) =>
  normalizeString(value).toLowerCase().replace(/[^a-z0-9_-]+/g, '_') || 'general'

function makeTranslationCacheKey(input) {
  const domain = normalizeDomain(input.domain)
  const glossaryVersion = normalizeDomain(input.glossaryVersion || 'restaurant_menu_v1')
  const sourceLanguage = normalizeLanguageCode(input.sourceLanguage)
  const targetLanguage = normalizeLanguageCode(input.targetLanguage)
  const sourceText = normalizeString(input.sourceText)
  const sourceHash = createHash('sha256')
    .update([domain, glossaryVersion, sourceLanguage, targetLanguage, sourceText].join('\n'), 'utf8')
    .digest('hex')

  if (!sourceText) return ''
  if (!sourceLanguage || !targetLanguage || sourceLanguage === targetLanguage) return ''

  return `${domain}__${glossaryVersion}__${sourceLanguage}__${targetLanguage}__${sourceHash.slice(0, 40)}`
}

const base = {
  domain: 'restaurant_menu',
  sourceLanguage: 'en',
  targetLanguage: 'es',
  sourceText: 'Tomato sauce, mozzarella, oregano',
}

const first = makeTranslationCacheKey(base)
const second = makeTranslationCacheKey({ ...base })
const differentLanguage = makeTranslationCacheKey({ ...base, targetLanguage: 'pt' })
const differentGlossary = makeTranslationCacheKey({ ...base, glossaryVersion: 'restaurant_menu_v2' })
const emptyText = makeTranslationCacheKey({ ...base, sourceText: '' })
const sameLanguage = makeTranslationCacheKey({ ...base, targetLanguage: 'en' })

const failures = []
if (!first) failures.push('base key should exist')
if (first !== second) failures.push('same input should produce the same key')
if (first === differentLanguage) failures.push('different target language should produce a different key')
if (first === differentGlossary) failures.push('different glossary version should produce a different key')
if (emptyText) failures.push('empty text should not produce a key')
if (sameLanguage) failures.push('same source/target language should not produce a key')

if (failures.length) {
  console.error('[translation-cache-key] assertions failed', failures)
  process.exit(1)
}

console.log('[translation-cache-key] assertions passed', {
  key: first,
})
