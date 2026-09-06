import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {compileFunction} from 'node:vm'
import {computed,ref} from 'vue'
import test from 'node:test'
const clean=s=>s.replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'')
const model=clean(readFileSync(new URL('../runtime/place/models/identity-edit.ts',import.meta.url),'utf8'))
const helpers=compileFunction(`${stripTypeScriptTypes(model)};return {readPlaceIdentity,identityDraft,placeIdentityPatch}`)()
test('sparse identity patches preserve unrelated fields and allow optional clears',()=>{
 const current=helpers.readPlaceIdentity({name:'Venue',phone:'123',tagline:'Keep'})
 const draft=helpers.identityDraft(current,{name:null,phone:''})
 assert.deepEqual(helpers.placeIdentityPatch(current,draft),{phone:''})
 for(const fields of [{name:''},{website:'javascript:alert(1)'},{email:'broken'},{timezone:'Mars/Base'},{default_currency_code:'CH'}]) assert.throws(()=>helpers.placeIdentityPatch(current,{...current,...fields}))
})
test('the editor prepares without writing, saves one sparse patch, and rejects stale or unauthorized saves',async()=>{
 const vue=readFileSync(new URL('../runtime/place/components/Edit/Identity.vue',import.meta.url),'utf8')
 const source=clean(vue.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1])
 const props={place:{id:'p',name:'Venue',tagline:'Keep'},canWrite:true}
 const writes=[];let exposed
 const state=compileFunction(`${stripTypeScriptTypes(source)};return {save,error,draft,open}`,['computed','ref','defineProps','defineEmits','defineExpose','readPlaceIdentity','identityDraft','placeIdentityPatch','usePlaceUpdate'])(computed,ref,()=>props,()=>()=>{},v=>{exposed=v},helpers.readPlaceIdentity,helpers.identityDraft,helpers.placeIdentityPatch,()=>({updateIdentity:async(patch,ctx)=>writes.push({patch,ctx})}))
 exposed.show({tagline:'Fresh pizza'})
 assert.equal(writes.length,0)
 await state.save()
 assert.deepEqual(writes,[{patch:{tagline:'Fresh pizza'},ctx:{id:'p'}}])
 exposed.show({tagline:'Another'})
 props.place={...props.place,id:'different'}
 await state.save();assert.match(state.error.value,/selected Place changed/)
 assert.equal(writes.length,1)
 props.canWrite=false
 await state.save();assert.equal(writes.length,1)
})
