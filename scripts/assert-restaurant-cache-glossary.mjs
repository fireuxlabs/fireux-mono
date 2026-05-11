#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ts from 'typescript'

const glossaryPath = resolve(
  'projects/misebox/misebox-app/server/utils/restaurant-translation-glossary.ts'
)
const source = await readFile(glossaryPath, 'utf8')
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
})
const encoded = Buffer.from(transpiled.outputText).toString('base64')
const { getRestaurantGlossaryTranslation } = await import(
  `data:text/javascript;base64,${encoded}`
)

const cases = [
  ['Hauptkarte', 'en', 'Main Menu'],
  ['Main Menu', 'es', 'Menú principal'],
  ['Speisekarte', 'en', 'Menu'],
  ['Starters', 'fr', 'Entrées'],
  ['Side Dishes', 'it', 'Contorni'],
]

for (const [sourceText, targetLanguage, expected] of cases) {
  const actual = getRestaurantGlossaryTranslation({ sourceText, targetLanguage })
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
