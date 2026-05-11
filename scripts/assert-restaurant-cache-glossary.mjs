#!/usr/bin/env node

import { readFile } from 'node:fs/promises'

const seed = JSON.parse(
  await readFile('scripts/data/restaurant-translation-glossary.seed.json', 'utf8')
)
const entries = seed.entries || []

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s*[/|]\s*/g, ' / ')
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s/|:;,.–—-]+|[\s/|:;,.–—-]+$/g, '')
}

function getSeedTranslation(sourceText, targetLanguage) {
  const key = normalize(sourceText)
  const match = entries.find((entry) => {
    const values = [
      entry.source_text,
      ...(Array.isArray(entry.aliases) ? entry.aliases : []),
      ...Object.values(entry.translations || {}),
    ]
    return values.some((value) => normalize(value) === key)
  })

  return String(match?.translations?.[targetLanguage] ?? '').trim()
}

const cases = [
  ['Hauptkarte', 'en', 'Main Menu'],
  ['Main Menu', 'it', 'Menù principale'],
  ['Speisekarte', 'en', 'Menu'],
  ['Starters', 'it', 'Antipasti'],
  ['Side Dishes', 'it', 'Contorni'],
  ['Peperoni', 'en', 'bell pepper'],
  ['grüner Pfeffer', 'en', 'green peppercorn'],
  ['Rahmsauce', 'en', 'cream sauce'],
  ['Rindsentrecôte', 'en', 'beef entrecôte'],
  ['Parmaschinken', 'it', 'prosciutto di Parma'],
  ['Heisser Stein', 'en', 'Hot Stone'],
  ['Spiess', 'it', 'Spiedino'],
]

for (const [sourceText, targetLanguage, expected] of cases) {
  const actual = getSeedTranslation(sourceText, targetLanguage)
  if (actual !== expected) {
    console.error('[restaurant-cache-glossary] assertion failed', {
      sourceText,
      targetLanguage,
      expected,
      actual,
    })
    process.exit(1)
  }
}

console.log('[restaurant-cache-glossary] assertions passed', { cases: cases.length })
