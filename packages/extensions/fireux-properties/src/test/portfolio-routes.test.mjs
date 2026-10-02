import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadNuxt, build } from 'nuxt'
import { getLayerDirectories } from '@nuxt/kit'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import path from 'node:path'
const root=fileURLToPath(new URL('../../../../../', import.meta.url))
function load(file,deps,name){const source=readFileSync(file,'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'');return compileFunction(`${stripTypeScriptTypes(source)};return ${name}`,Object.keys(deps))(...Object.values(deps))}
const requireNativeRuntimeLayer=load(path.join(root,'packages/core/fireux-core/src/config/module/runtime-layer.ts'),{getLayerDirectories,resolve:path.resolve},'requireNativeRuntimeLayer')
test('Portfolio capability routes and navigation follow installed owners', async()=>{
for(const enabled of [false,true]){
 const dir=path.join(root,'temp/portfolio-routes-'+(enabled?'enabled':'absent'));mkdirSync(dir,{recursive:true})
 const owners=['properties',...(enabled?['tasks','documents','compliance']:[])]
 const nuxt=await loadNuxt({cwd:dir,ready:true,overrides:{_prepare:true,dev:false,ssr:false,pages:true,telemetry:false,extends:owners.map(owner=>path.join(root,`packages/extensions/fireux-${owner}/src/runtime`)),experimental:{extraPageMetaExtractionKeys:['nav','visibility']},modules:[function(_,nuxt){for(const owner of owners){const base=path.join(root,`packages/extensions/fireux-${owner}/src`);load(base+'/config/module/pages-config.ts',{requireNativeRuntimeLayer},'configurePages')({resolve:p=>path.resolve(base,p)},nuxt)}}]}})
 try{await build(nuxt);const routes=[];function visit(pages){for(const p of pages||[]){if(p.file?.includes('/workspace/portfolio/')&&/\/(tasks|documents|compliance)\.vue$/.test(p.file))routes.push({path:p.path,file:p.file,meta:p.meta});visit(p.children)}}visit(nuxt.apps.default.pages);writeFileSync(dir+'/proof.json',JSON.stringify(routes,null,2));assert.equal(routes.length,enabled?3:0);for(const owner of enabled?['tasks','documents','compliance']:[]){const route=routes.find(x=>x.path===`/workspace/portfolio/${owner}`);assert.ok(route.file.includes(`/fireux-${owner}/`));assert.equal(route.meta.nav.key,`workspace-portfolio-${owner}`);assert.ok(route.meta.visibility.modules.includes(`fireux-${owner}`))}}finally{await nuxt.close()}
}

})
