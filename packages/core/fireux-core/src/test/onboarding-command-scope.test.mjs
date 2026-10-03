import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import { ref,reactive,watch,effectScope,onScopeDispose } from 'vue'
const root=new URL('../../../../',import.meta.url)
const helper=readFileSync(new URL('../runtime/composables/fireux/commands/useCommandScope.ts',import.meta.url),'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'')
const useCommandScope=compileFunction(`${stripTypeScriptTypes(helper)};return useCommandScope`,['watch','onScopeDispose'])(watch,onScopeDispose)
const families=[
 ['Portfolio','extensions/fireux-properties/src/runtime/portfolio/composables/firestore/mutations/usePortfolioCreate.ts'],
 ['Property','extensions/fireux-properties/src/runtime/property/composables/firestore/mutations/usePropertyCreate.ts'],
 ['Supplier','extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/mutations/useSupplierCreate.ts'],
 ['Project','ecosystem/fireux-fireux/src/runtime/project/composables/workspace/useProjectWorkspaceCreate.ts']]
for(const [family,path] of families)for(const changed of ['account','membership','app','disposal','none'])test(`${family} onboarding captures intent before credentials: ${changed}`,async()=>{
 let release;const token=new Promise(r=>release=r),calls=[];const user={uid:'actor',getIdToken:()=>token},currentUser=ref(user),appUser=ref({created:{at:'first'}}),config=reactive({appId:'a'}),scope=effectScope()
 let source=readFileSync(new URL(path,root),'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'')
 const deps={ref,watch,useCommandScope,useAuth:()=>({currentUser}),useAppSession:()=>({appUser}),useFireUXConfig:()=>config,useRequireUser:async()=>user,useFirestore:()=>({}),useFirestoreCreate:()=>({createDocument:async()=>true}),defineFireuxCreatePlan:x=>x,normalizeSlug:x=>x,PortfolioStorage:{rootCollection:'portfolios'},PropertyStorage:{rootCollection:'properties'},$fetch:async(url,options)=>{calls.push(options.body);return {ok:true,portfolio_id:'p',property_id:'p',supplier_id:'p',project_id:'p',created_root:true,created_team_member:true}},doc(){},getDoc(){},canonicalPropertyManual:x=>x}
 const owner=family==='Project'?'useProjectWorkspaceCreate':`use${family}Create`
 const controller=scope.run(()=>compileFunction(`${stripTypeScriptTypes(source)};return ${owner}()`,Object.keys(deps))(...Object.values(deps)))
 const input={name:'Before',nested:{value:'Before'}};const options={organizationName:'Before',companyId:'company'}
 const run=family==='Project'?controller.createProject('Before'):family==='Supplier'?controller.createSupplierWorkspace(options):controller[`create${family}Workspace`](input)
 await Promise.resolve();input.name='After';input.nested.value='After';options.organizationName='After'
 if(changed==='account'){currentUser.value={uid:'other'};currentUser.value=user}
 if(changed==='membership'){const old=appUser.value;appUser.value={created:{at:'second'}};appUser.value=old}
 if(changed==='app'){config.appId='b';config.appId='a'}
 if(changed==='disposal')scope.stop()
 release('token')
 if(changed==='none'){await run;assert.equal(calls.length,1);const body=calls[0];assert.equal(family==='Portfolio'?body.input.name:family==='Supplier'?body.organization_name:body.name,'Before');if(family==='Property')assert.equal(body.nested.value,'Before')}
 else {await assert.rejects(run,/context changed/);assert.equal(calls.length,0)}scope.stop()
})
