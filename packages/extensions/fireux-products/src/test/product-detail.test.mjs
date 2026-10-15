import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { ref } from 'vue'
import { parse, compileScript, compileTemplate } from 'vue/compiler-sfc'

const runtime = new URL('../runtime/', import.meta.url)
function checkout(props) {
  const source = readFileSync(
    new URL('product/components/Checkout/Action.vue', runtime),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import .*\n/gm, '')
  const calls = []
  const window = { location: { href: '' } }
  const api = compileFunction(
    `${stripTypeScriptTypes(source)}; return { startCheckout, isBuying }`,
    ['defineProps', 'ref', 'globalThis', '$fetch', 'window', 'console']
  )(
    () => props,
    ref,
    {},
    async (...args) => {
      calls.push(args)
      return { url: 'https://checkout.example/session' }
    },
    window,
    { warn() {} }
  )
  return { ...api, calls, window }
}

test('Product purchase previews and incomplete records cannot start checkout', async () => {
  for (const props of [
    { preview: true },
    {},
    {
      product: { id: 'p', source_app_id: 'a' },
      defaultPrice: { id: 'local_price' },
    },
  ]) {
    const state = checkout(props)
    await state.startCheckout()
    assert.equal(state.calls.length, 0)
    assert.equal(state.window.location.href, '')
  }
})

test('Product purchase retains the existing checkout request and navigation', async () => {
  for (const type of ['one_time', 'recurring']) {
    const state = checkout({
      product: { id: 'product-id', source_app_id: 'app-id' },
      defaultPrice: { provider_price_id: 'price-id', type },
    })
    await state.startCheckout()
    assert.deepEqual(state.calls, [
      [
        '/api/stripe/create-checkout-session',
        {
          method: 'POST',
          body: {
            appId: 'app-id',
            productId: 'product-id',
            slug: 'product-id',
            priceId: 'price-id',
            mode: type === 'recurring' ? 'subscription' : 'payment',
          },
        },
      ],
    ])
    assert.equal(state.window.location.href, 'https://checkout.example/session')
    assert.equal(state.isBuying.value, false)
  }
})

test('Product and Blog detail compositions compile under their registered names', () => {
  for (const relative of [
    'product/components/Detail/Index.vue',
    'product/components/Detail/Header.vue',
    'product/components/Detail/Summary.vue',
    'product/components/Cards/Purchase.vue',
    'product/components/Diagnostics/Record.vue',
    'product/components/Checkout/Action.vue',
    'product/components/Onboarding/Index.vue',
    '../../../fireux-blogs/src/runtime/blog/components/Detail/Index.vue',
    '../../../fireux-blogs/src/runtime/blog/components/Detail/Header.vue',
  ]) {
    const filename = new URL(relative, runtime)
    const { descriptor, errors } = parse(readFileSync(filename, 'utf8'))
    assert.deepEqual(errors, [])
    if (descriptor.scriptSetup) compileScript(descriptor, { id: relative })
    const result = compileTemplate({
      source: descriptor.template.content,
      filename: filename.pathname,
      id: relative,
    })
    assert.deepEqual(result.errors, [])
  }
})
