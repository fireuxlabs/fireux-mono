import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import { computed, ref, watch, watchEffect, effectScope, onScopeDispose, reactive } from 'vue'
const load = (path, name, deps) => {
 const source=readFileSync(new URL(path,import.meta.url),'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'')
 return compileFunction(`${stripTypeScriptTypes(source)};return ${name}`,Object.keys(deps))(...Object.values(deps))
}
const useCommandScope=load('../runtime/composables/fireux/commands/useCommandScope.ts','useCommandScope',{watch,onScopeDispose})
const paths={project:'../../../../ecosystem/fireux-fireux/src/runtime/project/composables/useProjectTeam.ts',kitchen:'../../../../extensions/fireux-kitchens/src/runtime/kitchen/composables/team/useKitchenTeam.ts',supplier:'../../../../extensions/fireux-suppliers/src/runtime/supplier/composables/useSupplierTeam.ts',portfolio:'../../../../extensions/fireux-properties/src/runtime/portfolio/composables/usePortfolioTeam.ts',property:'../../../../extensions/fireux-properties/src/runtime/property/composables/usePropertyTeam.ts'}
export function teamControllerFixture(domain) {
 const id=ref('a'), currentUser=ref({uid:'actor'}), appUser=ref({subscription:'free'}), config=reactive({appId:'app',subscriptionCapacity:{}})
 const calls=[],selected=[];let credentials=Promise.resolve(), response=Promise.resolve({ok:true,memberId:'created',name:'New'})
 const rows=Object.assign(ref([]),{pending:ref(false),error:ref(undefined),outcome:ref('empty')}), workspace={id,data:computed(()=>({id:id.value,identity:{name:'Project'}})),outcome:ref('ready')}
 const deps={computed,watchEffect,useCommandScope,useAuth:()=>({currentUser,hasAuthState:ref(true)}),useAppSession:()=>({appUser,pending:ref(false),error:ref(null)}),useFireUXConfig:()=>config,
 useRequireUser:async()=>({uid:currentUser.value.uid,getIdToken:()=>credentials.then(()=>'token')}),
 $fetch:(url,options)=>{calls.push({url,options});return response},
 useLiveAsyncData:()=>({data:computed(()=>({[domain+'Id']:id.value,project_id:id.value,canManageTeam:true,members:[]})),pending:ref(false),error:ref(null),refresh:async()=>{}}),
 useTeam:()=>({members:rows,canCreateTeamMember:ref(true),selectedTeamMemberId:ref('member'),selectedTeamMember:ref(null),derived:ref({}),selectCreated:value=>selected.push(value),select(){}}),
 useWorkspacePageState:()=>({publish(){}}),useWorkspaceWriteGuard:()=>({requireWritableData(){}}),
 useKitchenMemberInvitationCreate:()=>({createKitchenMemberInvitation(){}}),useKitchenChildCollection:()=>({items:rows,pending:ref(false),error:ref(null)}),
 useFirestoreRead:()=>({firestoreFetchCollection:()=>rows}),readRuntimeFirestoreDatabaseId:()=>'',normalizeString:value=>String(value||''),kitchenTeamMemberLimit:()=>5,appSubscriptionCapacity:()=>5,
 ['use'+domain[0].toUpperCase()+domain.slice(1)+'Workspace']:()=>workspace}
 const scope=effectScope(),controller=scope.run(()=>load(paths[domain],'use'+domain[0].toUpperCase()+domain.slice(1)+'Team',deps)())
 return {id,currentUser,appUser,config,scope,controller,calls,selected,wait:promise=>{credentials=promise},respond:promise=>{response=promise}}
}
for(const domain of Object.keys(paths)) {
 for(const action of ['create','update','delete']) for(const changed of ['entity','account','membership','app','disposed']) test(`${domain}: ${action} ${changed} change prevents delayed Team dispatch`,async()=>{
  const f=teamControllerFixture(domain);let release;f.wait(new Promise(resolve=>release=resolve))
  const pending=f.controller.primitives[action](action === 'delete' ? 'member' : {memberId:'member',name:'New'});await Promise.resolve();await Promise.resolve()
  if(changed==='entity'){f.id.value='b';f.id.value='a'}
  if(changed==='account')f.currentUser.value={uid:'other'}
  if(changed==='membership')f.appUser.value={subscription:'plus'}
  if(changed==='app'){f.config.appId='other';f.config.appId='app'}
  if(changed==='disposed')f.scope.stop()
  release();await assert.rejects(pending,/context changed/);assert.equal(f.calls.length,0);f.scope.stop()
 })
 test(`${domain}: immutable input and obsolete completion never focus another Workspace`,async()=>{
  const f=teamControllerFixture(domain);let releaseToken,releaseResult;f.wait(new Promise(r=>releaseToken=r));f.respond(new Promise(r=>releaseResult=r))
  const input={name:'Original'},pending=f.controller.primitives.create(input);input.name='Changed';releaseToken()
  while(!f.calls.length)await Promise.resolve()
  assert.equal(f.calls[0].options.body.name.trim(),'Original')
  f.id.value='b';releaseResult({ok:true,memberId:'created',name:'Original'});await pending;assert.deepEqual(f.selected,[]);f.scope.stop()
 })
}
