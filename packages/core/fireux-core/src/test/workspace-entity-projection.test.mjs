import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import { computed,ref,toValue } from 'vue'
const load=(path,name,deps)=>{const source=readFileSync(new URL(path,import.meta.url),'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'');return compileFunction(`${stripTypeScriptTypes(source)};return ${name}`,Object.keys(deps))(...Object.values(deps))}
const readMembershipAccessIds=load('../runtime/app/utils/membership-access.ts','readMembershipAccessIds',{})
const paths={Project:'../../../../ecosystem/fireux-fireux/src/runtime/project/',Kitchen:'../../../../extensions/fireux-kitchens/src/runtime/kitchen/',Supplier:'../../../../extensions/fireux-suppliers/src/runtime/supplier/',Portfolio:'../../../../extensions/fireux-properties/src/runtime/portfolio/',Property:'../../../../extensions/fireux-properties/src/runtime/property/'}
for(const [family,path] of Object.entries(paths))test(`${family} current Workspace projection requires exact settled membership access`,()=>{
 const selectedId=ref('a'),app={uid:ref('actor'),app:ref({id:'app'}),appUser:ref({subscription:'free',created:{at:{seconds:1,nanoseconds:0}}}),pending:ref(false),error:ref(null)}
 const grant=Object.assign(ref({ids:['a','b'],membership_created_at:{seconds:1,nanoseconds:0}}),{outcome:ref('ready'),pending:ref(false),error:ref(null)})
 const root=ref({id:'a',name:'A'}),rootOutcome=ref('ready');let readId
 const useMembershipAccess=load('../runtime/app/composables/useMembershipAccess.ts','useMembershipAccess',{computed,toValue,readMembershipAccessIds,useFirestoreRead:()=>({firestoreFetchDoc:()=>grant})})
 const accessDeps={computed,useAppSession:()=>app,useFireUXConfig:()=>({appId:'app'}),useMembershipAccess,projectAccessCollectionPath:()=> 'access',kitchenAccessCollectionPath:()=> 'access',supplierAccessCollection:()=> 'access',portfolioAccessCollection:()=> 'access',propertyAccessCollection:()=> 'access',KITCHEN_USER_LIMIT:100}
 const access=load(path+'composables/use'+family+'Access.ts','use'+family+'Access',accessDeps)
 const reader=id=>{readId=id;return {data:root,kitchen:root,place:ref({id:'a'}),supplier:root,portfolio:root,property:root,outcome:rootOutcome}}
 const deps={computed,['use'+family+'Access']:access,useWorkspace:()=>({selectedId}),['use'+family+'Create']:()=>({}),['use'+family+'Update']:()=>({}),['use'+family+'Delete']:()=>({}),['use'+family+'Read']:reader,['use'+family+'Fetch']:reader,useFirestoreDelete:()=>({}),SupplierStorage:{collection:'suppliers'},PortfolioStorage:{rootCollection:'portfolios'},PropertyStorage:{rootCollection:'properties'},useKitchenAnonymousAdoption:()=>({}),useKitchenInterface:()=>({surface:({kitchen})=>kitchen}),useAppSession:()=>app,useFireUXConfig:()=>({appId:'app'}),resolveWorkspaceCanCreate:()=>true,resolveKitchenAllowance:()=>({canAdd:true})}
 const workspace=load(path+'composables/workspace/use'+family+'Workspace.ts','use'+family+'Workspace',deps)()
 assert.equal(readId.value,'a');assert.equal(workspace.data.value.id,'a')
 selectedId.value='forged';assert.equal(readId.value,'');assert.equal(workspace.data.value,null);assert.equal(workspace.outcome.value,'missing')
 selectedId.value='b';assert.equal(readId.value,'b');assert.equal(workspace.outcome.value,'pending');assert.equal(workspace.data.value,null)
 root.value={id:'b',name:'B'};assert.equal(workspace.data.value.id,'b')
 rootOutcome.value='error';assert.equal(workspace.data.value,null);assert.equal(workspace.outcome.value,'error');rootOutcome.value='ready'
 app.pending.value=true;assert.equal(readId.value,'');assert.equal(workspace.data.value,null);app.pending.value=false
 app.appUser.value={subscription:'free',created:{at:{seconds:2,nanoseconds:0}}};assert.equal(readId.value,'');assert.equal(workspace.data.value,null)
 grant.value={ids:['b'],membership_created_at:{seconds:2,nanoseconds:0}};assert.equal(readId.value,'b');assert.equal(workspace.data.value.id,'b')
 app.appUser.value=null;assert.equal(readId.value,'');assert.equal(workspace.data.value,null)
})
