import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref, watch } from 'vue'
test('AI intents prepare domain-configured Team dialogs without executing mutations', async () => {
  const vue = readFileSync(
    new URL('../runtime/components/Workspace/Team/Crud.vue', import.meta.url),
    'utf8'
  )
  const source = vue
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  let exposed,
    writes = 0
  const props = {
    available: ['read', 'update', 'delete'],
    members: [{ id: 'a', name: 'Before' }],
    selectedMemberId: 'a',
    updateMember: () => {
      writes++
    },
    removeMember: () => {
      writes++
    },
  }
  const state = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn { readOpen, editOpen, editName, deleteOpen, saveMember, removeMember, editError, deleteError }`,
    [
      'inject',
      'watch',
      'computed',
      'ref',
      'defineProps',
      'defineEmits',
      'defineExpose',
      'useToast',
    ]
  )(
    (_key, fallback) => fallback,
    watch,
    computed,
    ref,
    () => props,
    () => () => {},
    (value) => {
      exposed = value
    },
    () => ({ add() {} })
  )
  exposed.openAction({ action: 'read', name: '', message: '' })
  assert.equal(state.readOpen.value, true)
  exposed.openAction({ action: 'update', name: 'Alex', message: '' })
  assert.equal(state.editOpen.value, true)
  assert.equal(state.editName.value, 'Alex')
  exposed.openAction({ action: 'delete', name: '', message: '' })
  assert.equal(state.deleteOpen.value, true)
  assert.equal(writes, 0)
  state.deleteOpen.value = false
  props.available = ['read']
  exposed.openAction({ action: 'delete', name: '', message: '' })
  assert.equal(state.deleteOpen.value, false)
  props.available = ['update']
  props.members[0].id = 'protected'
  props.selectedMemberId = 'protected'
  exposed.openAction({
    action: 'update',
    name: 'Safe rename',
    role: 'reviewer',
    message: '',
  })
  let saved
  props.updateMember = async (input) => {
    saved = input
  }
  await state.saveMember()
  assert.deepEqual(saved, { memberId: 'protected', name: 'Safe rename' })
  saved = undefined
  props.available = []
  await state.saveMember()
  assert.equal(saved, undefined)
  assert.match(state.editError.value, /no longer/)
  props.available = ['update', 'delete']
  exposed.openAction({ action: 'delete', name: '', message: '' })
  props.selectedMemberId = 'another-member'
  await state.removeMember()
  assert.equal(writes, 0)
  assert.match(state.deleteError.value, /no longer/)
  props.selectedMemberId = 'protected'
  props.removeMember = async () => {
    throw new Error('Connection failed')
  }
  await state.removeMember()
  assert.equal(state.deleteOpen.value, true)
  assert.equal(state.deleteError.value, 'Connection failed')
  props.removeMember = async () => ({ name: 'Safe rename' })
  await state.removeMember()
  assert.equal(state.deleteOpen.value, false)
})
