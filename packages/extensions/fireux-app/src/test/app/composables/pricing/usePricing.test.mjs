import assert from 'node:assert/strict'
import test from 'node:test'
import { reactive } from 'vue'
import { usePricing } from '../../../../runtime/app/composables/pricing/usePricing.ts'

const profile = () => ({
  appName: 'Example',
  contactEmail: 'hello@example.test',
  workspaceName: 'Project Workspace',
  entityName: 'Project',
  entityPluralName: 'Projects',
  free: ['One Project', 'Bounded tools'],
  pro: ['Complete tools'],
})

test('Commercial prices, additive costs and tier destinations survive the ownership move', () => {
  const pricing = usePricing({ ...profile(), includesEcosystemTier: true })
  assert.deepEqual(
    pricing.tiers.value.map(({ id, price, to }) => [id, price, to]),
    [
      ['free', 'CHF 0', '/pricing/free'],
      ['pro', 'CHF 20', '/pricing/pro'],
      ['business', 'CHF 100', '/pricing/business'],
      ['managed', 'CHF 100', '/pricing/managed'],
      ['your-app', 'CHF 600', '/pricing/your-app'],
      ['your-ecosystem', "CHF 1'200", '/pricing/your-ecosystem'],
    ]
  )
  assert.match(
    pricing.getTier('business').priceNote,
    /CHF 100\/month plus CHF 20\/month/
  )
  assert.match(
    pricing.getTier('managed').priceNote,
    /Additional to the subscription: CHF 100\/month plus CHF 20\/month/
  )
  assert.match(
    pricing.getTier('your-app').priceNote,
    /CHF 600 setup.*CHF 100 setup.*CHF 50\/month/
  )
  assert.match(
    pricing.getTier('your-ecosystem').priceNote,
    /CHF 1'200 setup plus CHF 50\/month/
  )
  assert.ok(
    !pricing.landingTiers.value.some(({ id }) => id === 'your-ecosystem')
  )
  assert.equal(pricing.getTier('unknown'), undefined)
})

test('App-owned nouns and optional service offers remain reactive', () => {
  const source = reactive({
    ...profile(),
    includesManaged: false,
    includesEcosystemTier: false,
  })
  const pricing = usePricing(source)
  assert.deepEqual(
    pricing.tiers.value.map(({ id }) => id),
    ['free', 'pro', 'business', 'your-app']
  )
  assert.deepEqual(pricing.getTier('pro').included, [
    'Everything in Free',
    'Complete tools',
  ])
  source.entityName = 'Kitchen'
  source.entityPluralName = 'Kitchens'
  source.includesManaged = true
  assert.match(pricing.getTier('pro').description, /one Kitchen/)
  assert.match(pricing.getTier('business').description, /multiple Kitchens/)
  assert.ok(pricing.getTier('managed'))
})
