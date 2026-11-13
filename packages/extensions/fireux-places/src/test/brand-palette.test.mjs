import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { parseBrandPalette } from '../runtime/place/utils/brand-palette.ts'
import { normalizePlace } from '../runtime/place/utils/normalize-place.ts'

test('brand colours remain sparse and normalize without inventing missing values', () => {
  assert.deepEqual(parseBrandPalette({ primary_color: ' #ABCDEF ' }), {
    ok: true,
    value: { primary_color: '#abcdef' },
  })
  assert.deepEqual(parseBrandPalette(undefined), { ok: true, value: {} })
  assert.equal(parseBrandPalette({ accent: '#123456' }).ok, false)
  assert.equal(parseBrandPalette({ primary_color: 'red' }).ok, false)
})

test('Place reads its colour fields directly without adding defaults or unrelated fields', () => {
  const place = normalizePlace('venue', {
    name: 'Venue',
    place_type: 'physical',
    brand_palette: {
      primary_color: '#ABCDEF',
      secondary_color: 'red',
      unrelated: '#123456',
    },
  })
  assert.deepEqual(place.brand_palette, {
    primary_color: '#abcdef',
  })
})

test('clearing a Place colour preserves the sparse stored shape without applying fallback colours', () => {
  assert.deepEqual(
    parseBrandPalette({ primary_color: '', secondary_color: '#ABCDEF' }),
    {
      ok: true,
      value: { secondary_color: '#abcdef' },
    }
  )
  assert.deepEqual(
    parseBrandPalette({ primary_color: '', secondary_color: '' }),
    { ok: true, value: {} }
  )
})

test('the picker writes selected colours directly and resets only the selected field', () => {
  const source = readFileSync(
    new URL(
      '../runtime/place/components/Onboarding/BrandPalette.vue',
      import.meta.url
    ),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[^\n]*\n/gm, '')
  const updates = []
  const props = { modelValue: { secondary_color: '#abcdef' }, disabled: false }
  const picker = compileFunction(
    `${stripTypeScriptTypes(source)}; return { updateColor, resetColor, displayColor }`,
    ['defineProps', 'withDefaults', 'defineEmits']
  )(
    () => props,
    (value) => value,
    () => (_event, value) => updates.push(value)
  )
  picker.updateColor('primary_color', '#0f766e')
  assert.deepEqual(updates.pop(), {
    primary_color: '#0f766e',
    secondary_color: '#abcdef',
  })
  picker.resetColor('secondary_color')
  assert.deepEqual(updates.pop(), {})
  props.disabled = true
  picker.updateColor('primary_color', '#123456')
  assert.equal(updates.length, 0)
})
