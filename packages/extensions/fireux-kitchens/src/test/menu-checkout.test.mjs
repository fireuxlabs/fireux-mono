import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch, reactive, effectScope, nextTick } from 'vue'

const source = readFileSync(
  new URL(
    '../runtime/menu/composables/order/useMenuCheckout.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const useMenuCheckout = compileFunction(
  `${stripTypeScriptTypes(source)}; return useMenuCheckout`,
  ['computed', 'ref', 'watch', 'menuOrderPaymentOptions']
)(computed, ref, watch, ({ paymentMethods }) =>
  paymentMethods.map((value) => ({ value }))
)

function checkout(options = {}) {
  const props = reactive({
    open: true,
    orderType: 'collection',
    paymentMethods: ['pay_later'],
    requiredContactFields: ['name'],
    ...options,
  })
  const sent = []
  const scope = effectScope()
  const state = scope.run(() =>
    useMenuCheckout(props, (input) => sent.push(input))
  )
  return { props, sent, state, scope }
}

test('checkout requires contact, allergy acknowledgement and payment before submitting trimmed details', () => {
  const { state, sent, scope } = checkout()
  try {
    state.submit()
    assert.match(state.validationError.value, /Add your name/)
    state.name.value = ' Alex '
    state.phone.value = ' 123 '
    state.submit()
    assert.equal(state.validationError.value, state.allergyValidationMessage)
    state.allergyAcknowledged.value = true
    state.paymentMethod.value = undefined
    state.submit()
    assert.match(state.validationError.value, /Choose when/)
    assert.equal(sent.length, 0)
    state.paymentMethod.value = 'pay_later'
    state.submit()
    assert.deepEqual(sent, [
      { name: 'Alex', phone: '123', email: '', paymentMethod: 'pay_later' },
    ])
  } finally {
    scope.stop()
  }
})

test('reopening resets allergy acknowledgement and reconciles changed payment options', async () => {
  const { props, state, scope } = checkout({ requiredContactFields: [] })
  try {
    state.allergyAcknowledged.value = true
    props.open = false
    await nextTick()
    props.paymentMethods = ['online_card']
    props.open = true
    await nextTick()
    assert.equal(state.allergyAcknowledged.value, false)
    assert.equal(state.paymentMethod.value, 'online_card')
    props.paymentMethods = []
    await nextTick()
    assert.equal(state.paymentMethod.value, undefined)
  } finally {
    scope.stop()
  }
})
