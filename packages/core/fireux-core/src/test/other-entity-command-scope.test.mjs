import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { ref, reactive, watch, effectScope, onScopeDispose } from 'vue'
const root = new URL('../../../../', import.meta.url)
function load(path, deps, name) {
  const source = readFileSync(new URL(path, root), 'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/^export /gm, '').replace(/import\.meta\.dev/g, 'false')
  return compileFunction(`${stripTypeScriptTypes(source)}; return ${name}`, Object.keys(deps))(...Object.values(deps))
}
const useCommandScope = load('core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts', {watch, onScopeDispose}, 'useCommandScope')
function deferred() { let resolve; const promise = new Promise(done => {resolve=done}); return {promise, resolve} }
const domains = [
  ['PlaceEnsure', 'extensions/fireux-places/src/runtime/place/composables/firestore/mutations/usePlaceCreate.ts', 'usePlaceCreate', api => api.ensurePlaceExists({id:'place'}), {ok:true,id:'place',created:true}, true],
  ['PlaceOnboarding', 'extensions/fireux-places/src/runtime/place/composables/firestore/mutations/usePlaceCreate.ts', 'usePlaceCreate', api => api.completePlaceOnboarding({id:'place',default_currency_code:'CHF',timezone:'Europe/Zurich'}), {ok:true,id:'place',created:true,configured:true}, true],
  ['PlaceEnrichment', 'extensions/fireux-places/src/runtime/place/composables/firestore/mutations/usePlaceCreate.ts', 'usePlaceCreate', api => api.enrichPlaceOnboarding('place'), {id:'place',generated:true}, true],
  ['Blog', 'extensions/fireux-blogs/src/runtime/blog/composables/authoring/useBlogCommand.ts', 'useBlogCommand', api => api.command('post', 'update', {title:'Original'}), {ok:true,appId:'app',slug:'post'}, true],
  ['Job', 'extensions/fireux-jobs/src/runtime/job/composables/useJobCommand.ts', 'useJobCommand', api => api.command('/api/internal/jobs/job', 'PATCH', {title:'Original'}), {id:'job'}, false],
  ['Place', 'extensions/fireux-places/src/runtime/place/composables/firestore/mutations/usePlaceUpdate.ts', 'usePlaceUpdate', api => api.updateName('Original', {id:'place'}), {place:{id:'place'}}, true],
  ['Company', 'extensions/fireux-companies/src/runtime/place/composables/firestore/company/mutations/useCompanyCreate.ts', 'useCompanyCreate', api => api.createCompany({id:'place'}), {ok:true,id:'place',created:true}, true],
  ['Marketplace', 'extensions/fireux-marketplace/src/runtime/marketplace-store/composables/useMarketplaceCommands.ts', 'useMarketplaceCommands', api => api.patchStore('store', {name:'Original'}), {ok:true,item:{id:'store'}}, true],
  ['IngredientImage', 'extensions/fireux-kitchens/src/runtime/ingredient/composables/useIngredientImageGeneration.ts', 'useIngredientImageGeneration', api => api.generate('ingredient'), {id:'ingredient',image_url:'https://example.com/image.webp',generated:true}, true],
  ['Ingredient', 'extensions/fireux-kitchens/src/runtime/ingredient/composables/firestore/mutations/useIngredientUpdate.ts', 'useIngredientUpdate', api => api.updateIngredient({ingredientId:'ingredient',changes:{name:'Original'}}), {ingredient:{id:'ingredient'}}, true],
]
for (const [domain,path,name,run,result,validates] of domains) {
  for (const stage of ['token','response']) for (const changed of ['stable','account','app','member','route','dispose']) test(`${domain}: ${stage} ${changed} retains exact originating intent`, async () => {
    const token=deferred(),response=deferred(),calls=[],effects=[],scope=effectScope()
    const user={uid:'actor',getIdToken:()=>token.promise},currentUser=ref(user),config=reactive({appId:'app'}),route=reactive({fullPath:'/edit'}),appUser=ref({role:'admin'}),session={appUser,appPending:ref(false),appError:ref(null),appOutcome:ref('ready')}
    const deps={defineFireuxCreatePlan:x=>x,canonicalPlaceId:x=>x,ref,watch,toValue:x=>typeof x==='function'?x():x,useCommandScope,useAuth:()=>({currentUser}),useFireUXConfig:()=>config,useUserSession:()=>session,useRoute:()=>route,useRequireUser:async()=>user,usePlaceDetailState:()=>({publish:x=>effects.push(x)}),refreshNuxtData:async x=>effects.push(x),normalizePlaceBusinessHours:x=>x,normalizeHexColor:x=>x,$fetch:(path,options)=>{calls.push({path,options});return response.promise}}
    const api=scope.run(()=>load(path,deps,name)()),flight=run(api)
    await Promise.resolve(); await Promise.resolve()
    if(stage==='response'){token.resolve('token');for(let i=0;i<4;i++)await Promise.resolve();assert.equal(calls.length,1)}
    if(changed==='account'){currentUser.value={uid:'other'};currentUser.value=user}
    if(changed==='member'){const old=appUser.value;appUser.value={role:'user'};appUser.value=old}
    if(changed==='app'){config.appId='other';config.appId='app'}
    if(changed==='route'){route.fullPath='/other';route.fullPath='/edit'}
    if(changed==='dispose')scope.stop()
    token.resolve('token');response.resolve(result)
    if(stage==='token'&&changed!=='stable'){await assert.rejects(flight,/changed/);assert.equal(calls.length,0)}
    else {await flight;assert.equal(calls.length,1);if(changed!=='stable')assert.equal(effects.length,0)}
    scope.stop()
  })
  if(validates) test(`${domain}: mismatched response is rejected`,async()=>{
    const scope=effectScope(),user={uid:'actor',getIdToken:async()=> 'token'}
    const deps={defineFireuxCreatePlan:x=>x,canonicalPlaceId:x=>x,ref,watch,toValue:x=>typeof x==='function'?x():x,useCommandScope,useAuth:()=>({currentUser:ref(user)}),useFireUXConfig:()=>({appId:'app'}),useUserSession:()=>({appUser:ref({role:'admin'}),appPending:ref(false),appError:ref(null),appOutcome:ref('ready')}),useRoute:()=>({fullPath:'/edit'}),useRequireUser:async()=>user,usePlaceDetailState:()=>({publish(){}}),refreshNuxtData:async()=>{},normalizePlaceBusinessHours:x=>x,normalizeHexColor:x=>x,$fetch:async()=>({ok:true,appId:'wrong',slug:'wrong',id:'wrong',created:true,item:{id:'wrong'},place:{id:'wrong'},ingredient:{id:'wrong'}})}
    const api=scope.run(()=>load(path,deps,name)());await assert.rejects(run(api),/response.*(match|invalid)/i);scope.stop()
  })
}
// Body mutation during credentials cannot modify any dispatched request.
for(const [domain,path,name] of domains.filter(row=>['Blog','Job','Marketplace','Ingredient'].includes(row[0]))) test(`${domain}: nested input is copied before credentials`,async()=>{
 const token=deferred(),calls=[],scope=effectScope(),user={uid:'actor',getIdToken:()=>token.promise},input={title:'Original',name:'Original',nested:{value:'Original'}}
 const result={ok:true,appId:'app',slug:'post',item:{id:'store'},ingredient:{id:'ingredient'}}
 const deps={defineFireuxCreatePlan:x=>x,canonicalPlaceId:x=>x,ref,watch,useCommandScope,useAuth:()=>({currentUser:ref(user)}),useFireUXConfig:()=>({appId:'app'}),useUserSession:()=>({appUser:ref({role:'admin'}),appPending:ref(false),appError:ref(null),appOutcome:ref('ready')}),useRoute:()=>({fullPath:'/edit'}),useRequireUser:async()=>user,refreshNuxtData:async()=>{},$fetch:async(_path,options)=>{calls.push(options);return result}}
 const api=scope.run(()=>load(path,deps,name)())
 const pending=domain==='Blog'?api.command('post','update',input):domain==='Job'?api.command('/jobs','PATCH',input):domain==='Marketplace'?api.patchStore('store',input):api.updateIngredient({ingredientId:'ingredient',changes:input})
 input.nested.value='Changed';token.resolve('token');await pending;assert.equal(calls[0].body.nested.value,'Original');scope.stop()
})

const completePlaceDraft = load('extensions/fireux-places/src/runtime/place/utils/place-onboarding-completion.ts', {canonicalPlaceId:x=>x,placeOnboardingErrorMessage:error=>error.message,text:value=>String(value||'').trim()}, 'completePlaceDraft')
for (const stage of ['initial-command','image-upload']) test(`Place onboarding: ${stage} completion stops obsolete follow-on writes`, async()=>{
  const gate=deferred(),calls=[],draft={id:'place',name:'Original',tags:['original']},palette={primary:'#ffffff'}
  let current=true
  const pending=completePlaceDraft({draft,needsEnrichment:true,currencyCode:'CHF',timezone:'Europe/Zurich',brandPalette:palette,imageFile:{name:'avatar'},coverFile:{name:'cover'},isCurrent:()=>current,ensurePlaceExists:async()=>true,completePlaceOnboarding:async input=>{calls.push({command:input});if(stage==='initial-command')await gate.promise},uploadImage:async(path,file)=>{calls.push({path,file});if(stage==='image-upload')await gate.promise;return 'https://example.com/image.webp'}})
  draft.tags[0]='changed';palette.primary='#000000'
  for(let i=0;i<4;i++)await Promise.resolve()
  current=false;gate.resolve();assert.equal((await pending).id,'place')
  assert.deepEqual(calls[0].command.tags,['original']);assert.equal(calls[0].command.brand_palette.primary,'#ffffff')
  assert.equal(calls.filter(call=>call.command).length,1)
  assert.equal(calls.filter(call=>call.path).length,stage==='image-upload'?1:0)
})
