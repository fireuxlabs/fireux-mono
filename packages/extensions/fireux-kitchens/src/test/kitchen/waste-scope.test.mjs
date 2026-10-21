import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref,computed,watch } from 'vue'
function load(path,deps,result,vue=false){deps=commandScopeDeps(deps);let source=readFileSync(new URL(path,import.meta.url),'utf8');if(vue)source=source.split('<script setup lang="ts">')[1].split('</script>')[0];source=source.replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'');return compileFunction(`${stripTypeScriptTypes(source)};return ${result}`,Object.keys(deps))(...Object.values(deps))}
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}}
const observation={item_name:'Bread',quantity:1,unit:'piece',reason:'other',source:'other'}
test('Waste snapshots its observation and guards scope across auth/token/response',async()=>{
 for(const stage of ['auth','token','response'])for(const change of ['stable','account','kitchen','route','logout','dispose']){
  const auth=deferred(),token=deferred(),response=deferred(),calls=[],disposed=[]
  const user={uid:'u',getIdToken:()=>token.promise},currentUser=ref(user),kitchenId=ref('k'),routePath=ref('/waste')
  const api=load('../../runtime/kitchen/composables/workspace/waste/useKitchenWaste.ts',{computed,watch,onBeforeUnmount:fn=>disposed.push(fn),useRoute:()=>({get fullPath(){return routePath.value}}),useAuth:()=>({currentUser,hasIdentity:ref(true)}),useRequireUser:()=>auth.promise,useWorkspaceWriteGuard:()=>({requireWritableData(){}}),useKitchenWorkspace:()=>({id:kitchenId,data:ref({})}),readRuntimeFirestoreDatabaseId:()=> 'db',useFirestoreRead:()=>({firestoreFetchCollection:()=>ref([])}),KitchenWasteEventStorage:{collection:'waste-events'},normalizeKitchenWasteEvent:x=>x,$fetch:(...args)=>{calls.push(args);return response.promise}},'useKitchenWaste')()
  const input={...observation},pending=api.recordWaste(input),done=change==='stable'||stage==='response'?pending:assert.rejects(pending,/changed/)
  if(stage!=='auth'){auth.resolve(user);await Promise.resolve()}
  if(stage==='response'){token.resolve('token');await Promise.resolve()}
  input.item_name='Changed'
  if(change==='kitchen'){kitchenId.value='other';kitchenId.value='k'}
  else if(change==='route'){routePath.value='/other';routePath.value='/waste'}
  else if(change==='dispose')disposed.forEach(fn=>fn())
  else if(change==='account'||change==='logout'){currentUser.value=change==='logout'?null:{uid:'b'};currentUser.value=user}
  auth.resolve(user);token.resolve('token');response.resolve({id:'event'});await done
  assert.equal(calls.length,change==='stable'||stage==='response'?1:0)
  if(calls.length)assert.deepEqual(calls[0][1].body,{kitchenId:'k',observation})
 }
})
test('Waste Create captures result label and drops obsolete success/error',async()=>{
 for(const changed of [false,true])for(const outcome of ['success','error']){
  const pending=deferred(),currentUser=ref({uid:'u'}),kitchenId=ref('k'),emits=[]
  const api=load('../../runtime/kitchen/components/Waste/Create.vue',{computed,ref,watch,onBeforeUnmount:()=>{},useAuth:()=>({currentUser}),defineEmits:()=> (...args)=>emits.push(args),useKitchenWaste:()=>({kitchenId,canWrite:ref(true),recordWaste:()=>pending.promise})},'({submit,itemName,quantity,unit,error,saving})',true)
  api.itemName.value='Bread';api.quantity.value=1;api.unit.value='piece';const result=api.submit();api.itemName.value='Changed'
  if(changed){currentUser.value=null;currentUser.value={uid:'u'}}
  if(outcome==='success')pending.resolve('event');else pending.reject(Error('Failure'))
  await result
  if(!changed&&outcome==='success')assert.deepEqual(emits,[['created',{id:'event',itemName:'Bread'}]])
  else assert.deepEqual(emits,[])
  assert.equal(api.error.value, !changed&&outcome==='error'?'Failure':'');assert.equal(api.saving.value,false)
 }
})
