import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, effectScope, ref, toValue, watch } from 'vue'

const source = readFileSync(
  new URL(
    '../runtime/composables/forms/useEditableStringField.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const useEditableStringField = compileFunction(
  `${stripTypeScriptTypes(source)}; return useEditableStringField`,
  ['computed', 'getCurrentInstance', 'ref', 'toValue', 'watch', 'normalizeSlug']
)(
  computed,
  () => null,
  ref,
  toValue,
  watch,
  (value) => value
)

test('numeric input saves string values, preserving zero and existing text trimming', async () => {
  const scope = effectScope()
  try {
    for (const [input, expected] of [
      [1440, '1440'],
      [0, '0'],
      ['  24  ', '24'],
      ['', ''],
    ]) {
      const writes = [],
        validations = [],
        emitted = []
      const field = scope.run(() =>
        useEditableStringField({
          value: 0,
          update: async (value) => writes.push(value),
          validationFunction: () => (value) => {
            validations.push(value)
            return { isValid: true }
          },
          emitUpdated: (value) => emitted.push(value),
        })
      )
      field.startEditing()
      field.draft.value = input
      await field.save()
      assert.deepEqual(writes, [expected])
      assert.deepEqual(validations, [expected])
      assert.deepEqual(emitted, [expected])
      assert.equal(field.effectiveValue.value, expected)
      assert.equal(field.isEditing.value, false)
    }
  } finally {
    scope.stop()
  }
})

test('invalid numeric input stays editable without writing', async () => {
  const scope = effectScope()
  try {
    let writes = 0
    const field = scope.run(() =>
      useEditableStringField({
        value: 0,
        update: async () => {
          writes++
        },
        validationFunction: () => (value) => ({
          isValid: Number(value) >= 0,
          message: 'Non-negative required',
        }),
      })
    )
    field.startEditing()
    field.draft.value = -1
    await field.save()
    assert.equal(writes, 0)
    assert.equal(field.errorMessage.value, 'Non-negative required')
    assert.equal(field.isEditing.value, true)
  } finally {
    scope.stop()
  }
})
