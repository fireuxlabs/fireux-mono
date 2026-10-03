import { teamControllerFixture } from './workspace-team-command-scope.test.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import { computed,ref,reactive,watch,effectScope,onScopeDispose,nextTick } from 'vue'
const helper=readFileSync(new URL('../runtime/composables/fireux/commands/useCommandScope.ts',import.meta.url),'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'')
const useCommandScope=compileFunction(`${stripTypeScriptTypes(helper)};return useCommandScope`,['watch','onScopeDispose'])(watch,onScopeDispose)
async function fixture(file,names,controllerFixture) {
 let resolve,reject;const pending=new Promise((a,b)=>{resolve=a;reject=b}),events=[],toasts=[]
 const account=controllerFixture?.currentUser ?? ref({uid:'actor'}),membership=controllerFixture?.appUser ?? ref({created:{at:'first'}}),config=controllerFixture?.config ?? reactive({appId:'app-a'})
 const props=reactive({member:{id:'a',name:'Before',userId:''},available:['update','delete'],active:true,open:true,initialName:'Original',create:controllerFixture?.controller.primitives.create ?? (()=>pending),updateMember:controllerFixture?.controller.primitives.update ?? (()=>pending),removeMember:controllerFixture?.controller.primitives.delete ?? (()=>pending)})
 const source=readFileSync(new URL('../runtime/components/Workspace/Team/'+file,import.meta.url),'utf8').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1].replace(/^import[\s\S]*?from '[^']+'\n/gm,'')
 const deps={useAuth:()=>({currentUser:account}),useAppSession:()=>({appUser:membership}),useFireUXConfig:()=>config,computed,ref,watch,useCommandScope,defineProps:()=>props,defineEmits:()=>((...args)=>events.push(args)),defineExpose(){},withDefaults:value=>value,useToast:()=>({add:value=>toasts.push(value)}),useFetch:()=>({data:ref({items:[]}),error:ref(null)})}
 const scope=effectScope(),state=await scope.run(()=>compileFunction(`return (async()=>{${stripTypeScriptTypes(source)};return {${names}}})()`,Object.keys(deps))(...Object.values(deps)))
 return {account,membership,config,props,scope,state,resolve,reject,events,toasts}
}
for(const outcome of ['success','failure']) {
 for(const changed of ['draft','closed','disposed','account','membership','app']) test(`Create person ${outcome} after ${changed} preserves newer intent`,async()=>{
  const f=await fixture('Crud/CreatePerson.vue','submit,query,message,savingId')
  const run=f.state.submit({name:'Original'},'named')
  if(changed==='draft')f.state.query.value='New draft'
  if(changed==='closed'){f.props.active=false;f.props.active=true}
  if(changed==='disposed')f.scope.stop()
  if(changed==='account'){const old=f.account.value;f.account.value={uid:'other'};f.account.value=old}
  if(changed==='membership'){const old=f.membership.value;f.membership.value={created:{at:'second'}};f.membership.value=old}
  if(changed==='app'){f.config.appId='app-b';f.config.appId='app-a'}
  outcome==='success'?f.resolve({memberId:'a',name:'Original'}):f.reject(new Error('Old failure'))
  await run;assert.deepEqual(f.events,[]);assert.equal(f.state.message.value,'');if(changed==='draft')assert.equal(f.state.query.value,'New draft');f.scope.stop()
 })
 for(const file of ['UpdateForm.vue','Settings.vue']) for(const changed of ['member','closed','disposed','account','membership','app']) test(`${file} ${outcome} after ${changed} has no obsolete success/error`,async()=>{
  const update=file==='UpdateForm.vue',f=await fixture(file,update?'save,name,error':'remove,error')
  if(update)f.props.available=true
  const run=update?f.state.save():f.state.remove()
  if(changed==='member')f.props.member={id:'b',name:'New member',userId:''}
  else if(changed==='closed'){f.props.active=false;f.props.active=true}
  else if(changed==='disposed')f.scope.stop()
  else if(changed==='account'){const old=f.account.value;f.account.value={uid:'other'};f.account.value=old}
  else if(changed==='membership'){const old=f.membership.value;f.membership.value={created:{at:'second'}};f.membership.value=old}
  else if(changed==='app'){f.config.appId='app-b';f.config.appId='app-a'}
  await nextTick();outcome==='success'?f.resolve({name:'Before'}):f.reject(new Error('Old failure'))
  await run;assert.deepEqual(f.events,[]);assert.deepEqual(f.toasts,[]);assert.equal(f.state.error.value,'');if(update&&changed==='member')assert.equal(f.state.name.value,'New member');f.scope.stop()
 })
}
test('Closed Create modal rejects an obsolete child completion',async()=>{
 const f=await fixture('Crud/Create.vue','created');f.props.open=false;f.state.created({memberId:'a',name:'A'});assert.deepEqual(f.events,[]);assert.deepEqual(f.toasts,[]);f.scope.stop()
})

for(const domain of ['project','kitchen','supplier','portfolio','property']) for(const changed of ['account','membership','app']) for(const action of ['create','update','delete']) test(`${domain} actual controller → ${action} form suppresses obsolete ${changed} completion`,async()=>{
 const c=teamControllerFixture(domain);let resolve;c.respond(new Promise(r=>resolve=r))
 const file=action==='create'?'Crud/CreatePerson.vue':action==='update'?'UpdateForm.vue':'Settings.vue'
 const names=action==='create'?'submit,message':action==='update'?'save,error':'remove,error'
 const f=await fixture(file,names,c);if(action==='update')f.props.available=true
 const run=action==='create'?f.state.submit({name:'New'},'named'):action==='update'?f.state.save():f.state.remove()
 while(!c.calls.length)await Promise.resolve()
 if(changed==='account'){const old=c.currentUser.value;c.currentUser.value={uid:'other'};c.currentUser.value=old}
 if(changed==='membership'){const old=c.appUser.value;c.appUser.value={subscription:'plus'};c.appUser.value=old}
 if(changed==='app'){c.config.appId='other';c.config.appId='app'}
 resolve({ok:true,memberId:'created',name:'New'});await run;assert.deepEqual(f.events,[]);assert.deepEqual(f.toasts,[]);assert.equal(action==='create'?f.state.message.value:f.state.error.value,'');f.scope.stop();c.scope.stop()
})
