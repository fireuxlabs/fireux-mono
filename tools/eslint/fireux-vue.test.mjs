import { Linter } from 'eslint'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import test from 'node:test'
import assert from 'node:assert/strict'
import plugin from './fireux-vue.mjs'

const lint = (source) =>
  new Linter().verify(
    source,
    [
      {
        files: ['**/*.vue'],
        languageOptions: {
          parser: vueParser,
          parserOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
          },
        },
        plugins: { fireux: plugin },
        rules: {
          'fireux/no-authored-utilities': 'error',
          'fireux/block-order': 'error',
        },
      },
    ],
    { filename: 'Fixture.vue' }
  )

test('foundation lint accepts semantic classes, native props and normal block order', () => {
  assert.deepEqual(
    lint(
      '<template><UButton class="fx-header-action" size="sm" /></template><script setup>const label = "Example"</script><style scoped>.fx-header-action { display: flex; }</style>'
    ),
    []
  )
})
for (const markup of [
  'class="flex gap-2"',
  ":class=\"active ? 'text-muted' : 'fx-label'\"",
  ':ui="{ root: \'w-full\' }"',
]) {
  test(`foundation lint rejects utilities in ${markup}`, () => {
    assert.ok(
      lint(`<template><div ${markup} /></template>`).some(
        (message) => message.ruleId === 'fireux/no-authored-utilities'
      )
    )
  })
}
test('foundation lint rejects script-generated utility recipes', () => {
  assert.ok(
    lint(
      '<template><div :class="classes" /></template><script setup>const classes = "grid gap-4"</script>'
    ).some((message) => message.ruleId === 'fireux/no-authored-utilities')
  )
})
test('foundation lint rejects reversed block order', () => {
  assert.ok(
    lint(
      '<script setup>const value = 1</script><template><p>{{ value }}</p></template>'
    ).some((message) => message.ruleId === 'fireux/block-order')
  )
})
