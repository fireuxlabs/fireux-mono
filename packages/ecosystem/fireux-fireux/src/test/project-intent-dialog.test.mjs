import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(new URL('../runtime/components/workspace/Project/Intent.vue', import.meta.url), 'utf8').split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
function harness(request) {
  const emitted = []
  const props = { scopeKey: 'p:member', availableActions: ['update'], request }
  let unmount
  const api = compileFunction(`${stripTypeScriptTypes(source)}; return { submit, prompt, message, submitting }`, ['ref', 'onBeforeUnmount', 'defineProps', 'defineEmits'])(value => ({ value }), fn => { unmount = fn }, () => props, () => (...args) => emitted.push(args))
  api.prompt.value = 'Rename this person'
  return { ...api, emitted, props, unmount: () => unmount() }
}
test('model intent prepares one human dialog and never invokes a writer', async () => {
  const h = harness(async () => ({ action: 'update', name: 'Alex', message: '' }))
  await h.submit()
  assert.equal(h.emitted[0][0], 'action'); assert.equal(h.emitted[0][1].name, 'Alex')
  assert.equal(h.submitting.value, false)
})
test('stale workspace/selection and unavailable actions cannot open a dialog', async () => {
  let resolve
  const h = harness(() => new Promise(done => { resolve = done }))
  const pending = h.submit(); h.props.scopeKey = 'different'; resolve({ action: 'update', name: 'Alex', message: '' }); await pending
  assert.equal(h.emitted.length, 0)
  h.props.request = async () => ({ action: 'delete', message: '' }); await h.submit()
  assert.equal(h.emitted.length, 0)
})
test('unmount and provider failure leave no dangling mutation or busy state', async () => {
  const h = harness(async () => { throw new Error('Provider unavailable') })
  await h.submit(); assert.match(h.message.value, /Provider unavailable/); assert.equal(h.submitting.value, false)
  h.unmount(); h.props.request = async () => ({ action: 'update', name: 'Alex', message: '' }); await h.submit(); assert.equal(h.emitted.length, 0)
})
