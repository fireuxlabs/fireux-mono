import assert from 'node:assert/strict'
import test from 'node:test'
import { loadNuxt, build } from 'nuxt'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
const root=fileURLToPath(new URL('../../../../../',import.meta.url))
test('Native Product runtime layer generates interactive create endpoint exactly once',async()=>{
 const dir=path.join(root,'temp/product-create-route');mkdirSync(dir,{recursive:true})
 const runtime=path.join(root,'packages/extensions/fireux-products/src/runtime')
 const nuxt=await loadNuxt({cwd:dir,ready:true,overrides:{_prepare:true,dev:false,ssr:false,pages:false,telemetry:false,extends:[runtime]}})
 try{await build(nuxt);const handlers=[...nuxt._nitro.scannedHandlers,...nuxt._nitro.options.handlers].filter(x=>x.route==='/api/products/create');assert.equal(handlers.length,1);assert.equal(handlers[0].method,'post');assert.equal(handlers[0].handler,path.join(runtime,'server/api/products/create.post.ts'))}finally{await nuxt.close()}
})
