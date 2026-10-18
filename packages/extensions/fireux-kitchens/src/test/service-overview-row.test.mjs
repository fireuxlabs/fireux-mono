import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { offeringOverviewPolicy } from './offering-test-helpers.mjs'
const source = readFileSync(
  new URL(
    '../runtime/kitchen/components/Workspace/Offerings/Row.vue',
    import.meta.url
  ),
  'utf8'
)
const template = source.slice(
  source.indexOf('<template>') + 10,
  source.indexOf('</template>')
)
const script = stripTypeScriptTypes(
  source
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
)
const rowState = (props) =>
  compileFunction(
    script + ';return { ...props, status, emit, formatWeekdayTimeText }',
    [
      'defineProps',
      'defineEmits',
      'computed',
      'offeringOptionStatus',
      'formatWeekdayTimeText',
    ]
  )(
    () => props,
    () => () => {},
    vue.computed,
    offeringOverviewPolicy.offeringOptionStatus,
    (hours) => hours?.label || ''
  )
test('every service row renders its own name, menus, hours, status, timing and labelled Configure action', async () => {
  for (const [key, timing, enabled, paused] of [
    ['collection', 'next_day', true, false],
    ['collection', 'same_day', false, false],
    ['delivery', undefined, true, true],
  ]) {
    const option = offeringOverviewPolicy.kitchenOfferingOptions.find(
      (option) => option.key === key
    )
    const state = rowState({
      offering: {
        id: 'concept',
        name: 'Weekend bags',
        enabled,
        collection_timing: timing,
        hours: { label: 'Tuesday 08:00 - 12:00' },
        interactions: [{ type: key, enabled: true, availability: { paused } }],
      },
      option,
      menusLabel: 'Packed lunches',
      disabled: false,
    })
    const app = vue.createSSRApp({
      setup: () => state,
      render: vue.compile(template),
    })
    app.component('UBadge', {
      setup:
        (_, { slots }) =>
        () =>
          vue.h('span', slots.default?.()),
    })
    app.component('UButton', {
      props: ['label'],
      setup: (props) => () => vue.h('button', props.label),
    })
    const html = await renderToString(app)
    for (const text of [
      'Weekend bags',
      'Packed lunches',
      'Tuesday 08:00 - 12:00',
      `${enabled ? 'Configure' : 'Enable and configure'} Weekend bags for ${key}`,
      enabled ? (paused ? 'Paused' : 'On') : 'Off',
    ])
      assert.ok(html.includes(text), text)
    if (key === 'collection')
      assert.ok(
        html.includes(
          timing === 'next_day'
            ? 'Collection from tomorrow'
            : 'Same-day collection'
        )
      )
  }
})
