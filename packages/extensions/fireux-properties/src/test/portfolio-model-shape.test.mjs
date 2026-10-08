import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch, effectScope, nextTick, isRef, toValue, onScopeDispose } from 'vue'
import { normalizePortfolio } from '../runtime/portfolio/utils/normalize-portfolio.ts'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
function load(file, result, deps = {}) {
 const source=readFileSync(new URL(file, import.meta.url),'utf8')
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'')
  .replace(/^export type \{[\s\S]*?\} from ['"][^'"]+['"];?\n/gm,'')
  .replace(/^export /gm,'')
 return compileFunction(`${stripTypeScriptTypes(source,{mode:'transform'})};return ${result}`,Object.keys(deps))(...Object.values(deps))
}
const model=load('../runtime/portfolio/models/portfolio.model.ts','({PortfolioModel,PortfolioEntity,PortfolioStorage})',{defineFireuxEntity:v=>v,FireuxEntityManagementDefaults:{mode:'root'}})
const stamp={at:{seconds:1,nanoseconds:0},by:'u'}
const root=(id='p')=>({...model.PortfolioModel,id,management:{mode:'workspace'},identity:{...model.PortfolioModel.identity,name:'Portfolio',tagline:'Public',image_url:'',slug:id,status:'active',owner_label:'Private owner',strategy_label:'Private strategy',region_label:'Bern',notes:'Private notes'},created:stamp,updated:stamp})
test('Portfolio canonical root nests complete descriptive Identity, rejects retired/coerced fields and keeps records independent',()=>{
 assert.equal(model.PortfolioEntity.name,'Portfolio');assert.equal(model.PortfolioEntity.root,model.PortfolioStorage.root)
 const value=root();assert.deepEqual(normalizePortfolio('p',value),value)
 const withoutId=root();delete withoutId.id;assert.equal(normalizePortfolio('p',withoutId).id,'p')
 for(const bad of [
  {...root(),name:'Retired'}, {...root(),tasks:[]}, {...root(),id:'other'},
  {...root(),identity:{...root().identity,name:5}},
  {...root(),identity:{...root().identity,status:'unexpected'}},
  {...root(),identity:{...root().identity,slug:'other'}},
  {...root(),identity:{...root().identity,orders:[]}},
  {...root(),identity:{...root().identity,notes:undefined}},
  {...root(),created:{by:'u'}},
 ]) assert.equal(normalizePortfolio('p',bad),null)
 assert.equal(normalizePortfolio({id:'p'},root()),null)
 assert.equal(normalizePortfolio('parent/child',root()),null)
})
test('Nested creation input rejects implicit coercion and retired flat fields before dispatch',()=>{
 const draft=load('../runtime/portfolio/server/index/onboarding/input.ts','portfolioDraft',{
  createError:v=>Object.assign(Error(v.statusMessage),v),
  requireFirestoreDocumentId:v=>{if(!v||v.includes('/'))throw Error('invalid id');return v},
  normalizeSlug:v=>v.toLowerCase().replace(/\s+/g,'-'),
 })
 assert.equal(draft({identity:{name:' My Portfolio '}}).slug,'my-portfolio')
 assert.equal(draft({identity:{name:'Name',status:'archived'}}).status,'archived')
 for(const bad of [{name:'Old'},{identity:{name:['Name']}},{identity:{name:'Name',status:['active']}},{identity:{name:'Name',owner_label:7}},{identity:{name:'Name',extra:true}},{identity:{name:'Name'},management:{mode:'root'}}])assert.throws(()=>draft(bad))
})
test('Malformed granted Portfolio collection fails without exposing partial data or replacing selection; valid recovery restores it',async()=>{
 const source=Object.assign(ref([root()]),{pending:ref(false),error:ref(null)})
 const ids=ref(new Set(['p','q']))
 const collection=load('../runtime/portfolio/composables/usePortfolioCollection.ts','usePortfolioCollection()',{
  computed,normalizePortfolio,DEFAULT_COLLECTION_PATH:'portfolios',UNSUPPORTED_TEST_SOURCE_MESSAGE:'unsupported',
  resolvePortfolioId:v=>typeof v.id==='string'?v.id:'',
  useTargetCollectionSelection:()=>({sourceMode:ref('live'),hasFilter:ref(true),filterIdSet:ids,hasOperatorFilter:ref(false)}),
  useFirestoreRead:()=>({firestoreFetchCollection:()=>source,firestoreLoadDocsByIds:()=>({docs:source,pending:source.pending,error:source.error})}),
  useFirestoreCollectionState:o=>({outcome:computed(()=>resolveReadOutcome({active:toValue(o.active),pending:toValue(o.pending),error:toValue(o.error),kind:'collection',present:toValue(o.count)>0}))}),
 })
 const selectedId=ref('p'),scope=effectScope()
 const index=scope.run(()=>load('../runtime/portfolio/composables/workspace/usePortfolioWorkspaceIndex.ts','usePortfolioWorkspaceIndex()',{
  computed,watch,usePortfolioCollection:()=>collection,usePortfolioAccess:()=>({ids:computed(()=>[...ids.value]),outcome:ref('ready')}),
  useWorkspace:()=>({selectedId,select:id=>selectedId.value=id,reconcile:(values,outcome)=>{if(outcome==='ready'&&!values.includes(selectedId.value))selectedId.value=values[0]||'';if(outcome==='empty')selectedId.value=''}}),
 }))
 assert.equal(index.outcome.value,'ready')
 source.value=[root('q'),{...root(),name:'Retired'}];await nextTick()
 assert.equal(index.outcome.value,'error');assert.equal(selectedId.value,'p');assert.deepEqual(collection.portfolios.value,[]);assert.equal(collection.count.value,0)
 source.value=[root('q'),root()];await nextTick()
 assert.equal(index.outcome.value,'ready');assert.equal(selectedId.value,'p')
 source.pending.value=true;assert.deepEqual(collection.portfolios.value,[])
 source.pending.value=false;source.error.value=Error('Denied');assert.deepEqual(collection.portfolios.value,[])
 scope.stop()
})
test('Settled malformed Portfolio detail is an explicit error and recovers without stale data',()=>{
 const id=ref('p'),source=Object.assign(ref(root()),{outcome:ref('ready'),pending:ref(false),error:ref(null)})
 const api=load('../runtime/portfolio/composables/firestore/fetch/usePortfolioFetch.ts','usePortfolioFetch(id)',{computed,isRef,id,normalizePortfolio,PortfolioStorage:{rootCollection:'portfolios'},useFirestoreRead:()=>({firestoreFetchDoc:()=>source})})
 assert.equal(api.outcome.value,'ready');assert.equal(api.portfolio.value.id,'p')
 source.value={...root(),identity:{...root().identity,status:'bad'}}
 assert.equal(api.outcome.value,'error');assert.equal(api.portfolio.value,null)
 source.outcome.value='pending';assert.equal(api.outcome.value,'pending')
 source.value=root();source.outcome.value='ready';assert.equal(api.portfolio.value.id,'p')
 source.value=null;source.outcome.value='missing';assert.equal(api.outcome.value,'missing')
})
test('Portfolio card reads nested profile and never falls back to private descriptive context',()=>{
 const card=load('../runtime/portfolio/composables/firestore/utils/view/usePortfolioInterface.ts','usePortfolioInterface()', {PortfolioStorage:{rootCollection:'portfolios'}})
 const value=root();value.identity.tagline=''
 const result=card.profile(value)
 assert.equal(result.title,'Portfolio');assert.equal(result.to,'/portfolios/p');assert.equal(result.summary,'');assert.equal(result.ownerLabel,'')
 assert.doesNotMatch(JSON.stringify(result),/Private/)
})
test('Unified Portfolio creation captures nested input before credentials and rejects account roundtrips, disposal and mismatched results',async()=>{
 const useCommandScope=load('../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts','useCommandScope',{watch,onScopeDispose})
 for(const condition of ['stable','blank-slug','existing-id','switch','route','form-change','dispose','wrong-id','invalid-flags']){
  let finish;const token=new Promise(resolve=>finish=resolve),calls=[],owner=effectScope()
  const user={uid:'u',getIdToken:()=>token},currentUser=ref(user),membership=ref({id:'u'}),route=ref('/create'),ownerCurrent=ref(true)
  const api=owner.run(()=>load('../runtime/portfolio/composables/firestore/mutations/usePortfolioCreate.ts','usePortfolioCreate()',{
   useRoute:()=>({get fullPath(){return route.value}}),useCommandScope,useAuth:()=>({currentUser}),useAppSession:()=>({appUser:membership}),useFireUXConfig:()=>({appId:'app'}),useRequireUser:async()=>user,
   isFirestoreDocumentId:v=>typeof v==='string'&&!!v&&!v.includes('/'),normalizeSlug:v=>v.toLowerCase().replace(/\s+/g,'-'),
   $fetch:async(...args)=>{calls.push(args);return {ok:true,portfolio_id:condition==='wrong-id'?'other':'portfolio',created_root:condition==='invalid-flags'?'yes':true,created_team_member:true}},
  }))
  const input={identity:{...model.PortfolioModel.identity,name:'Portfolio',...(condition==='blank-slug'?{slug:'   '}:{})}},original=structuredClone(input),pending=api.createPortfolio(input,{isCurrent:()=>ownerCurrent.value,...(condition==='existing-id'?{existingRootId:' portfolio '}:{})})
  const done=['stable','blank-slug','existing-id'].includes(condition)?pending:assert.rejects(pending,['switch','route','form-change','dispose'].includes(condition)?/context changed/:/invalid/)
  await Promise.resolve();input.identity.name='Changed'
  if(condition==='switch'){currentUser.value={uid:'other'};currentUser.value=user}
  if(condition==='route'){route.value='/other';route.value='/create'}
  if(condition==='form-change')ownerCurrent.value=false
  if(condition==='dispose')owner.stop()
  finish('token');await done
  assert.equal(calls.length,['switch','route','form-change','dispose'].includes(condition)?0:1)
  if(calls.length)assert.deepEqual(calls[0][1].body,condition==='existing-id'?{existing_root_id:'portfolio'}:{input:original})
  owner.stop()
 }
})


