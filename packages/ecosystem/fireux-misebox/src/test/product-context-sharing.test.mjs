import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash } from 'node:crypto'
import test from 'node:test'
const source=readFileSync(new URL('../runtime/app/server/context/product.ts',import.meta.url),'utf8').replace(/^import.*\n/gm,'').replace(/^export /gm,'')
const read=compileFunction(`${stripTypeScriptTypes(source)};return sharedProductContext`,['createHash','createError'])(createHash,e=>Object.assign(new Error(e.statusMessage),e))
const data={title:'Misebox',summary:'Product background',source:'Review',reviewStatus:'draft',fireuxSharing:{enabled:true,projectId:'misebox',firebaseProjectId:'fireux-2005'},private:'omit'}
test('explicit sharing projects only product context',()=>{
 const result=read(data,'misebox','misebox');assert.equal(result.context.private,undefined);assert.equal(result.context.fireuxSharing,undefined);assert.equal(result.sourcePath,'apps/misebox-app/context/product')
})
test('revoked, absent, wrong-Project, wrong-issuer and changed relationship grants deny',()=>{
 for(const grant of [undefined,{...data.fireuxSharing,enabled:false},{...data.fireuxSharing,projectId:'other'},{...data.fireuxSharing,firebaseProjectId:'other'}]) assert.throws(()=>read({...data,fireuxSharing:grant},'misebox','misebox'),{statusCode:403})
 assert.throws(()=>read(data,'different','misebox'),{statusCode:403})
})
