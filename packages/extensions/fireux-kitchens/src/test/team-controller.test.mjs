import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, effectScope, nextTick, ref, watchEffect, watch, onScopeDispose } from 'vue'
const source = readFileSync(new URL('../runtime/kitchen/composables/team/useKitchenTeam.ts', import.meta.url), 'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
function fixture() {
  const kitchenId = ref('pizza')
  const members = ref([{id: 'a', name: 'A', user_id: '', role_ids: []}])
  const allowed = ref(true)
  let finishCreate, finishDelete, shared
  const sharedSource = readFileSync(new URL('../../../../core/fireux-core/src/runtime/workspace/composables/useWorkspaceTeam.ts', import.meta.url), 'utf8').replace(/^import[^\n]*\n/gm, '').replace(/^export /gm, '')
  const useSharedTeam = compileFunction(`${stripTypeScriptTypes(sharedSource)}; return useWorkspaceTeam`, ['computed','ref','watchEffect','defineWorkspaceCapabilityContext'])(computed,ref,watchEffect,x=>x)
  const commandScopeSource = readFileSync(new URL('../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts', import.meta.url), 'utf8').replace(/^import[^\n]*\n/gm, '').replace(/^export /gm, '')
  const useCommandScope = compileFunction(`${stripTypeScriptTypes(commandScopeSource)}; return useCommandScope`, ['watch', 'onScopeDispose'])(watch, onScopeDispose)
  const deps = { useCommandScope,
    computed, watchEffect,
    useWorkspaceWriteGuard: () => ({requireWritableData(){}}),
    useRequireUser: async () => ({uid:'actor',getIdToken: async () => 'test'}),
    $fetch: (_url, options) => options.method === 'POST' ? new Promise(resolve=>finishCreate=resolve) : options.method === 'DELETE' ? new Promise(resolve=>finishDelete=resolve) : Promise.resolve({ok:true,memberId:'a',name:'A'}),
    useAppSession: () => ({appUser: ref({subscription:'free'}), error: ref(null)}),
    useAuth: () => ({currentUser: ref({uid:'actor'}), hasAuthState: ref(true)}),
    useFireUXConfig: () => ({subscriptionCapacity:{}}),
    readRuntimeFirestoreDatabaseId: () => 'misebox',
    normalizeString: x => String(x || ''),
    kitchenTeamMemberLimit: () => 3,
    useKitchenWorkspace: () => ({data:computed(()=>({id:kitchenId.value,identity:{display_name:'Kitchen'}})), outcome:ref('ready')}),
    useKitchenChildCollection: () => ({items:members,pending:ref(false),error:ref(null)}),
    useLiveAsyncData: () => ({data:computed(()=>({kitchenId:kitchenId.value,canManageTeam:true,members:[]})),error:ref(null)}),
    useWorkspaceTeam: options => {shared=useSharedTeam(options);return {...shared,canCreateTeamMember:allowed}},
    useWorkspacePageState: () => ({publish(){}}),
    useKitchenMemberInvitationCreate: () => ({createKitchenMemberInvitation:async()=>({link:'test'})}),
  }
  const make=compileFunction(`${stripTypeScriptTypes(source)}; return useKitchenTeam`,Object.keys(deps))(...Object.values(deps))
  const scope=effectScope();const controller=scope.run(make)
  const team={...shared,kitchenId,selectableTeamMembers:members,canCreateTeamMember:allowed}
  return {team,controller,scope,started:async()=>{while(!finishCreate)await Promise.resolve()},created:async()=>{while(!finishCreate)await Promise.resolve();const resolve=finishCreate;finishCreate=undefined;resolve({ok:true,memberId:'b',name:'B'})},deleted:async()=>{while(!finishDelete)await Promise.resolve();const resolve=finishDelete;finishDelete=undefined;resolve({ok:true,name:'A'})}}
}
test('creation focuses the returned live member, and rejects creation when unavailable',async()=>{
 const f=fixture()
 try {
  f.team.canCreateTeamMember.value=false
  await assert.rejects(f.controller.primitives.create({name:'B'}),/not available/)
  f.team.canCreateTeamMember.value=true
  const pending=f.controller.primitives.create({name:'B'});f.created();await pending
  f.team.selectableTeamMembers.value.push({id:'b',name:'B',user_id:''});await nextTick()
  assert.equal(f.team.selectedTeamMemberId.value,'b')
 }finally{f.scope.stop()}
})
test('delayed mutations do not change a newer kitchen or person selection',async()=>{
 const f=fixture()
 try {
  const pending=f.controller.primitives.delete('a')
  f.team.selectableTeamMembers.value.push({id:'different',name:'Other',user_id:'',role_ids:[]});f.team.selectedTeamMemberId.value='different';f.deleted();await pending
  assert.equal(f.team.selectedTeamMemberId.value,'different')
  const creating=f.controller.primitives.create({name:'B'})
  await f.started()
  f.team.kitchenId.value='burger';f.created();await creating;await nextTick()
  assert.equal(f.team.selectedTeamMemberId.value,'different')
 }finally{f.scope.stop()}
})
