import assert from 'node:assert/strict'
import test from 'node:test'
import { readRecipeChanges } from '../../runtime/recipe/utils/changes.ts'

test('Recipe authoring has one canonical contract and rejects retired or authority fields', () => {
  for (const field of [
    'preparation',
    'names',
    'descriptions',
    'source_language',
    'id',
    'slug',
    'kitchen_id',
    'created',
    'updated',
  ])
    assert.throws(
      () => readRecipeChanges({ name: 'Recipe', [field]: {} }),
      /Unsupported/
    )
  for (const input of [
    null,
    [],
    {},
    { name: '' },
    { inputs: {} },
    { method: [{}] },
    { yield: { quantity: '2', unit: 'g' } },
    {
      inputs: [
        {
          kind: 'ingredient',
          reference_id: '../other',
          quantity: 1,
          unit: 'g',
        },
      ],
    },
    {
      inputs: [
        {
          kind: 'ingredient',
          reference_id: 'onion',
          quantity: Infinity,
          unit: 'g',
        },
      ],
    },
    { source: { title: 'Source', url: 'javascript:alert(1)' } },
  ])
    assert.throws(() => readRecipeChanges(input))
})
test('Recipe changes preserve explicit unknown/cleared fields and detach nested authored values', () => {
  const input = {
    name: ' Soup ',
    yield: null,
    output_preparation_id: null,
    inputs: [],
    method: [],
  }
  const patch = readRecipeChanges(input)
  input.inputs.push({
    kind: 'ingredient',
    reference_id: 'onion',
    quantity: 1,
    unit: 'g',
  })
  assert.deepEqual(patch, {
    name: 'Soup',
    yield: null,
    output_preparation_id: null,
    inputs: [],
    method: [],
  })
})
