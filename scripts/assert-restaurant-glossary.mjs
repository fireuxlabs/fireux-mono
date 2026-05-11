#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ts from 'typescript'

const glossaryPath = resolve(
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-menu-glossary.ts'
)
const source = await readFile(glossaryPath, 'utf8')
const seed = JSON.parse(
  await readFile('scripts/data/restaurant-translation-glossary.seed.json', 'utf8')
)
const seedEntries = seed.entries || []
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
})
const encoded = Buffer.from(transpiled.outputText).toString('base64')
const { getRestaurantMenuGlossaryNames } = await import(
  `data:text/javascript;base64,${encoded}`
)

const cases = [
  ['Hauptkarte', { de: 'Hauptkarte', en: 'Main Menu', fr: 'Menu principal', it: 'Menù principale' }],
  ['Speisekarte', { de: 'Speisekarte', en: 'Menu', fr: 'Carte', it: 'Menù' }],
  ['Antipasti / Vorspeisen', { de: 'Vorspeisen', en: 'Starters', fr: 'Entrées', it: 'Antipasti' }],
  ['Beilagen', { de: 'Beilagen', en: 'Side Dishes', fr: 'Accompagnements', it: 'Contorni' }],
  ['Gratinato / Gratiniert', { de: 'Gratiniert', en: 'Gratin', fr: 'Gratiné', it: 'Gratinato' }],
  ['PIZZA — FISCH & MEERESFRÜCHTE', {
    de: 'Fisch & Meeresfrüchte',
    en: 'Fish & Seafood',
    fr: 'Poisson & Fruits de mer',
    it: 'Pesce & Frutti di mare',
  }],
  ['HEISSER STEIN / SPIESS', {
    de: 'Heisser Stein / Spiess',
    en: 'Hot Stone / Skewers',
    fr: 'Pierre chaude / Brochettes',
    it: 'Pietra calda / Spiedini',
  }],
]

for (const [input, expected] of cases) {
  const actual = getRestaurantMenuGlossaryNames(input)
  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)

  if (actualJson !== expectedJson) {
    console.error('[glossary] assertion failed', { input, expected, actual })
    process.exit(1)
  }
}

const fieldCases = [
  ['Hauptkarte', { en: 'Main Menu' }],
  ['Peperoni', { en: 'bell pepper', it: 'peperone' }],
  ['grüner Pfeffer', { en: 'green peppercorn', it: 'pepe verde' }],
  ['Rahmsauce', { en: 'cream sauce', it: 'salsa alla panna' }],
  ['Rindsentrecôte', { en: 'beef entrecôte', it: 'entrecôte di manzo' }],
  ['Beilagen', { en: 'Side Dishes' }],
  ['Parmaschinken', { it: 'prosciutto di Parma' }],
  ['Heisser Stein', { en: 'Hot Stone', it: 'Pietra calda' }],
  ['Spiess', { en: 'Skewer', it: 'Spiedino' }],
]

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

function getSeedTranslation(sourceText, language) {
  const key = normalize(sourceText)
  const match = seedEntries.find((entry) => {
    const values = [
      entry.source_text,
      ...(Array.isArray(entry.aliases) ? entry.aliases : []),
      ...Object.values(entry.translations || {}),
    ]
    return values.some((value) => normalize(value) === key)
  })

  return String(match?.translations?.[language] ?? '').trim()
}

for (const [input, expectedFields] of fieldCases) {
  for (const [language, expected] of Object.entries(expectedFields)) {
    const actual = getSeedTranslation(input, language)
    if (actual !== expected) {
      console.error('[glossary] field assertion failed', {
        input,
        language,
        expected,
        actual,
      })
      process.exit(1)
    }
  }
}

console.log('[glossary] assertions passed', {
  cases: cases.length,
  fieldCases: fieldCases.length,
})
