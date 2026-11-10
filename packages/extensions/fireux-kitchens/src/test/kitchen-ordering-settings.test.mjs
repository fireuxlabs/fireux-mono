import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import * as vue from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import {
  loadOfferingSource as load,
  offeringHarness,
  offeringContract,
  offeringReads,
  offeringTargets,
  offeringOverviewPolicy,
  operatingHoursPolicy,
  serviceHoursPolicy,
  serviceMenuPolicy,
  interactionValidation,
  testKitchenHours,
} from './offering-test-helpers.mjs'
import { KitchenOrderTypes } from '../runtime/kitchen/models/offering-interaction-types.model.ts'

const errors = {
  createError: (value) => Object.assign(new Error(value.statusMessage), value),
  requireFirestoreDocumentId: (value) => {
    if (typeof value !== 'string' || !value || value.includes('/'))
      throw Error('Invalid id')
    return value
  },
}
const validation = load(
  'kitchen/server/offerings/validation',
  'readOfferingUpdate,requireConfiguredOffering,requireServiceMenus,fail',
  { ...errors, ...operatingHoursPolicy, ...serviceMenuPolicy }
)
const interactionInput = load(
  'kitchen/server/offerings/interaction-validation',
  'readInteractionChanges',
  { ...errors, ...interactionValidation, KitchenOrderTypes }
)
const patch = load(
  'kitchen/utils/offering-interaction',
  'patchKitchenOfferingInteraction,newKitchenOfferingInteraction'
)
const channels = load(
  'kitchen/utils/table-service',
  'tableServiceChannel,tableChannelEnabled,configureTableChannel'
)

function commands(records) {
  const rows = offeringHarness(records)
  const writes = []
  const deps = {
    ...errors,
    ...validation,
    ...interactionInput,
    ...patch,
    ...channels,
    ...offeringOverviewPolicy,
    ...offeringContract,
    ...offeringReads,
    ...offeringTargets,
    ...serviceHoursPolicy,
    resolveKitchenOperationHours: testKitchenHours,
    readKitchenMutationActor: async () => ({ uid: 'operator' }),
    requireKitchenMutationAuthority: async (_tx, _actor, kitchenId) => {
      assert.equal(kitchenId, 'kitchen')
      return { rootData: {}, placeData: {} }
    },
    serverKitchenMenusTarget: (id) => 'kitchens/' + id + '/menus',
    FieldValue: { delete: () => ({ deleted: true }) },
    runGuardedServerTransaction: async (_scope, run) =>
      run({
        readAll: rows.readAll,
        update: (target, id, data) => {
          writes.push([target.collectionPath, id, data])
          rows.write(target, id, data)
        },
      }),
  }
  return {
    ...rows,
    writes,
    ...load(
      'kitchen/server/offerings/configure',
      'configureKitchenOffering',
      deps
    ),
    ...load('kitchen/server/offerings/update', 'updateKitchenOffering', deps),
    ...load(
      'kitchen/server/offerings/update-interaction',
      'updateKitchenOfferingInteraction',
      deps
    ),
  }
}

