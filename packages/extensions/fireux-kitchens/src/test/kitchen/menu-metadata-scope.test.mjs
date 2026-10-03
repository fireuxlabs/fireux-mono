import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed, watch } from 'vue'
function load(path,deps,result,vue=false){deps=commandScopeDeps(deps);let source=readFileSync(new URL(path,import.meta.url),'utf8');if(vue)source=source.split('<script setup lang="ts">')[1].split('</script>')[0];source=source.replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'');return compileFunction(`${stripTypeScriptTypes(source)};return ${result}`,Object.keys(deps))(...Object.values(deps))}
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}}
function scope(currentUser,disposed=[]){return load('../../runtime/menu/composables/useMenuEditorScope.ts',{watch,onBeforeUnmount:fn=>disposed.push(fn),useAuth:()=>({currentUser})},'useMenuEditorScope')}

test('Menu metadata/rename/Delete preserve target across waits and reject scope roundtrips',async()=>{
 for(const action of ['update','rename','delete'])for(const stage of ['auth','token','response'])for(const change of ['stable','account','kitchen','route','logout','dispose']){
  const auth=deferred(),token=deferred(),response=deferred(),calls=[],disposed=[]
  const user={uid:'u',getIdToken:()=>token.promise},currentUser=ref(user),selectedId=ref('k'),routePath=ref('/menus/m')
  const useMenuMutation=load('../../runtime/menu/composables/firestore/mutations/useMenuMutation.ts',{useRoute:()=>({get fullPath(){return routePath.value}}),useAuth:()=>({currentUser}),useRequireUser:()=>auth.promise,useWorkspaceWriteGuard:()=>({requireWritableData(){}}),useKitchenWorkspaceSelection:()=>({selectedId}),useMenuEditorScope:scope(currentUser,disposed),$fetch:(...args)=>{calls.push(args);return response.promise}},'useMenuMutation')
  const name=action==='delete'?'useMenuDelete':'useMenuUpdate',api=load(`../../runtime/menu/composables/firestore/mutations/${name}.ts`,{useMenuMutation},name)()
  const changes={description:'Original',doc:{url:'u',name:'n',type:'t',storage_path:'p'}}
  const expected=action==='update'?{kitchenId:'k',menuId:'m',changes:structuredClone(changes)}:action==='rename'?{kitchenId:'k',menuId:'m',name:'Dinner'}:{kitchenId:'k',menuId:'m'}
  const pending=action==='update'?api.updateMenu('k','m',changes):action==='rename'?api.renameMenu('k','m','Dinner'):api.deleteMenu('k','m'),done=change==='stable'||stage==='response'?pending:assert.rejects(pending,/changed/)
  if(stage!=='auth'){auth.resolve(user);await Promise.resolve()}
  if(stage==='response'){token.resolve('token');await Promise.resolve()}
  changes.doc.url='Changed'
  if(change==='kitchen'){selectedId.value='b';selectedId.value='k'}else if(change==='route'){routePath.value='/menus/b';routePath.value='/menus/m'}else if(change==='dispose')disposed.forEach(fn=>fn());else if(change==='account'||change==='logout'){currentUser.value=change==='logout'?null:{uid:'b'};currentUser.value=user}
  auth.resolve(user);token.resolve('token');response.resolve({id:'m',slug:'dinner',kitchenId:'k',menuId:'m'});await done
  assert.equal(calls.length,change==='stable'||stage==='response'?1:0);if(calls.length)assert.deepEqual(calls[0][1].body,expected)
 }
})
test('Details and Delete ignore stale error/success before navigation or notification',async()=>{
 for(const action of ['rename','updateDescription','updateOrder','deleteSelectedMenu'])for(const changed of [false,true])for(const failed of [false,true]){
 const pending=deferred(),notices=[],destinations=[],currentUser=ref({uid:'u'}),kitchenId=ref('k'),menuId=ref('m'),menuSlug=ref('food')
 const deps={ref,computed,useMenuEditorScope:scope(currentUser),useKitchenMenuRecordContext:()=>({menu:ref({id:'m',name:'Food'}),menuId,menuSlug,kitchenId,canWrite:ref(true),deleteMenu:()=>pending.promise,subscription:ref('premium'),updateMenu:()=>pending.promise,renameMenu:()=>pending.promise}),useMenuDelete:()=>({deleteMenu:()=>pending.promise}),useToastify:()=>({add:x=>notices.push(x)}),useRouter:()=>({replace:async x=>destinations.push(x)}),navigateTo:async x=>destinations.push(x),window:{confirm:()=>true}}
 const isDelete=action==='deleteSelectedMenu',api=load(`../../runtime/kitchen/components/Workspace/Menus/${isDelete?'Delete':'Edit/Details'}.vue`,deps,isDelete?'({deleteSelectedMenu,deleting})':'({rename,updateDescription,updateOrder})',true)
 const result=api[action](action==='updateOrder'?'2':'Dinner'),done=failed&&!changed&&!isDelete?assert.rejects(result,/Failure/):result
 if(changed){menuId.value='other';menuId.value='m'}
 if(isDelete&&changed)api.deleting.value=true
 failed?pending.reject(Error('Failure')):pending.resolve({id:'m',slug:'dinner'});await done
 assert.equal(destinations.length,0)
 assert.equal(notices.length,!changed&&failed&&isDelete?1:0)
 if(isDelete&&changed)assert.equal(api.deleting.value,true)
 }
})

