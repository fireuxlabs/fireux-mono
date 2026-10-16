import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed } from 'vue'

const stripImports = (source) =>
  source.replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
const pricing = stripImports(
  readFileSync(
    new URL('../runtime/kitchen/utils/promotions/pricing.ts', import.meta.url),
    'utf8'
  )
).replace(/^export /gm, '')
const helpers = compileFunction(
  stripTypeScriptTypes(pricing) +
    '; return { normalizeKitchenPromotion, promotionDays }'
)()
const source = stripImports(
  readFileSync(
    new URL(
      '../runtime/kitchen/components/Workspace/Promotions/Editor.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
)
const bundle = () => ({
  id: 'meal',
  name: 'Lunch deal',
  status: 'paused',
  currency: 'CHF',
  days: ['monday'],
  price: 15,
  groups: [
    {
      id: 'pizza',
      name: 'Pizza',
      choose: 1,
      dishes: [
        { dishId: 'margherita', supplement: 0 },
        { dishId: 'swiss', supplement: 3 },
      ],
    },
  ],
})
function editor(promotion, options = {}) {
  const writes = [],
    events = []
  let current = true
  const state = {
    canWrite: ref(options.canWrite !== false),
    currency: ref('CHF'),
    dishes: {
      items: ref([
        { id: 'margherita', name: 'Margherita' },
        { id: 'swiss', name: 'Swiss' },
      ]),
      pending: ref(false),
      error: ref(null),
    },
    captureIntent: () => () => current,
    save: async (...args) => {
      writes.push(args)
      if (options.pending) await options.pending
      return { id: 'saved' }
    },
  }
  const dependencies = {
    ref,
    computed,
    ...helpers,
    defineProps: () => ({ state, promotion }),
    defineEmits: () => (event) => events.push(event),
  }
  const api = compileFunction(
    stripTypeScriptTypes(source) +
      '; return { form, name, rows, setPrice, groups, days, active, busy, error, save }',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return {
    ...api,
    writes,
    events,
    invalidate: () => {
      current = false
    },
  }
}

test('meal-deal editor detaches saved choices and submits one complete bundle form', async () => {
  const saved = bundle(),
    e = editor(saved)
  assert.equal(e.form.value, 'meal_deal')
  e.groups.value[0].dishes[1].supplement = '4.50'
  assert.equal(saved.groups[0].dishes[1].supplement, 3)
  await e.save()
  assert.equal(e.writes.length, 1)
  const [payload, id] = e.writes[0]
  assert.equal(id, 'meal')
  assert.equal(payload.price, 15)
  assert.equal(payload.groups[0].dishes[0].supplement, 0)
  assert.equal(payload.groups[0].dishes[1].supplement, 4.5)
  assert.equal('dishes' in payload, false)
  assert.deepEqual(e.events, ['close'])
})

test('existing Dish offers retain their original command shape', async () => {
  const e = editor({
    id: 'sunday',
    name: 'Sunday pizzas',
    status: 'active',
    currency: 'CHF',
    days: ['sunday'],
    dishes: [{ dishId: 'margherita', price: 11 }],
  })
  await e.save()
  assert.deepEqual(e.writes[0], [
    {
      name: 'Sunday pizzas',
      status: 'active',
      currency: 'CHF',
      days: ['sunday'],
      dishes: [{ dishId: 'margherita', price: 11 }],
    },
    'sunday',
  ])
})

test('blank prices, invalid choice counts and missing groups never dispatch', async () => {
  for (const change of [
    (e) => (e.setPrice.value = ''),
    (e) => (e.groups.value[0].choose = ''),
    (e) => (e.groups.value[0].choose = 3),
    (e) => (e.groups.value[0].dishes[0].supplement = ''),
    (e) => (e.groups.value = []),
  ]) {
    const e = editor(bundle())
    change(e)
    await e.save()
    assert.equal(e.writes.length, 0)
    assert.ok(e.error.value)
  }
})

test('new meal deals and form conversion do not submit hidden Dish-offer rows', async () => {
  const e = editor({
    id: 'offer',
    name: 'Offer',
    status: 'paused',
    currency: 'CHF',
    days: ['monday'],
    dishes: [{ dishId: 'margherita', price: 11 }],
  })
  e.form.value = 'meal_deal'
  e.setPrice.value = 15
  e.groups.value = bundle().groups
  await e.save()
  assert.equal('dishes' in e.writes[0][0], false)
  assert.equal(e.writes[0][1], 'offer')
})

test('readonly editors do not dispatch and obsolete completion does not close another scope', async () => {
  const readonly = editor(bundle(), { canWrite: false })
  await readonly.save()
  assert.equal(readonly.writes.length, 0)
  let release
  const pending = new Promise((resolve) => {
    release = resolve
  })
  const e = editor(bundle(), { pending })
  const save = e.save()
  e.invalidate()
  release()
  await save
  assert.deepEqual(e.events, [])
})