test('Pre-order edits hours and trusted interaction settings preserve valid notice values and reject limits', async () => {
  const source = readFileSync(
    new URL(
      '../runtime/kitchen/components/FoodAndDrink/Services/Timing.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const writes = []
  const update = compileFunction(
    stripTypeScriptTypes(source) + ';return updateNotice',
    ['ref', 'defineProps']
  )(vue.ref, () => ({
    config: { type: 'pre_order', notice_hours: 24 },
    updateFunction: async (changes) => {
      writes.push(
        interactionValidation.requireKitchenInteractionChanges(
          'pre_order',
          changes
        )
      )
    },
  }))
  await update({ target: { value: '12' } })
  await update({ target: { value: '0' } })
  assert.deepEqual(writes, [{ notice_hours: 12 }, { notice_hours: 0 }])
  for (const invalid of ['-1', '169'])
    await assert.rejects(update({ target: { value: invalid } }), /notice_hours/)
  for (const [type, hours] of [
    ['collection', 0.75],
    ['delivery', 0.5],
  ]) {
    assert.deepEqual(
      interactionValidation.requireKitchenInteractionChanges(type, {
        notice_hours: hours,
      }),
      { notice_hours: hours }
    )
    assert.throws(() =>
      interactionValidation.requireKitchenInteractionChanges(type, {
        notice_hours: -1,
      })
    )
    assert.throws(() =>
      interactionValidation.requireKitchenInteractionChanges(type, {
        notice_hours: 169,
      })
    )
  }
})

test('interaction temporary pause never changes service enablement', async () => {
  const saved = {
    id: 'dinner',
    name: 'Dinner',
    enabled: false,
    menu_ids: [],
    interactions: [
      { type: 'collection', enabled: false, availability: { paused: true } },
    ],
  }
  const api = commands([saved])
  const update = (changes) =>
    api.updateKitchenOfferingInteraction(
      {},
      {
        kitchenId: 'kitchen',
        offeringId: 'dinner',
        type: 'collection',
        changes,
      }
    )
  const unpaused = (await update({ availability: { paused: false } })).offering
  assert.equal(unpaused.enabled, false)
  assert.equal(unpaused.interactions[0].enabled, false)
  assert.deepEqual(unpaused.interactions[0].availability, { paused: false })
  const message = (await update({ availability: { message: 'Back soon' } }))
    .offering
  assert.equal(message.enabled, false)
  assert.equal(message.interactions[0].enabled, false)
  assert.deepEqual(message.interactions[0].availability, {
    paused: false,
    message: 'Back soon',
  })
})

test('the current service editor and name command retain the selected Offering ID without enabling it', async () => {
  const records = ['breakfast', 'dinner'].map((id) => ({
    id,
    name: id,
    enabled: false,
    menu_ids: [],
    interactions: [
      { type: 'browse', enabled: true },
      { type: 'pre_order', enabled: false },
    ],
  }))
  const api = commands(records)
  const selected = vue.ref('dinner')
  const retained = vue.ref({ offerings: api.values(), menus: [] })
  const option = offeringOverviewPolicy.kitchenOfferingOptions.find(
    (row) => row.key === 'pre_order'
  )
  const useServiceSetup = load(
    'kitchen/composables/offerings/useServiceSetup',
    'useServiceSetup',
    {
      ...vue,
      ...patch,
      ...offeringOverviewPolicy,
      ...operatingHoursPolicy,
      useCommandScope,
    }
  ).useServiceSetup
  const configureCalls = []
  const deps = {
    ...vue,
    ...offeringOverviewPolicy,
    ...serviceMenuPolicy,
    useServiceSetup,
    useKitchenServicesContext: () => ({
      retained,
      source: {
        kitchenId: vue.ref('kitchen'),
        canWrite: vue.ref(true),
        configure: async (input, current) => {
          assert.equal(current(), true)
          configureCalls.push(input)
          return api.configureKitchenOffering(
            {},
            { ...input, kitchenId: 'kitchen' }
          )
        },
      },
    }),
  }
  const scope = vue.effectScope()
  try {
    const { editor } = scope.run(() =>
      load(
        'kitchen/composables/offerings/useKitchenServiceEditor',
        'createKitchenServiceEditor',
        deps
      ).createKitchenServiceEditor(option, () =>
        retained.value.offerings.find((row) => row.id === selected.value)
      )
    )
    assert.equal(editor.record.id, 'dinner')
    assert.equal(editor.interactions[0].enabled, false)
    assert.deepEqual(api.writes, [])
    await editor.updateInteraction('pre_order', { notice_hours: 12 })
    assert.equal(configureCalls[0].offeringId, 'dinner')
    assert.deepEqual(configureCalls[0].interactions, [
      { type: 'pre_order', changes: { notice_hours: 12 } },
    ])
    await api.updateKitchenOffering(
      {},
      {
        kitchenId: 'kitchen',
        offeringId: editor.record.id,
        changes: { name: 'Evening service' },
      }
    )
    assert.deepEqual(
      api.writes.map(([path, id]) => [path, id]),
      [
        ['kitchens/kitchen/offerings', 'dinner'],
        ['kitchens/kitchen/offerings', 'dinner'],
      ]
    )
    assert.equal(
      api.values().find((row) => row.id === 'dinner').name,
      'Evening service'
    )
    assert.equal(api.values().find((row) => row.id === 'dinner').enabled, false)
    assert.deepEqual(
      api.values().find((row) => row.id === 'breakfast'),
      records[0]
    )
  } finally {
    scope.stop()
  }
})
