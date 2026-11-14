import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { buildImportRecords, kitchenId } from './import.mjs'
const data = () =>
  JSON.parse(readFileSync(new URL('./records.json', import.meta.url), 'utf8'))
test('La Tap import resolves all outputs and ingredients and creates only scoped definitions/associations', () => {
  const input = data(),
    before = structuredClone(input)
  const result = buildImportRecords(input)
  assert.equal(result.records.length, 29)
  assert.equal(result.ingredientIds.length, 16)
  assert.equal(
    result.records.filter((row) => row.path.includes('/prep-items/')).length,
    4
  )
  assert.equal(
    result.records.filter((row) => row.path.includes('/recipes/')).length,
    5
  )
  assert.ok(
    result.records.every(
      (row) =>
        row.path.startsWith(`kitchens/${kitchenId}/`) ||
        row.path.startsWith('ingredients/')
    )
  )
  assert.ok(
    result.records.every(
      (row) => !('id' in row.data) && !('example' in row.data)
    )
  )
  assert.deepEqual(input, before)
})
test('import rejects broken output/input references, duplicate IDs and non-finite quantities', () => {
  for (const corrupt of [
    (input) => (input.recipes[0].output_preparation_id = 'missing'),
    (input) => (input.recipes[3].inputs.at(-1).reference_id = 'missing'),
    (input) => input.recipes.push(input.recipes[0]),
    (input) => (input.recipes[0].inputs[0].quantity = Infinity),
  ]) {
    const input = data()
    corrupt(input)
    assert.throws(() => buildImportRecords(input))
  }
})

test('Menu population recipes stay inside the same canonical model and keep original records separate', () => {
  const input = JSON.parse(
    readFileSync(new URL('./menu-recipes.json', import.meta.url), 'utf8')
  )
  const first = data(),
    result = buildImportRecords(input)
  assert.equal(input.preparations.length, 11)
  assert.equal(input.recipes.length, 11)
  assert.ok(
    input.preparations.every(
      (row) => !first.preparations.some((old) => old.id === row.id)
    )
  )
  assert.ok(
    input.recipes.every(
      (row) => !first.recipes.some((old) => old.id === row.id)
    )
  )
  assert.ok(
    result.records.every(
      (row) =>
        !row.path.includes('/dishes/') &&
        !row.path.includes('/menus/') &&
        !row.path.includes('/orders/') &&
        !row.path.includes('/batches/')
    )
  )
  assert.ok(
    input.recipes.every(
      (row) => row.source.title && row.source.url.startsWith('https://')
    )
  )
  assert.ok(
    input.recipes
      .find((row) => row.id === 'jamon-croquettes')
      .inputs.some(
        (row) =>
          row.kind === 'preparation' &&
          row.reference_id === 'jamon-croquette-filling'
      )
  )
})
