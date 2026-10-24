import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref, watch } from 'vue'

test('Team AI opens the existing available editor without executing writes', async () => {
  const vue = readFileSync(
    new URL(
      '../runtime/workspace/components/Team/Single.vue',
      import.meta.url
    ),
    'utf8'
  )
  const source = vue
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  let exposed,
    writes = 0,
    prepared
  const props = {
    available: ['read', 'update', 'delete'],
    members: [{ id: 'a', name: 'Before' }],
    selectedMemberId: 'a',
    updateMember: async () => {
      writes++
    },
    removeMember: async () => {
      writes++
      return { name: 'Before' }
    },
  }
  const state = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn { form, editOpen }`,
    ['computed', 'ref', 'watch', 'defineProps', 'defineExpose', 'useToast']
  )(
    computed,
    ref,
    watch,
    () => props,
    (value) => {
      exposed = value
    },
    () => ({ add() {} })
  )
  state.form.value = {
    prepare: (value) => {
      prepared = value
    },
  }
  exposed.openAction({ action: 'update', name: 'Alex', message: '' })
  exposed.openAction({ action: 'delete', name: '', message: '' })
  assert.equal(prepared, 'Alex')
  assert.equal(writes, 0)
  assert.equal(state.editOpen.value, true)
  state.editOpen.value = false
  props.available = []
  exposed.openAction({ action: 'update', name: 'Blocked', message: '' })
  assert.equal(state.editOpen.value, false)
  assert.equal(prepared, 'Alex')
  assert.equal(writes, 0)
})
