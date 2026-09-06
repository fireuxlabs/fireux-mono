import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const clean = s => s.replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '').replaceAll('import.meta.dev','true')
const model = readFileSync(new URL('../../../fireux-places/src/runtime/place/models/identity-edit.ts', import.meta.url),'utf8')
const fields = compileFunction(`${stripTypeScriptTypes(clean(model))};return placeIdentityFields`)()
const source = clean(readFileSync(new URL('../runtime/kitchen/server/identity/intent.ts',import.meta.url),'utf8'))
const current = Object.fromEntries(fields.map(({key})=>[key,key==='name'?'Interlaken Pizza':'']))
const unchanged = Object.fromEntries(fields.map(({key})=>[key,null]))
function harness(result) {
 let request
 const run = compileFunction(`${stripTypeScriptTypes(source)};return interpretKitchenIdentity`,['createError','requireFirebaseBearerUser','useFireuxAi','useFireUXConfig','placeIdentityFields','kitchenIdentityPurpose','kitchenIdentityBoundary'])(e=>Object.assign(new Error(e.statusMessage),e),async()=>{},()=>({generateJson:async input=>{request=input;return {ok:true,data:result}}}),()=>({appId:'test'}),fields,'Edit venue','Place owns venue')
 return {run,request:()=>request}
}
const context = {prompt:'Change tagline',identity:{...current,secret:'omit'},availableActions:['read','update']}
test('Identity AI preserves unchanged fields, bounds context, and prepares no mutations',async()=>{
 const h=harness({action:'update',fields:{...unchanged,tagline:'Fresh pizza'},message:''})
 const result=await h.run({},context)
 assert.equal(result.fields.name,null)
 assert.equal(result.fields.tagline,'Fresh pizza')
 assert.deepEqual(h.request().context.current,current)
 assert.equal(h.request().model,'gpt-5.4-mini')
 assert.equal((await h.run({},{...context,availableActions:['read']})).action,'none')
})
test('Identity AI rejects invalid output and accepts explicit optional clearing',async()=>{
 await assert.rejects(harness({action:'update',fields:{...unchanged,name:''},message:''}).run({},context),{statusCode:502})
 assert.equal((await harness({action:'update',fields:{...unchanged,phone:''},message:''}).run({},context)).fields.phone,'')
 await assert.rejects(harness({}).run({},{...context,identity:{...current,name:'x'.repeat(241)}}),{statusCode:400})
})
