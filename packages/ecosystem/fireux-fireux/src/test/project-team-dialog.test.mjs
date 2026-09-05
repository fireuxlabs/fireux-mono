import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(new URL('../runtime/components/workspace/Project/Team/AI.vue', import.meta.url), 'utf8').split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import.*\n/gm, '')
function harness(available) {
  const emitted = []
  const api = compileFunction(`${stripTypeScriptTypes(source)}; return { submit, prompt, message }`, ['ref', 'computed', 'defineProps', 'defineEmits'])(value => ({ value }), getter => ({ get value() { return getter() } }), () => ({ team: { derived: { value: { capability: { availableActions: available } } } } }), () => (...args) => emitted.push(args))
  return { ...api, emitted }
}
test('Project Team shortcuts open human dialogs without invoking mutations', () => {
  const h = harness(['create', 'read', 'update', 'delete'])
  for (const [prompt, action] of [['Create a Team member', 'create'], ['Read the Project Team', 'read'], ['Rename the selected member to Alex', 'update'], ['Deactivate the selected member', 'delete']]) {
    h.prompt.value = prompt; h.submit()
    assert.equal(h.emitted.at(-1)[0], 'action')
    assert.equal(h.emitted.at(-1)[1].action, action)
  }
  assert.equal(h.emitted[2][1].name, 'Alex')
})
test('unavailable and unsupported actions do not open a dialog', () => {
  const h = harness(['read'])
  h.prompt.value = 'Create a Team member'; h.submit()
  h.prompt.value = 'Remove everyone'; h.submit()
  assert.equal(h.emitted.length, 0)
})
