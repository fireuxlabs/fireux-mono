import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { parse } from 'vue/compiler-sfc'
import { compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { loadOfferingSource } from './offering-test-helpers.mjs'
const source = readFileSync(
  new URL(
    '../runtime/menu/components/Selection/Confirmation.vue',
    import.meta.url
  ),
  'utf8'
)
const sfc = parse(source).descriptor
const script = sfc.scriptSetup.content.replace(
  /^import[\s\S]*?from ['"][^'"]+['"]\n/gm,
  ''
)
const { formatCurrencyAmount } = loadOfferingSource(
  'utils/currency-display',
  'formatCurrencyAmount'
)
const submission = () => ({
  state: 'received',
  message: '',
  estimate_minutes: null,
  order: {
    id: 'reference',
    number: '42',
    channel: 'website',
    fulfilment: 'collection',
    lines: [
      {
        id: 'pizza',
        quantity: 2,
        item: { name: 'Pizza — Large' },
        notes: ['Cheese (+CHF 1.50)'],
      },
      {
        id: 'drink',
        quantity: 1,
        item: { name: 'Cola' },
        notes: ['Bottle deposit · CHF 10.00 per bottle'],
      },
      {
        id: 'deal',
        quantity: 1,
        item: { name: 'Meal deal' },
        notes: ['Main: Pizza (+CHF 2.00)'],
      },
    ],
  },
  pricing: {
    currency: 'CHF',
    total: 64,
    lines: [
      { line_id: 'pizza', unit_price: 16.5, total: 33 },
      { line_id: 'drink', unit_price: 14, total: 14 },
      { line_id: 'deal', unit_price: 17, total: 17 },
    ],
  },
})
async function render(changes = {}) {
  const props = {
    submission: submission(),
    responseTitle: 'Order received',
    responseMessage: 'Waiting for the kitchen to accept your order.',
    pending: false,
    error: '',
    venue: {
      display_name: 'Example Restaurant',
      formatted_address: 'High Street 1, Example Town',
      phone: '+41 00 000 00 00',
      google_maps_url: 'https://maps.google.com/?q=example',
    },
    ...changes,
  }
  const events = []
  const setup = compileFunction(
    stripTypeScriptTypes(script) + ';return { linePrice, money, emit }',
    ['defineProps', 'defineEmits', 'formatCurrencyAmount']
  )(
    () => props,
    () => (event) => events.push(event),
    formatCurrencyAmount
  )
  const app = createSSRApp({
    setup: () => ({ ...props, ...setup }),
    render: compile(sfc.template.content),
  })
  app.component('UButton', {
    props: ['label', 'disabled', 'loading'],
    setup: (p) => () =>
      h('button', { disabled: p.disabled || p.loading }, p.label),
  })
  app.component('FireCopyError', {
    props: ['message'],
    setup: (p) => () => h('button', 'Copy error: ' + p.message),
  })
  return { html: await renderToString(app), events, setup }
}
test('customer receipt shows numbered order, quantities, choices, line amounts, total and real collection details', async () => {
  const { html } = await render()
  for (const text of [
    'Collection order #42',
    '2 × Pizza — Large',
    'Cheese (+CHF 1.50)',
    'Bottle deposit · CHF 10.00 per bottle',
    'Main: Pizza (+CHF 2.00)',
    'Total · CHF',
    '>33<',
    '>64<',
    'Example Restaurant',
    'High Street 1, Example Town',
    'Directions',
    'tel:+41 00 000 00 00',
  ])
    assert.ok(html.includes(text), text)
  assert.match(html, /role="status" aria-live="polite"/)
  assert.doesNotMatch(
    html,
    /POS|Website|Edit quantity|Remove|Payment received|Paid/
  )
})
test('kitchen messages and estimates follow status without claiming acceptance or collection early', async () => {
  for (const state of [
    'received',
    'accepted',
    'preparing',
    'ready',
    'completed',
    'declined',
  ]) {
    const saved = {
      ...submission(),
      state,
      message:
        state === 'declined'
          ? 'Sorry, ingredients unavailable.'
          : 'Ask for order 42.',
      estimate_minutes: 15,
    }
    const { html } = await render({
      submission: saved,
      responseTitle: state,
      responseMessage: state,
    })
    assert.ok(html.includes(saved.message), state)
    assert.equal(
      html.includes('Kitchen estimate: 15 minutes.'),
      ['accepted', 'preparing'].includes(state),
      state
    )
    assert.equal(
      html.includes('Collect from'),
      !['declined', 'completed'].includes(state),
      state
    )
  }
})
test('zero amounts remain visible and missing optional venue or pricing does not invent information', async () => {
  const saved = submission()
  saved.pricing.total = 0
  saved.pricing.lines[0].total = 0
  assert.match((await render({ submission: saved })).html, />0</)
  delete saved.pricing
  const { html } = await render({ submission: saved, venue: null })
  assert.doesNotMatch(html, /Total ·|Collect from|Directions/)
  assert.match(html, /Pizza — Large/)
})
test('failed status refresh keeps the receipt visible and offers a safe retry action', async () => {
  const { html } = await render({
    error: 'Connection interrupted',
    pending: true,
  })
  assert.match(
    html,
    /Order updates are unavailable. Your order is still saved./
  )
  assert.match(html, /Copy error: Connection interrupted/)
  assert.match(html, /Collection order #42/)
  assert.match(html, /<button[^>]*disabled[^>]*>Check for updates/)
})
