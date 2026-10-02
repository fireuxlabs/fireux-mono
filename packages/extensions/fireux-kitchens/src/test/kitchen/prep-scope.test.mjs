import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed, watch } from 'vue'
function load(path,deps,result,component=false){
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
test('Prep create captures seed inputs and invalidates every async stage on account/Kitchen/route round trips',async()=>{
 for(const stage of ['name','description','auth','token','response'])for(const changed of ['account','kitchen','route','logout','dispose']){
  const h=scope(),name=deferred(),description=deferred(),auth=deferred(),token=deferred(),response=deferred(),calls=[],seeds=[]
  const user={uid:'u',getIdToken:()=>token.promise};h.currentUser.value=user
  const create=load('../../runtime/kitchen/composables/prep-item/useKitchenPrepItemCreate.ts',{watch,onBeforeUnmount:fn=>h.disposed.push(fn),useRoute:()=>({get fullPath(){return h.routePath.value}}),useAuth:()=>({currentUser:h.currentUser}),useKitchenWorkspaceSelection:()=>({selectedId:h.selectedId}),useWorkspaceWriteGuard:()=>({requireWritableData(){}}),useRequireUser:()=>auth.promise,useTranslationSeed:()=>({seedTranslations:input=>{seeds.push(input);return seeds.length===1?name.promise:description.promise}}),$fetch:(...args)=>{calls.push(args);return response.promise}},'useKitchenPrepItemCreate')()
  const draft={name:'Sauce',description:'Original',yield:{quantity:1,unit:'portion'}},pending=create.createPrepItem(draft,{kitchenId:'k'},{translate:false}),rejected=assert.rejects(pending,/changed/)
  const seed={sourceLanguage:'en',text:{en:'Sauce'},failedLanguages:[]}
  if(stage!=='name'){name.resolve(seed);await Promise.resolve()}
  if(['auth','token','response'].includes(stage)){description.resolve(seed);await Promise.resolve()}
  if(['token','response'].includes(stage)){auth.resolve(user);await Promise.resolve()}
  if(stage==='response'){token.resolve('token');await Promise.resolve()}
  draft.description='Changed';draft.yield.quantity=99
  if(changed==='kitchen'){h.selectedId.value='other';h.selectedId.value='k'}
  else if(changed==='route'){h.routePath.value='/other';h.routePath.value='/recipes/a'}
  else if(changed==='dispose')h.disposed.forEach(fn=>fn())
  else{h.currentUser.value=changed==='logout'?null:{uid:'b'};h.currentUser.value=user}
  name.resolve(seed);description.resolve(seed);auth.resolve(user);token.resolve('token');response.resolve({id:'sauce'});await rejected
  assert.equal(calls.length,stage==='response'?1:0)
  if(calls.length)assert.equal(calls[0][1].body.draft.yield.quantity,1)
  assert.equal(seeds[0].translate,false)
 }
})
const prep=load('../../runtime/kitchen/models/recipe-preparation.ts',{},'({normalizeRecipePreparation,validateRecipePreparation})')
test('Recipe Prep button saves only Prep and snapshots quantity for its local unsaved reference',async()=>{
 for(const changed of [false,true]){
  const h=scope(),pending=deferred(),calls=[],recipe=ref({id:'recipe',name:'Recipe'})
  const props={get kitchenId(){return h.selectedId.value},get recipe(){return recipe.value},canWrite:true,databaseId:'db',rootCollection:'kitchens'}
  const api=load('../../runtime/kitchen/components/Workspace/Recipes/Form.vue',{ref,computed,...prep,useRecipeScope:h.useRecipeScope,defineProps:()=>props,defineEmits:()=>()=>{},useKitchenIngredients:()=>({ingredients:ref([]),pending:ref(false),error:ref(null)}),useKitchenPrepItems:()=>({prepItems:ref([]),error:ref(null)}),useKitchenPrepItemCreate:()=>({createPrepItem:(...args)=>{calls.push(args);return pending.promise}}),useRecipeCreate:()=>({createRecipe:()=>{throw Error('Recipe save must remain separate')}}),useRecipeUpdate:()=>({updateRecipe:()=>{throw Error('Recipe save must remain separate')}})},'({createPrep,newPrepName,newPrepQuantity,newPrepUnit,preparation,message,creatingPrep})',true)
  api.newPrepName.value='Sauce';api.newPrepQuantity.value=2;api.newPrepUnit.value='g';const result=api.createPrep();api.newPrepQuantity.value=99
  if(changed){h.currentUser.value=null;h.currentUser.value={uid:'u'}}
  pending.resolve({id:'sauce'});await result
  assert.equal(calls[0][0].yield.quantity,2);assert.equal(calls[0][2].translate,false)
  assert.equal(api.preparation.value.prep_items.length,changed?0:1)
  if(!changed)assert.equal(api.preparation.value.prep_items[0].quantity,2)
  assert.equal(api.creatingPrep.value,false);assert.equal(api.message.value,'')
 }
})
test('Dish Prep button ignores stale failure after focus round trip',async()=>{
 const h=scope(),dishId=ref('dish'),pending=deferred()
 const useDishEditorScope=load('../../runtime/kitchen/composables/dish/useDishEditorScope.ts',{watch,onBeforeUnmount:()=>{},useAuth:()=>({currentUser:h.currentUser})},'useDishEditorScope')
 const api=load('../../runtime/kitchen/components/Workspace/Dishes/Spec.vue',{ref,computed,useDishEditorScope,useRoute:()=>({query:{}}),useKitchenWorkspaceDish:()=>({kitchenId:h.selectedId,dishId,dish:ref({}),canWrite:ref(true)}),useKitchenIngredients:()=>({ingredients:ref([]),error:ref(null)}),useKitchenPrepItems:()=>({prepItems:ref([]),error:ref(null)}),useKitchenRecipeCollection:()=>({recipes:ref([]),error:ref(null)}),useKitchenPrepItemCreate:()=>({createPrepItem:()=>pending.promise}),useDishUpdate:()=>({updateDish:()=>{throw Error('Dish save remains separate')}})},'({createPrep,newPrep,error,creating})',true)
 api.newPrep.value.name='Sauce';const result=api.createPrep();dishId.value='other';dishId.value='dish';pending.reject(Error('Old failure'));await result
 assert.equal(api.error.value,'');assert.equal(api.creating.value,false)
})

test('stable Prep create preserves pure seed maps and failedLanguages return contract',async()=>{
 const h=scope(),calls=[],seedCalls=[]
 const user={uid:'u',getIdToken:async()=>'token'};h.currentUser.value=user
 const api=load('../../runtime/kitchen/composables/prep-item/useKitchenPrepItemCreate.ts',{watch,onBeforeUnmount:()=>{},useRoute:()=>({fullPath:'/recipes/a'}),useAuth:()=>({currentUser:h.currentUser}),useKitchenWorkspaceSelection:()=>({selectedId:h.selectedId}),useWorkspaceWriteGuard:()=>({requireWritableData(){}}),useRequireUser:async()=>user,useTranslationSeed:()=>({seedTranslations:async input=>{seedCalls.push(input);return {sourceLanguage:'en',text:{...input.existingText,en:input.text},failedLanguages:['fr']}}}),$fetch:async(...args)=>{calls.push(args);return {id:'sauce'}}},'useKitchenPrepItemCreate')()
 const result=await api.createPrepItem({name:'Sauce',description:'Mix',names:{de:'Sosse'}},{kitchenId:'k'},{translate:false})
 assert.deepEqual(result,{id:'sauce',failedLanguages:['fr']});assert.equal(seedCalls.every(input=>input.translate===false),true)
 assert.deepEqual(calls[0][1].body.draft.names,{de:'Sosse',en:'Sauce'});assert.equal(calls[0][1].body.draft.source_language,'en')
})
