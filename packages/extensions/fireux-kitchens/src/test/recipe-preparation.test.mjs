import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
const source = readFileSync(
  new URL('../runtime/kitchen/utils/recipe-preparation.ts', import.meta.url),
  'utf8'
)
const { outputText } = ts.transpileModule(source.replace(/^import.*\n/gm, ''), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
})
const { normalizeRecipePreparation, validateRecipePreparation } = await import(
  `data:text/javascript;base64,${Buffer.from(`const isFirestoreDocumentId = ${isFirestoreDocumentId.toString()};\n${outputText}`).toString('base64')}`
)
const prep = {
  prep_item_id: 'sliced-onions',
  quantity: 5,
  unit: 'each',
  note: '',
}
test('existing recipes retain ingredients and acquire an empty prep list', () => {
  const ingredient = {
    ingredient_id: 'beef-strips',
    quantity: 5.7,
    unit: 'kg',
    note: '',
  }
  const result = normalizeRecipePreparation({ ingredients: [ingredient] })
  assert.deepEqual(result.ingredients, [ingredient])
  assert.deepEqual(result.prep_items, [])
})
test('a recipe may consume prep outputs without raw ingredients', () => {
  const result = validateRecipePreparation({
    status: 'ready',
    yield: { quantity: 1, unit: 'batch' },
    prep_items: [prep],
    method: ['Cook.'],
  })
  assert.equal(result.prep_items[0].prep_item_id, 'sliced-onions')
  assert.equal(result.ingredients.length, 0)
})
test('invalid prep references and quantities are rejected', () => {
  for (const patch of [
    { prep_item_id: '' },
    { prep_item_id: 'other/kitchen' },
    { quantity: 0 },
    { quantity: -1 },
    { quantity: Infinity },
    { unit: '' },
  ]) {
    assert.throws(() =>
      validateRecipePreparation({ prep_items: [{ ...prep, ...patch }] })
    )
  }
})
