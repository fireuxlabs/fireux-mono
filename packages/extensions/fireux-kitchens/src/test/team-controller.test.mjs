import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, effectScope, nextTick, ref, watchEffect } from 'vue'
const source = readFileSync(new URL('../runtime/kitchen/composables/workspace/team/useKitchenWorkspaceTeam.ts', import.meta.url), 'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
function fixture() {
  const team = { kitchenId: ref('pizza'), selectedKitchen: ref({id:'pizza',identity:{display_name:'Pizza'}}), selectableTeamMembers: ref([{ id:'a',name:'A',user_id:'',role:'member',status:'active' }]), selectedTeamMemberId:ref('a'), memberAvatarById:ref(new Map()), error:ref(null), pending:ref(false), canWrite:ref(true), canCreateTeamMember:ref(true), teamMemberLimit:ref(3) }
  let finishCreate, finishDelete
  const make = compileFunction(`${stripTypeScriptTypes(source)}; return useKitchenWorkspaceTeam`, ['computed','ref','watchEffect','useKitchenTeamData','useWorkspacePageState','defineWorkspaceCapabilityContext','normalizeString','useKitchenMemberInvitationCreate','useKitchenTeamMemberDelete','useKitchenTeamMemberUpdate','useKitchenTeamMemberCreate'])(computed,ref,watchEffect,()=>team,()=>({publish(){}}),x=>x,x=>String(x||''),()=>({createKitchenMemberInvitation:async()=>({link:'test'})}),()=>({deleteKitchenTeamMember:()=>new Promise(resolve=>finishDelete=resolve)}),()=>({updateKitchenTeamMember:async input=>input}),()=>({createKitchenTeamMember:()=>new Promise(resolve=>finishCreate=resolve)}))
  const scope=effectScope(); const controller=scope.run(make)
  return {team,controller,scope,created:()=>finishCreate({memberId:'b',name:'B'}),deleted:()=>finishDelete({name:'A'})}
}
test('creation focuses the returned live member, and rejects creation when unavailable',async()=>{
 const f=fixture()
 try {
  f.team.canCreateTeamMember.value=false
  await assert.rejects(f.controller.primitives.create({name:'B'}),/not available/)
  f.team.canCreateTeamMember.value=true
  const pending=f.controller.primitives.create({name:'B'});f.created();await pending
  f.team.selectableTeamMembers.value.push({id:'b',name:'B',role:'member',status:'active',user_id:''});await nextTick()
  assert.equal(f.team.selectedTeamMemberId.value,'b')
 }finally{f.scope.stop()}
})
test('delayed mutations do not change a newer kitchen or person selection',async()=>{
 const f=fixture()
 try {
  const pending=f.controller.primitives.delete('a')
  f.team.selectedTeamMemberId.value='different';f.deleted();await pending
  assert.equal(f.team.selectedTeamMemberId.value,'different')
  const creating=f.controller.primitives.create({name:'B'})
  f.team.kitchenId.value='burger';f.created();await creating;await nextTick()
  assert.equal(f.team.selectedTeamMemberId.value,'different')
 }finally{f.scope.stop()}
})
