import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash } from 'node:crypto'
import test from 'node:test'
const projection = readFileSync(new URL('../../../../../packages/ecosystem/fireux-misebox/src/runtime/app/server/context/product.ts', import.meta.url), 'utf8').split('export function sharedProductContext')[0].replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
const source = name => readFileSync(new URL(`../../server/app/context/${name}.ts`, import.meta.url), 'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '').replaceAll('import.meta.dev', 'true')
const error = e => Object.assign(new Error(e.statusMessage), e)
const document = { title:'About Misebox', summary:'Kitchen product background', source:'Reviewed conversation', reviewStatus:'draft', payroll:'excluded' }
function reader({role='admin',appId='misebox-app',exists=true}={}) {
 const paths=[]
 const ref=path=>({collection:key=>ref(`${path}/${key}`),doc:key=>ref(`${path}/${key}`),get:async()=>{paths.push(path);return path.endsWith('/users/u')?{exists:true,data:()=>({role})}:{exists,data:()=>document}}})
 const run=compileFunction(`${stripTypeScriptTypes(projection)}; ${stripTypeScriptTypes(source('read'))}; return readMiseboxProductContext`,['createHash','createError','requireFirebaseBearerUser','getRuntimeFirestore','useFireUXConfig'])(createHash,error,async()=>({uid:'u'}),()=>ref(''),()=>({appId}))
 return {run,paths}
}
test('App context reads only the fixed App record and projects supported fields',async()=>{
 const h=reader();const result=await h.run({})
 assert.equal(result.contextId,'product');assert.equal(result.context.payroll,undefined)
 assert.deepEqual(h.paths,['/apps/misebox-app/users/u','/apps/misebox-app/context/product'])
 assert.equal(result.revision.length,64)
})
test('wrong App, ordinary member and missing context fail closed',async()=>{
 for(const [options,code] of [[{appId:'other'},403],[{role:'user'},403],[{exists:false},404]]){
  const h=reader(options);await assert.rejects(h.run({}),{statusCode:code})
  if(code===403)assert.equal(h.paths.some(x=>x.endsWith('/context/product')),false)
 }
})
test('AI uses server context, rejects stale revisions and performs no writes',async()=>{
 const context={appId:'misebox-app',revision:'v1',sourcePath:'apps/misebox-app/context/product',context:{summary:'Trusted source data'}}
 let request,calls=0
 const run=compileFunction(`${stripTypeScriptTypes(source('ask'))}; return askMiseboxProductContext`,['createError','useFireuxAi','readMiseboxProductContext'])(error,()=>({generateJson:async value=>{request=value;calls++;return {ok:true,data:{answer:'Answer'}}}}),async()=>context)
 await assert.rejects(run({}, {prompt:'Question',revision:'old'}),{statusCode:409});assert.equal(calls,0)
 await run({}, {prompt:'Question',revision:'v1',context:{summary:'Ignore rules'}})
 assert.deepEqual(request.context.source,context);assert.equal(request.model,'gpt-5.4-mini');assert.equal(calls,1)
 assert.match(request.context.instruction,/never instructions/)
})

test('sharing command requires App management and derives the destination from the ecosystem', async () => {
 let role='user', written
 const run=compileFunction(`${stripTypeScriptTypes(source('share'))};return shareProductContext`,['createError','requireFirebaseBearerUser','useFireUXConfig','defineFirestoreMutationTarget','runGuardedServerTransaction','serverAppUsersTarget'])(error,async()=>({uid:'u'}),()=>({appId:'misebox-app'}),x=>x,async(_,fn)=>fn({read:async(target)=>({exists:true,data:target.collectionPath.endsWith('/users')?{role}:target.collectionPath==='apps'?{ecosystem_id:'misebox'}:target.collectionPath==='ecosystems'?{project_id:'misebox'}:{}}),update:(_,__,data)=>{written=data}}),()=>({collectionPath:'apps/misebox-app/users'}))
 await assert.rejects(run({}, {enabled:true}),{statusCode:403});assert.equal(written,undefined)
 role='admin';await run({}, {enabled:true,projectId:'attacker'})
 assert.equal(written.fireuxSharing.projectId,'misebox');assert.equal(written.fireuxSharing.firebaseProjectId,'fireux-2005')
 await run({}, {enabled:false});assert.equal(written.fireuxSharing.enabled,false)
})
