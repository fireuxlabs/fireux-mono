import assert from 'node:assert/strict'
import test from 'node:test'
import { replaceOpeningDays } from '../runtime/place/utils/opening-hours-editor.ts'

test('editing one day preserves nonconsecutive days and unrelated windows', () => {
  const current = {
    windows: [
      {
        days: ['monday', 'wednesday', 'friday'],
        open: '09:00',
        close: '17:00',
      },
      { days: ['saturday'], open: '16:00', close: '00:30' },
    ],
  }
  const snapshot = structuredClone(current)
  assert.deepEqual(
    replaceOpeningDays(
      current,
      ['wednesday'],
      [{ open: '10:00', close: '18:00' }]
    ),
    {
      windows: [
        { days: ['monday', 'friday'], open: '09:00', close: '17:00' },
        { days: ['saturday'], open: '16:00', close: '00:30' },
        { days: ['wednesday'], open: '10:00', close: '18:00' },
      ],
    }
  )
  assert.deepEqual(current, snapshot)
})

test('selected days share split shifts, including an overnight closing', () => {
  assert.deepEqual(
    replaceOpeningDays(
      { windows: [] },
      ['tuesday', 'thursday', 'tuesday'],
      [
        { open: '11:00', close: '14:00' },
        { open: '18:00', close: '00:30' },
      ]
    ),
    {
      windows: [
        { days: ['tuesday', 'thursday'], open: '11:00', close: '14:00' },
        { days: ['tuesday', 'thursday'], open: '18:00', close: '00:30' },
      ],
    }
  )
})

test('closing selected days leaves other days intact and supports 24-hour opening', () => {
  const current = {
    windows: [{ days: ['monday', 'sunday'], open: '00:00', close: '00:00' }],
  }
  assert.deepEqual(replaceOpeningDays(current, ['monday'], []), {
    windows: [{ days: ['sunday'], open: '00:00', close: '00:00' }],
  })
  assert.deepEqual(
    replaceOpeningDays(
      { windows: [] },
      ['sunday'],
      [{ open: '00:00', close: '00:00' }]
    ),
    {
      windows: [{ days: ['sunday'], open: '00:00', close: '00:00' }],
    }
  )
})

test('invalid days and times fail before producing replacement hours', () => {
  for (const days of [[], ['not-a-day']]) {
    assert.throws(
      () => replaceOpeningDays({ windows: [] }, days, []),
      /Choose at least one day/
    )
  }
  for (const range of [
    { open: '24:00', close: '17:00' },
    { open: '09:60', close: '17:00' },
    { open: '9:00', close: '17:00' },
    { open: '09:00', close: '09:00' },
  ])
    assert.throws(() =>
      replaceOpeningDays({ windows: [] }, ['monday'], [range])
    )
})

test('weekly editor delegates a structured schedule and rejects stale drafts', async () => {
  const { readFileSync } = await import('node:fs')
  const { stripTypeScriptTypes } = await import('node:module')
  const { compileFunction } = await import('node:vm')
  const { computed, ref, reactive } = await import('vue')
  const { openingDays } = await import(
    '../runtime/place/utils/opening-hours-editor.ts'
  )
  const writes = []
  const props = reactive({
    hours: { windows: [{ days: ['tuesday'], open: '16:00', close: '00:30' }] },
    timezone: 'Europe/Zurich',
    disabled: false,
    update: async (value) => writes.push(value),
  })
  const source = readFileSync(
    new URL(
      '../runtime/place/components/OpeningHours/Schedule.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  const ui = compileFunction(
    `${stripTypeScriptTypes(source)}; return { edit, save, draft, error }`,
    [
      'computed',
      'ref',
      'openingDays',
      'replaceOpeningDays',
      'defineProps',
      'withDefaults',
    ]
  )(
    computed,
    ref,
    openingDays,
    replaceOpeningDays,
    () => props,
    (value) => value
  )
  ui.edit('tuesday')
  ui.draft.value = [{ open: '17:00', close: '01:00' }]
  await ui.save()
  assert.deepEqual(writes[0], {
    windows: [{ days: ['tuesday'], open: '17:00', close: '01:00' }],
  })
  ui.edit('tuesday')
  props.timezone = 'Europe/London'
  await ui.save()
  assert.match(ui.error.value, /changed while you were editing/)
  assert.equal(writes.length, 1)
  ui.edit('tuesday')
  props.disabled = true
  await ui.save()
  assert.match(ui.error.value, /not available/)
  assert.equal(writes.length, 1)
})
