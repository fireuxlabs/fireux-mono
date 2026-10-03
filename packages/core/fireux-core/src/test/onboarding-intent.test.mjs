import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import { computed,ref,toValue,watch,onScopeDispose,effectScope } from 'vue'
const source=readFileSync(new URL('../runtime/composables/shared/useOnboarding.ts',import.meta.url),'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'')
const useOnboarding=compileFunction(`${stripTypeScriptTypes(source)};return useOnboarding`,['computed','ref','toValue','watch','onScopeDispose'])(computed,ref,toValue,watch,onScopeDispose)
for(const phase of ['validate','finish'])for(const outcome of ['success','failure'])test(`reset during delayed ${phase} ${outcome} preserves new flow`,async()=>{
 let resolve,reject;const delayed=new Promise((a,b)=>{resolve=a;reject=b});let writes=0
 const scope=effectScope(),flow=scope.run(()=>useOnboarding({steps:[{id:'review',validate:()=>phase==='validate'?delayed:true}],onFinish:()=>{writes++;return phase==='finish'?delayed:true}}))
 const run=flow.next();await Promise.resolve();flow.reset();outcome==='success'?resolve(true):reject(new Error('Old failure'));assert.equal(await run,false);assert.equal(flow.error.value,'');assert.equal(flow.pending.value,false);assert.equal(flow.finished.value,false);assert.deepEqual(flow.completedStepIds.value,[]);if(phase==='validate')assert.equal(writes,0);scope.stop()
})
