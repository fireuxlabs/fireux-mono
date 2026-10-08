import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, reactive, isRef, watch, unref, effectScope, onScopeDispose, nextTick } from 'vue'
import { isFirestoreDocumentId } from '../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'

function load(path, result, deps={}) {
  const source=readFileSync(new URL(path,import.meta.url),'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'')
  return compileFunction(`${stripTypeScriptTypes(source)};return ${result}`,Object.keys(deps))(...Object.values(deps))
}
const {readProjectDocument,readProjectPublicSummary}=load('../runtime/project/utils/readProject.ts','({readProjectDocument,readProjectPublicSummary})',{isFirestoreDocumentId})
const at={seconds:1,nanoseconds:0}
const root=(id='p')=>({id,identity:{name:'Project',description:'Public profile',image_url:'',status:'active'},created:{at,by:'u',app_id:'app'},updated:{at,by:'u'}})

test('Canonical Project nests local Identity and admits only exact guest authority at the root',()=>{
  assert.deepEqual(readProjectDocument(root(),'p'),root())
  const storage=root();delete storage.id;assert.equal(readProjectDocument(storage,'p').id,'p')
  const guest={...root(),guest_owner_uid:'p',created:{at,by:'p',app_id:'app'}}
  assert.deepEqual(readProjectDocument(guest,'p'),guest)
  for(const bad of [
    {...root(),name:'Old'}, {...root(),apps:[]}, {...root(),identity:undefined,...root().identity},
    {...root(),id:'other'}, {...root(),identity:{...root().identity,status:'other'}},
    {...root(),identity:{...root().identity,name:5}}, {...root(),identity:{...root().identity,team:[]}},
    {...root(),identity:{...root().identity,name:' '}}, {...root(),created:{}},
    {...guest,guest_owner_uid:'other'}, {...guest,created:{at,by:'other',app_id:'app'}},
    {...guest,created:{at,by:'p'}}, {...guest,guest_owner_uid:5},
  ]) assert.equal(readProjectDocument(bad,'p'),null)
  assert.equal(readProjectDocument(root(),'parent/child'),null)
})

test('Public Project profile cannot expose guest ownership, audit or unrelated private metadata',()=>{
  const value={...root(),guest_owner_uid:'private',created:{secret:'private'},team:['private']}
  assert.equal(readProjectDocument(value,'p'),null)
  assert.deepEqual(readProjectPublicSummary(value,'p'),{id:'p',identity:root().identity})
  assert.equal(readProjectPublicSummary({...value,identity:{...value.identity,notes:'private'}},'p'),null)
  assert.equal(readProjectPublicSummary({...value,id:'other'},'p'),null)
  const view=load('../runtime/project/composables/useProjectInterface.ts','useProjectInterface()')
  assert.equal(view.pill(root()).title,'Project')
  assert.doesNotMatch(JSON.stringify(view.profile(value)),/private/)
})

test('Malformed granted Project roots fail the collection without exposing a partial list; valid recovery restores data',async()=>{
  const ids=ref(['p','q']), docs=ref([root(),root('q')]), source={docs,error:ref(undefined),outcome:ref('ready')}
  const access={ids,pending:ref(false),error:ref(undefined),outcome:ref('ready')}
  const collection=load('../runtime/project/composables/useProjectCollection.ts','useProjectCollection()',{
    computed,isRef,resolveReadOutcome,readProjectDocument,useProjectAccess:()=>access,
    useFirestoreRead:()=>({firestoreLoadDocsByIds:()=>source}),
  })
  const reconciled=[],owner=effectScope(),selectedId=ref('p')
  owner.run(()=>load('../runtime/project/composables/workspace/useProjectWorkspaceIndex.ts','useProjectWorkspaceIndex()',{
    computed,watch,useProjectCollection:()=>collection,
    useWorkspace:()=>({selectedId,select(){},reconcile:(...args)=>reconciled.push(args)}),
  }))
  assert.equal(collection.count.value,2)
  docs.value=[{...root(),name:'Old'},root('q')];await nextTick()
  assert.equal(collection.outcome.value,'error');assert.deepEqual(collection.projects.value,[])
  assert.equal(collection.count.value,0);assert.equal(reconciled.at(-1)[1],'error')
  docs.value=[root(),root('q')];await nextTick();assert.equal(collection.outcome.value,'ready')
  source.outcome.value='pending';assert.deepEqual(collection.projects.value,[])
  source.outcome.value='ready';source.error.value=Error('denied');assert.equal(collection.outcome.value,'error')
  source.error.value=undefined;ids.value=[];await nextTick();assert.deepEqual(collection.projects.value,[])
  owner.stop()
})

test('A malformed settled Project detail is an explicit error and clears when the record recovers or scope closes',()=>{
  const id=ref('p'),source=Object.assign(ref(root()),{outcome:ref('ready'),pending:ref(false),error:ref(undefined)})
  const read=load('../runtime/project/composables/useProjectRead.ts','useProjectRead(id)',{
    computed,unref,id,readProjectDocument,useFirestoreRead:()=>({firestoreFetchDoc:()=>source}),
  })
  assert.equal(read.outcome.value,'ready');assert.equal(read.data.value.id,'p')
  source.value={...root(),name:'Old'};assert.equal(read.outcome.value,'error');assert.equal(read.data.value,null)
  source.outcome.value='pending';assert.equal(read.outcome.value,'pending');assert.equal(read.data.value,null)
  source.value=root();source.outcome.value='ready';assert.equal(read.outcome.value,'ready')
  id.value='';source.outcome.value='idle';source.error.value=Error('old failure')
  assert.equal(read.error.value,undefined);assert.equal(read.data.value,null);assert.equal(read.outcome.value,'idle')
})

test('Project creation captures route and caller form before credentials and validates guest response identity and action',async()=>{
  const useCommandScope=load('../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts','useCommandScope',{watch,onScopeDispose})
  for(const change of ['stable','route','membership','account','form','disposal','bad-action','bad-id','transport-error']){
    let resolve;const token=new Promise(r=>resolve=r),calls=[],owner=effectScope()
    const user={uid:'guest',isAnonymous:true,getIdToken:()=>token},currentUser=ref(user),membership=ref(null),route=reactive({fullPath:'/project'}),isOwnerCurrent=ref(true)
    const controller=owner.run(()=>load('../runtime/project/composables/workspace/useProjectWorkspaceCreate.ts','useProjectWorkspaceCreate()',{
      ref,watch,useCommandScope,isFirestoreDocumentId,useRoute:()=>route,
      useAuth:()=>({currentUser}),useAppSession:()=>({appUser:membership}),useFireUXConfig:()=>({appId:'app'}),
      $fetch:async(...args)=>{calls.push(args);if(change==='transport-error')throw new Error('private database/path token=secret');return {ok:true,project_id:change==='bad-id'?'other':'guest',action:change==='bad-action'?'unexpected':'create'}},
    }))
    const flight=controller.createProject('Before',{isCurrent:()=>isOwnerCurrent.value})
    const done=change==='stable'?flight:assert.rejects(flight,['bad-action','bad-id'].includes(change)?/invalid/:change==='transport-error'?/private database/:/context changed/)
    if(change==='route'){route.fullPath='/other';route.fullPath='/project'}
    if(change==='membership'){membership.value={id:'member'};membership.value=null}
    if(change==='account'){currentUser.value={uid:'other'};currentUser.value=user}
    if(change==='form')isOwnerCurrent.value=false
    if(change==='disposal')owner.stop()
    resolve('token');await done
    assert.equal(calls.length,['stable','bad-action','bad-id','transport-error'].includes(change)?1:0)
    if(calls.length)assert.deepEqual(calls[0][1].body,{name:'Before'})
    if(change==='transport-error')assert.equal(controller.error.value,'Project creation failed. Try again.')
    if(change!=='disposal')assert.equal(controller.pending.value,false)
    owner.stop()
  }
})

test('Offline Project conversion preserves exact identity and guest authority and satisfies the current canonical reader',()=>{
  const current={...root(),guest_owner_uid:'p',created:{at,by:'p',app_id:'app'}},before={created:current.created,updated:current.updated,guest_owner_uid:'p',...current.identity}
  const tool=fileURLToPath(new URL('../../../../../tools/workspace-migrations/project-identity.py',import.meta.url))
  const script=`import importlib.util,json,sys
spec=importlib.util.spec_from_file_location('planner',sys.argv[1])
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
print(json.dumps(m.build_plan(json.load(sys.stdin))))`
  const plan=JSON.parse(execFileSync('python3',['-c',script,tool],{input:JSON.stringify({database:'projects/fireux-2005/databases/fireux',documents:[{path:'projects/p',data:before,update_time:'revision'}]}),encoding:'utf8'}))
  assert.equal(plan.entries[0].status,'proposed');assert.deepEqual(plan.entries[0].preimage,before)
  assert.equal(plan.entries[0].update_time,'revision');assert.equal('id' in plan.entries[0].proposed,false)
  assert.deepEqual(readProjectDocument(plan.entries[0].proposed,'p'),current)
  assert.equal(plan.apply_supported,false);assert.equal(plan.target_validation_required,true)
  for(const length of [60,61]){
    const unicodeBefore={...before,name:'😀'.repeat(length)}
    const unicodePlan=JSON.parse(execFileSync('python3',['-c',script,tool],{input:JSON.stringify({database:'projects/fireux-2005/databases/fireux',documents:[{path:'projects/p',data:unicodeBefore}]}),encoding:'utf8'}))
    assert.equal(unicodePlan.entries[0].status,length===60?'proposed':'invalid')
    if(length===60)assert.ok(readProjectDocument(unicodePlan.entries[0].proposed,'p'))
  }
})