test('Surviving Record context completes own live rename/delete but rejects external routed intent',async()=>{
 for(const action of ['rename','delete'])for(const change of ['own-live','route','account','kitchen','dispose']){
 const pending=deferred(),currentUser=ref({uid:'u'}),kitchenId=ref('k'),menuSlug=ref('food'),recordMenu=ref({id:'m',name:'Food'}),recordOutcome=ref('ready'),disposed=[],destinations=[],notices=[]
 const sourceRead=Object.assign(ref(null),{pending:ref(false),error:ref(null)})
 const api=load('../../runtime/kitchen/composables/workspace/menus/useKitchenMenuRecordContext.ts',{
 computed,useRouter:()=>({replace:async x=>destinations.push(x)}),useToastify:()=>({add:x=>notices.push(x)}),useMenuEditorScope:scope(currentUser,disposed),useMenuDelete:()=>({deleteMenu:()=>pending.promise}),useMenuUpdate:()=>({renameMenu:()=>pending.promise}),useAppSession:()=>({uid:ref('u'),appUser:ref({role:'user'}),pending:ref(false),error:ref(null)}),useFireUXConfig:()=>({appId:'app'}),useWorkspace:()=>({selectedId:kitchenId}),useKitchenAccess:()=>({ids:ref(['k']),pending:ref(false),error:ref(null)}),useRouteParam:()=>menuSlug,useKitchenRead:()=>({kitchen:ref({}),place:ref({}),outcome:ref('ready'),error:ref(null)}),useKitchenInterface:()=>({surface:()=>({})}),readRuntimeFirestoreDatabaseId:()=> 'db',useKitchenMenuRead:()=>({menu:recordMenu,outcome:recordOutcome,error:ref(null)}),useFirestoreRead:()=>({firestoreFetchDoc:()=>sourceRead}),useMenuSectionCollection:()=>({sections:ref([]),pending:ref(false),error:ref(null),collectionPath:ref('')}),useMenuSectionMutations:()=>({}),useMenuPublication:()=>({}),MenuSourceUploadStorage:{collection:'sources'},readKitchenCurrency:()=> 'CHF',kitchenMenuOrdering:()=>({})
 },'createKitchenMenuRecordContext')()
 const result=action==='rename'?api.renameMenu('k','m','Dinner'):api.deleteMenu('k','m')
 recordMenu.value=null;recordOutcome.value='missing';assert.equal(api.menu.value,null);assert.equal(api.menuId.value,'')
 if(change==='route'){menuSlug.value='other';menuSlug.value='food'}else if(change==='kitchen'){kitchenId.value='other';kitchenId.value='k'}else if(change==='account'){currentUser.value=null;currentUser.value={uid:'u'}}else if(change==='dispose')disposed.forEach(fn=>fn())
 pending.resolve({id:'m',slug:'dinner'});await result
 assert.deepEqual(destinations,change==='own-live'?[action==='rename'?'/workspace/kitchen/menus/dinner':'/workspace/kitchen/menus']:[])
 assert.equal(notices.length,change==='own-live'?1:0)
 }
})
