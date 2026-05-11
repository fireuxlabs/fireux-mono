#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ts from 'typescript'

const glossaryPath = resolve(
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-menu-glossary.ts'
)
const source = await readFile(glossaryPath, 'utf8')
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

console.log('[glossary] assertions passed', { cases: cases.length })
