import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed, watch } from 'vue'
function load(path,deps,result,component=false){
 deps=commandScopeDeps({watch,isFirestoreDocumentId,useRoute:()=>({fullPath:'/recipes/a'}),...deps})
 let source=readFileSync(new URL(path,import.meta.url),'utf8')
 if(component)source=source.split('<script setup lang="ts">')[1].split('</script>')[0]
 source=source.replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export type[^\n]*from[^\n]*\n/gm,'').replace(/^export /gm,'')
 return compileFunction(`${stripTypeScriptTypes(source)};return ${result}`,Object.keys(deps))(...Object.values(deps))
}
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}}
function scope(){
 const currentUser=ref({uid:'u'}),selectedId=ref('k'),routePath=ref('/recipes/a'),disposed=[]
 const useRecipeScope=load('../../runtime/kitchen/composables/recipe/useRecipeScope.ts',{watch,onBeforeUnmount:fn=>disposed.push(fn),useAuth:()=>({currentUser})},'useRecipeScope')
 return {currentUser,selectedId,routePath,useRecipeScope,disposed}
}
test('Recipe mutation rejects obsolete pre-dispatch intent and preserves an already committed response',async()=>{
 for(const stage of ['prepare','auth','token','response'])for(const changed of ['account','kitchen','route','logout','dispose']){
  const h=scope(),prep=deferred(),auth=deferred(),token=deferred(),response=deferred(),calls=[]
  const user={uid:'u',getIdToken:()=>token.promise};h.currentUser.value=user
  const factory=load('../../runtime/kitchen/composables/recipe/useRecipeMutation.ts',{useRecipeScope:h.useRecipeScope,useRoute:()=>({get fullPath(){return h.routePath.value}}),useAuth:()=>({currentUser:h.currentUser}),useKitchenWorkspaceSelection:()=>({selectedId:h.selectedId}),useWorkspaceWriteGuard:()=>({requireWritableData(){}}),useRequireUser:()=>auth.promise,$fetch:(...args)=>{calls.push(args);return response.promise}},'useRecipeMutation')
  const pending=factory().mutate('POST',{draft:{name:'Dough'}},'k',()=>prep.promise),rejected=stage==='response'?pending:assert.rejects(pending,/changed/)
  if(stage!=='prepare'){prep.resolve({kitchenId:'k',draft:{name:'Dough'}});await Promise.resolve()}
  if(stage==='token'||stage==='response'){auth.resolve(user);await Promise.resolve()}
  if(stage==='response'){token.resolve('token');await Promise.resolve()}
  if(changed==='kitchen'){h.selectedId.value='other';h.selectedId.value='k'}
  else if(changed==='route'){h.routePath.value='/other';h.routePath.value='/recipes/a'}
  else if(changed==='dispose')h.disposed.forEach(fn=>fn())
  else{h.currentUser.value=changed==='logout'?null:{uid:'b'};h.currentUser.value=user}
  prep.resolve({kitchenId:'k',draft:{name:'Dough'}});auth.resolve(user);token.resolve('token');response.resolve({id:'dough'});await rejected
  assert.equal(calls.length,stage==='response'?1:0)
 }
})
test('Recipe create keeps source language/translations and failedLanguages without provider calls when translate false',async()=>{
 const useTranslationSeed=load('../../../../fireux-translation/src/runtime/useTranslationSeed.ts',{FIREUX_CORE_LANGUAGE_CODES:['en','de'],useTranslate:()=>({translate:()=>{throw Error('Provider must not run')}})},'useTranslationSeed')
 let body
 const create=load('../../runtime/kitchen/composables/recipe/useRecipeCreate.ts',{useTranslationSeed,useRecipeMutation:()=>({mutate:async(method,input,kitchenId,prepare)=>{assert.equal(method,'POST');body=await prepare(JSON.parse(JSON.stringify({...input,kitchenId})),()=>{});return {id:'dough'}}})},'useRecipeCreate')()
 const result=await create.createRecipe({name:'Dough',description:'Mix',names:{de:'Teig'}},{kitchenId:'k'},{translate:false,sourceLanguage:'en'})
 assert.deepEqual(result,{id:'dough',failedLanguages:[]});assert.deepEqual(body.draft.names,{de:'Teig',en:'Dough'});assert.equal(body.draft.descriptions.en,'Mix');assert.equal(body.draft.source_language,'en')
})
const prep=load('../../runtime/kitchen/utils/recipe-preparation.ts',{isFirestoreDocumentId},'({normalizeRecipePreparation,validateRecipePreparation})')
test('Recipe Form captures save identity and suppresses stale success/failure without creating Prep',async()=>{
 for(const mode of ['create','update'])for(const outcome of ['success','error']){
  const h=scope(),pending=deferred(),saved=[],calls=[],recipe=ref(mode==='update'?{id:'a',name:'Before',source_language:'en',names:{en:'Before',de:'German'},descriptions:{de:'German notes'}}:null)
  const props={get kitchenId(){return h.selectedId.value},get recipe(){return recipe.value},canWrite:true,databaseId:'db',rootCollection:'kitchens'}
  const api=load('../../runtime/kitchen/components/Workspace/Recipes/Form.vue',{ref,computed,...prep,useRecipeScope:h.useRecipeScope,defineProps:()=>props,defineEmits:()=> (...args)=>saved.push(args),useKitchenIngredients:()=>({ingredients:ref([]),pending:ref(false),error:ref(null)}),useKitchenPrepItems:()=>({prepItems:ref([]),error:ref(null)}),useKitchenPrepItemCreate:()=>({createPrepItem:()=>{throw Error('Separate Prep button must not run')}}),useRecipeCreate:()=>({createRecipe:(...args)=>{calls.push(args);return pending.promise}}),useRecipeUpdate:()=>({updateRecipe:(...args)=>{calls.push(args);return pending.promise}})},'({save,name,message,saving})',true)
  api.name.value='Dough';const result=api.save();assert.equal(calls.length,1)
  if(mode==='update'){assert.deepEqual(calls[0][1].names,{en:'Dough'});assert.deepEqual(calls[0][1].descriptions,{en:''})}
  h.selectedId.value='other';h.selectedId.value='k'
  if(outcome==='success')pending.resolve({id:'dough'});else pending.reject(Error('Obsolete failure'))
  await result;assert.deepEqual(saved,[]);assert.equal(api.message.value,'');assert.equal(api.saving.value,false)
 }
})
test('Recipe deletion suppresses stale navigation and notification',async()=>{
 const h=scope(),pending=deferred(),navigations=[],notices=[],recipeId=ref('a')
 const api=load('../../runtime/kitchen/components/Workspace/Recipes/Detail.vue',{ref,computed,watch,useRecipeScope:h.useRecipeScope,navigateTo:x=>navigations.push(x),window:{confirm:()=>true},useToastify:()=>({add:x=>notices.push(x)}),useKitchenWorkspaceRecipe:()=>({recipe:ref({name:'Dough'}),recipeId,kitchenId:h.selectedId,dishUsage:ref([]),outcome:ref('ready'),storageKitchenId:ref('k'),pending:ref(false),error:ref(null),canWrite:ref(true)}),useKitchenIngredients:()=>({ingredients:ref([])}),useKitchenPrepItems:()=>({prepItems:ref([])}),useRecipeDelete:()=>({deleteRecipe:()=>pending.promise})},'({deleteSelectedRecipe,deleting})',true)
 const result=api.deleteSelectedRecipe();recipeId.value='b';recipeId.value='a';pending.resolve();await result
 assert.deepEqual(navigations,[]);assert.deepEqual(notices,[]);assert.equal(api.deleting.value,false)
})

test('Recipe update/delete adapters preserve exact body grammar',async()=>{
 const calls=[],useRecipeMutation=()=>({mutate:async(...args)=>{calls.push(args);return {id:'a'}}})
 const update=load('../../runtime/kitchen/composables/recipe/useRecipeUpdate.ts',{useRecipeMutation},'useRecipeUpdate')()
 const remove=load('../../runtime/kitchen/composables/recipe/useRecipeDelete.ts',{useRecipeMutation},'useRecipeDelete')()
 await update.updateRecipe('a',{names:{en:'New'}},{kitchenId:'k'});await remove.deleteRecipe('a',{kitchenId:'k'})
 assert.deepEqual(calls,[['PATCH',{recipeId:'a',changes:{names:{en:'New'}}},'k'],['DELETE',{recipeId:'a'},'k']])
})
