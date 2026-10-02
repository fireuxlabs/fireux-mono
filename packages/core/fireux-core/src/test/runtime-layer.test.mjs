import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import path from 'node:path'
import { getLayerDirectories } from '@nuxt/kit'
import { loadNuxt, build } from 'nuxt'
const root=fileURLToPath(new URL('../../../../../',import.meta.url))
function load(file,deps,result){const source=readFileSync(file,'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'');return compileFunction(`${stripTypeScriptTypes(source)};return ${result}`,Object.keys(deps))(...Object.values(deps))}
const helpers=load(new URL('../config/module/runtime-layer.ts',import.meta.url),{getLayerDirectories,resolve:path.resolve},'({requireNativeRuntimeLayer,requireNativeRuntimeLayerFromPath})')
const filterPagesByGlob=load(new URL('../config/module/pages-config.ts',import.meta.url),{requireNativeRuntimeLayer:helpers.requireNativeRuntimeLayer},'filterPagesByGlob')
test('Native layer membership is read through public directories without touching fallback internals',()=>{const register=load(new URL('../config/module/runtime-layer.ts',import.meta.url),{getLayerDirectories:()=>[{root:'/native/runtime/'}],resolve:path.resolve},'requireNativeRuntimeLayerFromPath');const nuxt={get options(){throw Error('Fallback touched')}};assert.equal(register(nuxt,'/native/runtime'),'/native/runtime')})
test('Jobs native capability-on/off preserves generated route discovery',async()=>{
 const base=path.join(root,'packages/extensions/fireux-jobs/src'),runtime=base+'/runtime'
 const configure=load(base+'/config/module/pages-config.ts',{filterPagesByGlob,requireNativeRuntimeLayer:helpers.requireNativeRuntimeLayer},'configurePages')
 for(const mode of ['native-on','native-off']){
  const dir=path.join(root,'temp/runtime-layer-'+mode);mkdirSync(dir,{recursive:true});const enabled=mode!=='native-off'
  const nuxt=await loadNuxt({cwd:dir,ready:true,overrides:{_prepare:true,dev:false,ssr:false,pages:true,telemetry:false,extends:[runtime],modules:[function(_,nuxt){configure({resolve:p=>path.resolve(base,p)},nuxt,{jobs:enabled,agents:enabled,professionals:enabled})}]}})
  try{await build(nuxt);const paths=[];const visit=pages=>{for(const p of pages||[]){paths.push(p.path);visit(p.children)}};visit(nuxt.apps.default.pages);for(const prefix of ['/jobs','/agents','/professionals'])assert.equal(paths.some(x=>x===prefix||x.startsWith(prefix+'/')),enabled,mode+prefix);assert.equal(nuxt.options._layers.filter(x=>path.resolve(x.cwd)===runtime).length,1)}finally{await nuxt.close()}
 }
})

test('Missing native configuration fails without mutating or reading private layer options',()=>{const requireLayer=load(new URL('../config/module/runtime-layer.ts',import.meta.url),{getLayerDirectories:()=>[],resolve:path.resolve},'requireNativeRuntimeLayerFromPath');const nuxt={get options(){throw Error('Private options touched')}};assert.throws(()=>requireLayer(nuxt,'/missing/runtime'),/Missing native runtime layer: \/missing\/runtime/);assert.throws(()=>requireLayer(nuxt,''),/empty path/)})
