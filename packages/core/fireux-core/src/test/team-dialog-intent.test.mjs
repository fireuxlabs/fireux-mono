import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref } from 'vue'

test('Team AI prepares a name without executing writes; removal requires an available focused member', async () => {
  const vue = readFileSync(
    new URL(
      '../runtime/components/Workspace/Team/Single.vue',
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
    `${stripTypeScriptTypes(source)}\nreturn { form, remove, error }`,
    ['computed', 'ref', 'defineProps', 'defineExpose', 'useToast']
  )(
    computed,
    ref,
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
  props.available = []
  await state.remove()
  assert.equal(writes, 0)
  props.available = ['delete']
  props.removeMember = async () => {
    throw new Error('Connection failed')
  }
  await state.remove()
  assert.equal(state.error.value, 'Connection failed')
})
