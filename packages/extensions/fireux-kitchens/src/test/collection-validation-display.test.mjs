import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, reactive } from 'vue'
const source = readFileSync(new URL('../runtime/menu/components/Selection/Checkout.vue', import.meta.url), 'utf8')
function checkout(issues) {
  let attempts = 0
  const flow = reactive({ issues, submit: () => { attempts++ } })
  const script = source.split('<script setup lang="ts">')[1].split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const state = compileFunction(`${stripTypeScriptTypes(script)}; return {touched, visibleIssues, blocked, submit}`, ['computed','ref','defineProps'])(computed,ref,()=>({flow}))
  return { ...state, flow, attempts:()=>attempts }
}
const required = ['Customer name is required.', 'Contact phone is required.']
test('required messages wait for blur or an attempt while validation stays in the flow', () => {
  const form = checkout([...required])
  assert.deepEqual(form.visibleIssues.value, [])
  assert.equal(form.blocked.value, false)
  form.touched.value.name = true
  assert.deepEqual(form.visibleIssues.value, [required[0]])
  form.submit()
  assert.deepEqual(form.visibleIssues.value, required)
  assert.equal(form.attempts(),1)
  form.flow.issues.splice(0,1)
  assert.deepEqual(form.visibleIssues.value,[required[1]])
})
test('service and catalogue blockers remain visible and prevent the submit button', () => {
  const closed = 'Collection is closed for one or more items. Please order during serving hours.'
  const form = checkout([...required, closed])
  assert.deepEqual(form.visibleIssues.value,[closed])
  assert.equal(form.blocked.value,true)
  assert.equal(form.attempts(),0)
  assert.match(source, /@submit.prevent="submit"/)
  assert.match(source, /:disabled="blocked"/)
})
