import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue, isRef } from 'vue'
function load(file,deps,name){const source=readFileSync(new URL(file,import.meta.url),'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'');return compileFunction(`${stripTypeScriptTypes(source)};return ${name}`,Object.keys(deps))(...Object.values(deps))}
const readMembershipAccessIds=load('../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',{},'readMembershipAccessIds')
function harness(){
 const selectedId=ref('p'),app={uid:ref('u'),appUser:ref({created:{at:{seconds:1,nanoseconds:0}}}),pending:ref(false),error:ref(null)}
 const accessSource=Object.assign(ref({ids:['p'],membership_created_at:{seconds:1,nanoseconds:0}}),{outcome:ref('ready'),pending:ref(false),error:ref(null)})
 const rootSource=Object.assign(ref({id:'p',name:'Portfolio'}),{outcome:ref('ready'),pending:ref(false),error:ref(null)})
 let rootId
 const useMembershipAccess=load('../../../../core/fireux-core/src/runtime/app/composables/useMembershipAccess.ts',{computed,toValue,readMembershipAccessIds,useFirestoreRead:()=>({firestoreFetchDoc:()=>accessSource})},'useMembershipAccess')
 const usePortfolioWorkspaceAccess=load('../runtime/portfolio/composables/workspace/core/usePortfolioWorkspaceAccess.ts',{computed,useAppSession:()=>app,useFireUXConfig:()=>({appId:'app'}),useMembershipAccess,portfolioAccessCollection:()=> 'portfolio_access/app/users'},'usePortfolioWorkspaceAccess')
 const usePortfolioFetch=load('../runtime/portfolio/composables/firestore/fetch/usePortfolioFetch.ts',{computed,isRef,PortfolioStorage:{rootCollection:'portfolios'},normalizePortfolio:(id,data)=>({...data,id}),useFirestoreRead:()=>({firestoreFetchDoc:(_,id)=>{rootId=id;return rootSource}})},'usePortfolioFetch')
 const usePortfolioWorkspace=load('../runtime/portfolio/composables/workspace/core/usePortfolioWorkspace.ts',{computed,usePortfolioWorkspaceAccess,useWorkspace:()=>({selectedId}),usePortfolioCreate:()=>({}),usePortfolioUpdate:()=>({}),useFirestoreDelete:()=>({}),usePortfolioFetch},'usePortfolioWorkspace')
 const active=load('../runtime/portfolio/composables/workspace/useActivePortfolio.ts',{computed,usePortfolioWorkspace,useFireUXConfig:()=>({appId:'app',ecosystem:'host'}),resolvePortfolioWorkspaceCollectionPath:()=> 'portfolios',resolveRuntimePortfolioPath:(collection,id,child)=>collection&&id?`${collection}/${id}/${child}`:''},'({useActivePortfolio,usePortfolioWorkspaceChildPath})')
 const runtime=active.useActivePortfolio(),child=active.usePortfolioWorkspaceChildPath(runtime,'tasks')
 return {selectedId,app,accessSource,rootSource,runtime,child,get rootId(){return rootId.value}}
}
test('Portfolio root and children subscribe only to ready current membership-bound selection',()=>{
 const h=harness();assert.equal(h.rootId,'p');assert.equal(h.child.value,'portfolios/p/tasks');assert.equal(h.runtime.entity.value.name,'Portfolio');assert.equal(h.runtime.canWrite.value,true)
 h.selectedId.value='forged';assert.equal(h.rootId,'');assert.equal(h.child.value,'');assert.equal(h.runtime.entity.value,null);assert.equal(h.runtime.targetOutcome.value,'missing')
 h.selectedId.value='p';h.app.pending.value=true;assert.equal(h.rootId,'');assert.equal(h.child.value,'');assert.equal(h.runtime.targetOutcome.value,'pending')
 h.app.pending.value=false;h.app.appUser.value=null;assert.equal(h.rootId,'');assert.equal(h.child.value,'');assert.equal(h.runtime.canWrite.value,false)
 h.app.appUser.value={created:{at:{seconds:2,nanoseconds:0}}};assert.equal(h.rootId,'');assert.equal(h.child.value,'')
 h.accessSource.value={ids:['p'],membership_created_at:{seconds:2,nanoseconds:0}};assert.equal(h.rootId,'p');assert.equal(h.child.value,'portfolios/p/tasks')
 h.accessSource.value={ids:[],membership_created_at:{seconds:2,nanoseconds:0}};assert.equal(h.rootId,'');assert.equal(h.child.value,'')
})
test('Portfolio hides obsolete/failed root data and keeps pending/error/missing distinct',()=>{
 const h=harness();h.accessSource.value.ids=['p','q'];h.selectedId.value='q';assert.equal(h.rootId,'q');assert.equal(h.runtime.targetOutcome.value,'pending');assert.equal(h.runtime.entity.value,null);assert.equal(h.child.value,'')
 h.rootSource.outcome.value='pending';assert.equal(h.runtime.targetOutcome.value,'pending');assert.equal(h.child.value,'')
 h.rootSource.value={id:'q',name:'Second'};h.rootSource.outcome.value='ready';assert.equal(h.child.value,'portfolios/q/tasks')
 h.rootSource.outcome.value='error';h.rootSource.error.value=Error('Denied');assert.equal(h.runtime.entity.value,null);assert.equal(h.runtime.targetOutcome.value,'error');assert.equal(h.child.value,'')
 h.rootSource.outcome.value='missing';assert.equal(h.runtime.targetOutcome.value,'missing');assert.equal(h.child.value,'')
 h.app.error.value=Error('Membership failure');assert.equal(h.rootId,'');assert.equal(h.runtime.targetOutcome.value,'error')
})
