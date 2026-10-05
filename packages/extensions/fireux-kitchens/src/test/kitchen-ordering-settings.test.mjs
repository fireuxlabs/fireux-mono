import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, effectScope, onScopeDispose, ref, watch } from 'vue'


const commandScopeSource = readFileSync(
  new URL('../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts', import.meta.url),
  'utf8'
).replace(/^import.*\n/gm, '').replace(/^export /gm, '')
const useCommandScope = compileFunction(
  `${stripTypeScriptTypes(commandScopeSource)}; return useCommandScope`,
  ['watch', 'onScopeDispose']
)(watch, onScopeDispose)

function load(component, props, names, dependencies = {}) {
  const source = readFileSync(
    new URL(
      `../runtime/kitchen/components/Workspace/Services/${component}.vue`,
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${names} }`,
    [
      'computed',
      'ref',
      'watch',
      'defineProps',
      'withDefaults',
      ...Object.keys(dependencies),
    ]
  )(
    computed,
    ref,
    watch,
    () => props,
    (values, defaults) => ({ ...defaults, ...values }),
    ...Object.values(dependencies)
  )
}

test('pre-order edits hours while other service editors retain minute conversion', async () => {
  const scope = effectScope()
  try {
    for (const [type, displayed, entered, stored] of [
      ['pre_order', 24, '12', 12],
      ['collection', 1440, '45', 0.75],
      ['delivery', 1440, '30', 0.5],
    ]) {
      const writes = []
      const timing = scope.run(() =>
        load(
          'Timing',
          {
            config: { type, notice_hours: 24 },
            updateFunction: async (patch) => writes.push(patch),
          },
          'noticeValue, updateNotice, validateNotice'
        )
      )
      assert.equal(timing.noticeValue.value, displayed)
      assert.equal(timing.validateNotice(entered).isValid, true)
      assert.equal(timing.validateNotice('-1').isValid, false)
      assert.equal(
        timing.validateNotice(type === 'pre_order' ? '169' : '10081').isValid,
        false
      )
      await timing.updateNotice(entered)
      assert.deepEqual(writes, [{ notice_hours: stored }])
      await timing.updateNotice('0')
      assert.deepEqual(writes[1], { notice_hours: 0 })
    }
  } finally {
    scope.stop()
  }
})

test('interaction temporary pause never changes service enablement', async () => {
  const scope = effectScope()
  try {
    const writes = []
    const control = scope.run(() =>
      load(
        'Availability',
        {
          config: { enabled: false, availability: { paused: true } },
          updateFunction: async (patch) => writes.push(patch),
        },
        'paused, updatePaused, updatePauseMessage'
      )
    )
    assert.equal(control.paused.value, true)
    await control.updatePaused(false)
    await control.updatePauseMessage('Back soon')
    assert.deepEqual(writes, [
      { availability: { paused: false } },
      { availability: { message: 'Back soon' } },
    ])
  } finally {
    scope.stop()
  }
})

test('service editor targets a stable offering id and interaction without enabling on selection', async () => {
  const scope = effectScope()
  const writes = []
  const routeId = ref('dinner')
  const kitchenId = ref('kitchen')
  const services = ref(
    ['breakfast', 'dinner'].map((id) => ({
      id,
      name: id,
      enabled: false,
      menu_ids: [],
      interactions: [
        { type: 'browse', enabled: true },
        { type: 'pre_order', enabled: false },
      ],
    }))
  )
  try {
    const ui = scope.run(() =>
      load(
        'Service',
        {},
        'service, interactionType, interaction, updateService, saveInteraction',
        {
          useRouteParam: () => routeId,
          useCommandScope,
          useKitchenServices: () => ({
            services,
            kitchenId,
            canWrite: ref(true),
            captureIntent: useCommandScope([kitchenId]),
            update: async (...args) => writes.push(['service', ...args]),
            updateInteraction: async (...args) =>
              writes.push(['interaction', ...args]),
          }),
          KitchenOrderTypes: ['pre_order', 'delivery'],
          kitchenOrderTypeLabel: (type) => type,
          newKitchenServiceInteraction: (type) => ({ type, enabled: false }),
        }
      )
    )
    assert.equal(ui.service.value.id, 'dinner')
    ui.interactionType.value = 'pre_order'
    assert.equal(ui.interaction.value.enabled, false)
    assert.deepEqual(writes, [])
    await ui.saveInteraction({ notice_hours: 12 })
    await ui.updateService({ name: 'Evening service' })
    assert.deepEqual(writes, [
      ['interaction', 'dinner', 'pre_order', { notice_hours: 12 }],
      ['service', 'dinner', { name: 'Evening service' }],
    ])
    assert.equal(ui.service.value.enabled, false)
  } finally {
    scope.stop()
  }
})
