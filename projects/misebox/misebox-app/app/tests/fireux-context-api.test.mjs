import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {compileFunction} from 'node:vm'
import test from 'node:test'
const source=readFileSync(new URL('../../server/fireux/context/product.ts',import.meta.url),'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'')
function harness({token='signed',email='549102750204-compute@developer.gserviceaccount.com',verified=true,project='misebox'}={}){
 let reads=0,audience
 const run=compileFunction(`${stripTypeScriptTypes(source)};return readFireuxProductContext`,['createError','getHeader','verifyServiceAccountOidc','getRuntimeFirestore','useFireUXConfig','requireFirestoreDocumentId','sharedProductContext'])(e=>Object.assign(new Error(e.statusMessage),e),()=>token,async(_,a)=>{audience=a;if(!verified)throw Error('Invalid');return {service_account_email:email}},()=>({doc:path=>({get:async()=>{reads++;return {exists:true,data:()=>path==='apps/misebox-app'?{ecosystem_id:'misebox'}:path==='ecosystems/misebox'?{project_id:project}:{context:'source'}}}})}),()=>({appId:'misebox-app'}),v=>v,(data,owner,id)=>({data,owner,id}))
 return {run,reads:()=>reads,audience:()=>audience}
}
test('missing, invalid and wrong-service tokens cannot read data',async()=>{
 for(const opts of [{token:''},{verified:false},{email:'someone@other.gserviceaccount.com'}]){const h=harness(opts);await assert.rejects(h.run({},'misebox'));assert.equal(h.reads(),0)}
})
test('verified FireUX service gets only the fixed context after relationship check',async()=>{
 const h=harness();assert.deepEqual(await h.run({},'misebox'),{data:{context:'source'},owner:'misebox',id:'misebox'});assert.equal(h.audience(),'https://misebox.app/api/fireux/context/product');assert.equal(h.reads(),3)
 const other=harness({project:'other'});await assert.rejects(other.run({},'misebox'),{statusCode:404});assert.equal(other.reads(),2)
})
