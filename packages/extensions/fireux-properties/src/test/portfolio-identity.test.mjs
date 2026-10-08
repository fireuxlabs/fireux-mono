import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { normalizePortfolio } from '../runtime/portfolio/utils/normalize-portfolio.ts'
function load(file,deps,name){const source=readFileSync(new URL(file,import.meta.url),'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'');return compileFunction(`${stripTypeScriptTypes(source)};return ${name}`,Object.keys(deps))(...Object.values(deps))}
const createError=x=>Object.assign(Error(x.statusMessage),x)
const requireFirestoreDocumentId=x=>{if(typeof x!=='string'||!x||x.includes('/'))throw createError({statusCode:400});return x}
const readMembershipAccessIds=load('../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',{},'readMembershipAccessIds')
const requirePortfolioMutationAuthority=load('../runtime/portfolio/server/team/authority.ts',{createError,readMembershipAccessIds,serverPortfolioAccessTarget:app=>`portfolio_access/${app}/users`,serverAppUsersTarget:app=>`apps/${app}/users`,FIRESTORE_MUTATION_TARGETS:{portfolios:'portfolios'},isAppUserSubscription:x=>['free','premium','business'].includes(x),readFireuxEntityManagement:x=>x,resolveFireuxEntityManagementAppId:x=>x.app_id},'requirePortfolioMutationAuthority')
function harness(){const at={seconds:1,nanoseconds:0},writes=[],records=new Map([['portfolios/p',{management:{mode:'root'},identity:{name:'Before',slug:'p',status:'active',tagline:'',image_url:'',region_label:'',owner_label:'',strategy_label:'',notes:''},created:{at},updated:{at}}],['apps/app/users/u',{role:'user',subscription:'free',created:{at}}],['portfolio_access/app/users/u',{ids:['p'],membership_created_at:at}]]);let before=()=>{};const update=load('../runtime/portfolio/server/identity/update.ts',{createError,requireFirestoreDocumentId,requirePortfolioMutationAuthority,normalizePortfolio,FIRESTORE_MUTATION_TARGETS:{portfolios:'portfolios'},readPortfolioMutationActor:async()=>({uid:'u',runtimeAppId:'app'}),serverAuditStamp:x=>({...x,at:'server'}),runGuardedServerTransaction:async(_,run)=>{before();return run({read:async(t,id)=>({exists:records.has(`${t}/${id}`),data:records.get(`${t}/${id}`)}),update:(...args)=>writes.push(args)})}},'updatePortfolioIdentity');return{update,writes,records,before:fn=>before=fn}}
test('Identity edits six supported nested fields using sparse paths and preserves ownership/publication',async()=>{
 const h=harness();await h.update({},{portfolioId:'p',changes:{identity:{name:' New ',tagline:'',owner_label:'Owner',strategy_label:'Strategy',region_label:'Region',notes:'Notes'}}})
 assert.equal(h.writes.length,1)
 assert.deepEqual(h.writes[0],['portfolios','p',{'identity.name':'New','identity.tagline':'','identity.owner_label':'Owner','identity.strategy_label':'Strategy','identity.region_label':'Region','identity.notes':'Notes',updated:{by:'u',at:'server'}}])
})
test('Identity exact grammar and existing UI limits reject unsupported edits',async()=>{
 for(const identity of [{},{name:''},{name:'a'.repeat(121)},{notes:'a'.repeat(241)},{tagline:5},{slug:'new'},{image_url:'url'},{management:{}},{created:{}},{status:'archived'},{constructor:'bad'}]){
  const h=harness();await assert.rejects(h.update({},{portfolioId:'p',changes:{identity}}),{statusCode:400});assert.equal(h.writes.length,0)
 }
 for(const changes of [{name:'Old flat input'},{identity:{name:'Name'},extra:true}]) await assert.rejects(harness().update({},{portfolioId:'p',changes}),{statusCode:400})
 await assert.rejects(harness().update({},{portfolioId:'p',changes:{identity:{name:'Ok'}},extra:true}),{statusCode:400})
})
test('Identity transaction denies revoked/recreated authority, foreign management and malformed canonical roots',async()=>{
 for(const change of [h=>h.records.delete('apps/app/users/u'),h=>h.records.get('apps/app/users/u').created.at={seconds:2},h=>h.records.get('portfolio_access/app/users/u').ids=['q'],h=>h.records.get('portfolios/p').management={mode:'app',app_id:'other'},h=>h.records.delete('portfolios/p'),h=>h.records.get('portfolios/p').identity.status='other',h=>h.records.get('portfolios/p').name='Retired']){
  const h=harness();h.before(()=>change(h));await assert.rejects(h.update({},{portfolioId:'p',changes:{identity:{name:'Changed'}}}));assert.equal(h.writes.length,0)
 }
})
test('Identity thin HTTP handler preserves body for exact command validation',async()=>{
 const source=readFileSync(new URL('../runtime/server/api/workspace/portfolio/identity.patch.ts',import.meta.url),'utf8').replace(/^import[^\n]*\n/gm,'').replace('export default','return')
 const body={portfolioId:'p',changes:{identity:{name:'Name'}},extra:true},calls=[]
 const handler=compileFunction(source,['defineEventHandler','readBody','updatePortfolioIdentity'])(x=>x,async()=>body,async(...args)=>calls.push(args));const event={};await handler(event);assert.equal(calls[0][0],event);assert.equal(calls[0][1],body)
})
