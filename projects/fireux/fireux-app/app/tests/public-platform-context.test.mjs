import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
const root=new URL('../../../../../',import.meta.url)
const source=p=>readFileSync(new URL(p,root),'utf8')
const load=(s,deps,name)=>compileFunction(stripTypeScriptTypes(s.replace(/^import.*\n/gm,'').replace(/^export /gm,''))+`;return ${name}`,Object.keys(deps))(...Object.values(deps))
const read=load(source('packages/core/fireux-core/src/runtime/utils/platform-context.ts'),{},'readPlatformContext')
test('Public explanation is fresh, bounded and honest about the proving example',()=>{const a=read();a.structure.app='changed';assert.notEqual(read().structure.app,'changed');assert.match(a.mission.example,/not proof of a completed automatic App generator/);assert.match(a.consumption.boundary,/does not authorize/);assert.equal(a.consumption.endpoint,'/api/fireux/context/platform');assert.equal(source('packages/core/fireux-core/src/runtime/utils/platform-context.ts').includes('readFile'),false)})
test('Existing public endpoint preserves schema and content revision',()=>{const s=source('projects/fireux/fireux-app/server/api/fireux/context/platform.get.ts').replace('export default','const handler =');const headers={};const handler=load(s,{createHash,defineEventHandler:f=>f,setResponseHeader:(_,k,v)=>headers[k]=v,readPlatformContext:read},'handler');const result=handler({});assert.equal(result.schemaVersion,1);assert.equal(result.visibility,'public');assert.equal(result.revision,createHash('sha256').update(JSON.stringify(read())).digest('hex'));assert.equal(headers['cache-control'],'public, max-age=300')})
test('Five moved guides have explicit router and narrow viewer consumers',()=>{for(const [file,owner] of [['misebox','misebox'],['werkbox','werkbox'],['buenohost','buenohost'],['sharer','sharer'],['apps-that-slap','slap']]){const path=`packages/ecosystem/fireux-${owner}/docs/ai/${file}-context.md`;assert.ok(existsSync(new URL(path,root)));assert.equal(existsSync(new URL(`docs/ai/${file}-context.md`,root)),false);assert.ok(source('AGENTS.md').includes(path));for(const consumer of ['content.config.ts','server/api/docs-manifest.get.ts'])assert.ok(source(`projects/fireux/fireux-app/${consumer}`).includes(`packages/ecosystem/fireux-${owner}/docs/ai`));assert.match(source(path),/AGENTS.md/);assert.match(source(path),/gpt-context.md/)}})
