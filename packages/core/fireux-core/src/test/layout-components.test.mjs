import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { loadNuxt, build } from 'nuxt'
import { addComponentsDir } from '@nuxt/kit'
const root=fileURLToPath(new URL('../../../../../',import.meta.url))
test('Layout component registration preserves component names and separate native layouts',async()=>{
 const source=readFileSync(new URL('../config/module/module-helpers.ts',import.meta.url),'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'')
 const register=compileFunction(`${stripTypeScriptTypes(source)};return registerLayoutComponents`,['addComponentsDir','existsSync'])(addComponentsDir,existsSync)
 const dir=path.join(root,'temp/layout-components-proof');mkdirSync(dir,{recursive:true})
 const bases=['packages/extensions/fireux-kitchens/src','packages/ecosystem/fireux-misebox/src'].map(x=>path.join(root,x))
 const nuxt=await loadNuxt({cwd:dir,ready:true,overrides:{_prepare:true,dev:false,ssr:false,pages:false,telemetry:false,extends:bases.map(x=>x+'/runtime'),modules:[function(){for(const base of bases)register({resolve:p=>path.resolve(base,p)})}]}})
 try{await build(nuxt);const components=nuxt.apps.default.components.filter(x=>bases.some(base=>x.filePath.startsWith(base+'/runtime/layouts/'))).map(x=>({name:x.pascalName,file:x.filePath})).sort((a,b)=>a.name.localeCompare(b.name));const layouts=Object.keys(nuxt.apps.default.layouts).sort();assert.deepEqual(components.map(x=>x.name),['Menu']);for(const name of ['menu'])assert.ok(layouts.includes(name));for(const name of ['kitchen-menu','kitchen-orders','misebox-tenant'])assert.ok(!layouts.includes(name));writeFileSync(dir+'/proof.json',JSON.stringify({components,layouts},null,2))}finally{await nuxt.close()}
})
