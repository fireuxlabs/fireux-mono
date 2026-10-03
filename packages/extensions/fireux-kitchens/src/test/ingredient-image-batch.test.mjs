import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const component = readFileSync(
  new URL('../runtime/ingredient/components/Image/Batch.vue', import.meta.url),
  'utf8'
)
const source = stripTypeScriptTypes(
  component.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
).replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
function setup(generate, admin = true) {
  let unmount
  const props = {
    ingredients: [
      { id: 'saved', image_url: 'existing' },
      { id: 'carrot' },
      { id: 'leek' },
    ],
  }
  return compileFunction(
    `${source};return {start,completed,running,stopRequested,unmount:()=>unmountCallback()}`,
    [
      'defineProps',
      'watch',
      'computed',
      'ref',
      'onBeforeUnmount',
      'useUserSession',
      'useIngredientImageGeneration',
      'unmountCallback',
    ]
  )(
    () => props,
    () => {},
    (fn) => ({
      get value() {
        return fn()
      },
    }),
    (value) => ({ value }),
    (fn) => {
      unmount = fn
    },
    () => ({ isAdmin: { value: admin } }),
    () => ({ generate, error: { value: '' }, captureIntent:()=>()=>true, scopeEpoch:{value:0} }),
    () => unmount()
  )
}
test('batch ignores existing images and stops at a failed command', async () => {
  const called = []
  const batch = setup(async (id) => {
    called.push(id)
    return undefined
  })
  await batch.start()
  assert.deepEqual(called, ['carrot'])
  assert.equal(batch.completed.value, 0)
  assert.equal(batch.running.value, false)
})
test('repeated clicks cannot start another batch; stop waits for the current image', async () => {
  const called = []
  let finish
  const batch = setup((id) => {
    called.push(id)
    return new Promise((resolve) => {
      finish = resolve
    })
  })
  const run = batch.start()
  await batch.start()
  batch.stopRequested.value = true
  finish({ image_url: 'generated' })
  await run
  assert.deepEqual(called, ['carrot'])
  assert.equal(batch.completed.value, 1)
})
test('leaving the page stops further generation and non-admins cannot start', async () => {
  let finish
  const called = []
  const batch = setup((id) => {
    called.push(id)
    return new Promise((resolve) => {
      finish = resolve
    })
  })
  const run = batch.start()
  batch.unmount()
  finish({ image_url: 'generated' })
  await run
  await setup(async (id) => {
    called.push(id)
  }, false).start()
  assert.deepEqual(called, ['carrot'])
})
