import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  nextTick,
  ref,
  toValue,
  watch,
  watchEffect,
} from 'vue'

function load(relativePath, name, dependencies) {
  const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8')
    .replace(/^import .* from .+\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

test('Freemium is shown only for free plans at top or discovery, with configured allowance copy', () => {
  const source = readFileSync(
    new URL('../runtime/workspace/components/Freemium.vue', import.meta.url),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import .* from .+\n/gm, '')
  const props = {
    family: 'kitchen',
    capability: 'test',
    usedCount: 0,
    pageLabel: 'Test',
    placement: 'top',
  }
  const session = {
    appUser: ref({ subscription: 'free' }),
    pending: ref(false),
    error: ref(undefined),
  }
  const config = {
    subscriptionCapacity: {
      kitchen: { free: 1, premium: 1, business: null },
      'kitchen.test': { free: 2, premium: 10, business: null },
    },
  }
  const make = () =>
    compileFunction(
      `${stripTypeScriptTypes(source)}\nreturn { visible, currentAllowance, upgradeAllowance }`,
      ['computed', 'defineProps', 'useAppSession', 'useFireUXConfig']
    )(
      computed,
      () => props,
      () => session,
      () => config
    )
  let card = make()
  assert.equal(card.visible.value, true)
  assert.match(card.currentAllowance.value, /2 Test records remaining/)
  assert.match(card.upgradeAllowance.value, /Premium supports up to 10/)
  session.appUser.value.subscription = 'premium'
  assert.equal(card.visible.value, false)
  props.placement = 'bottom'
  card = make()
  assert.equal(card.visible.value, false)
  assert.match(card.upgradeAllowance.value, /Business supports unlimited/)
  session.appUser.value.subscription = 'business'
  assert.equal(card.visible.value, false)
  session.appUser.value.subscription = 'free'
  assert.equal(card.visible.value, false)
  props.placement = 'discovery'
  card = make()
  assert.equal(card.visible.value, true)
  props.capability = 'landing'
  props.placement = 'top'
  card = make()
  assert.match(card.currentAllowance.value, /1 workspace\./)
  assert.match(
    card.upgradeAllowance.value,
    /Business supports unlimited workspaces/
  )
  session.pending.value = true
  assert.equal(card.visible.value, false)
})