test('Offline Portfolio conversion preserves facts and yields the current canonical reader contract',()=>{
 const current=root(),before={management:current.management,created:current.created,updated:current.updated,...current.identity}
 const tool=fileURLToPath(new URL('../../../../../tools/workspace-migrations/portfolio-identity.py',import.meta.url))
 const script=`import importlib.util,json,sys
spec=importlib.util.spec_from_file_location('planner',sys.argv[1])
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
print(json.dumps(m.build_plan(json.load(sys.stdin))))`
 const plan=JSON.parse(execFileSync('python3',['-c',script,tool],{input:JSON.stringify({database:'projects/granite-ecosystem/databases/granite',documents:[{path:'portfolios/p',data:before}]}),encoding:'utf8'}))
 assert.deepEqual(plan.entries[0].preimage,before)
 assert.equal(plan.entries[0].status,'proposed');assert.equal('id' in plan.entries[0].proposed,false)
 assert.deepEqual(normalizePortfolio('p',plan.entries[0].proposed),current)
 for(const count of [80,81]) {
  const input={...before,name:'😀'.repeat(count)}
  const planned=JSON.parse(execFileSync('python3',['-c',script,tool],{input:JSON.stringify({database:'projects/granite-ecosystem/databases/granite',documents:[{path:'portfolios/p',data:input}]}),encoding:'utf8'})).entries[0]
  assert.equal(planned.status,count===80?'proposed':'invalid')
  if(planned.proposed)assert.ok(normalizePortfolio('p',planned.proposed))
 }
 assert.equal(plan.apply_supported,false);assert.equal(plan.target_validation_required,true)
})
