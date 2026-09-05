import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref } from 'vue'
test('AI intents prepare the same Team dialogs without executing mutations', () => {
  const vue = readFileSync(new URL('../runtime/components/Workspace/Team/Crud.vue', import.meta.url), 'utf8')
  const source = vue.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1].replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  let exposed, writes = 0
  const props = { available: ['read', 'update', 'delete'], members: [{ id: 'a', name: 'Before', role: 'member' }], selectedMemberId: 'a', updateMember: () => { writes++ }, deactivateMember: () => { writes++ } }
  const state = compileFunction(`${stripTypeScriptTypes(source)}\nreturn { readOpen, editOpen, editName, deleteOpen }`, ['computed', 'ref', 'defineProps', 'defineEmits', 'defineExpose', 'useToast'])(computed, ref, () => props, () => () => {}, value => { exposed = value }, () => ({ add() {} }))
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
})
