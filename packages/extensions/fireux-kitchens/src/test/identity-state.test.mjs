import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {compileFunction} from 'node:vm'
import {computed,ref} from 'vue'
import test from 'node:test'

const sharedSource = readFileSync(new URL('../../../../core/fireux-core/src/runtime/composables/fireux/useIdentity.ts', import.meta.url), 'utf8').replace(/^import.*\n/gm, '').replace(/^export /gm, '')
const sharedIdentity = compileFunction(`${stripTypeScriptTypes(sharedSource)}; return useIdentity`, ['computed'])(computed)
const source=readFileSync(new URL('../runtime/kitchen/composables/workspace/identity/useKitchenIdentity.ts',import.meta.url),'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'')
test('Identity distinguishes empty, loading, missing, failed and ready states',()=>{
 const state={kitchenId:ref(''),placeId:ref(''),outcome:ref('idle'),pending:ref(false),placeOutcome:ref('idle'),place:ref(null),canWrite:ref(true)}
 const build=compileFunction(`${stripTypeScriptTypes(source)};return useKitchenIdentity`,['useIdentity','computed','watchEffect','useKitchenWorkspacePlace','useFireUXConfig','readPlaceIdentity','placeIdentityFields','kitchenIdentityPurpose','kitchenIdentityBoundary','useWorkspacePageState'])(sharedIdentity,computed,fn=>fn(),()=>state,()=>({appId:'app'}),p=>({name:p?.name||''}),[{key:'name',label:'Name'}],'Identity','Place owns data',()=>({publish(){}}))
 const page=build();assert.equal(page.status.value,'empty');assert.deepEqual(page.availableActions.value,[])
 state.outcome.value='pending';assert.equal(page.status.value,'pending');state.outcome.value='error';assert.equal(page.status.value,'error');state.outcome.value='idle'
 state.kitchenId.value='k';state.outcome.value='pending';assert.equal(page.status.value,'pending')
 state.outcome.value='ready';state.placeOutcome.value='missing';assert.equal(page.status.value,'missing');assert.equal(page.canWriteKitchen.value,true);assert.equal(page.canWrite.value,false)
 state.placeOutcome.value='error';assert.equal(page.status.value,'error')
 state.placeOutcome.value='ready';state.place.value={name:''};assert.equal(page.status.value,'ready');assert.equal(page.canWrite.value,true)
 state.canWrite.value=false;assert.deepEqual(page.availableActions.value,['read']);assert.equal(page.canWriteKitchen.value,false)
})
