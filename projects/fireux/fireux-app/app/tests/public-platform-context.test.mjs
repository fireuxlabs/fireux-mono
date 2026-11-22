import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
const root=new URL('../../../../../',import.meta.url)
const source=p=>readFileSync(new URL(p,root),'utf8')
const load=(s,deps,name)=>compileFunction(stripTypeScriptTypes(s.replace(/^import.*\n/gm,'').replace(/^export /gm,''))+`;return ${name}`,Object.keys(deps))(...Object.values(deps))
const read=load(source('projects/fireux/fireux-app/shared/platform-context.ts'),{},'readPlatformContext')
test('Public explanation is fresh, bounded and honest about the proving example',()=>{const a=read();a.structure.app='changed';assert.notEqual(read().structure.app,'changed');assert.match(a.mission.example,/not proof of a completed automatic App generator/);assert.match(a.consumption.boundary,/does not authorize/);assert.equal(a.consumption.endpoint,'/api/fireux/context/platform');assert.equal(source('projects/fireux/fireux-app/shared/platform-context.ts').includes('readFile'),false)})
test('Existing public endpoint preserves schema and content revision',()=>{const s=source('projects/fireux/fireux-app/server/api/fireux/context/platform.get.ts').replace('export default','const handler =');const headers={};const handler=load(s,{createHash,defineEventHandler:f=>f,setResponseHeader:(_,k,v)=>headers[k]=v,readPlatformContext:read},'handler');const result=handler({});assert.equal(result.schemaVersion,1);assert.equal(result.visibility,'public');assert.equal(result.revision,createHash('sha256').update(JSON.stringify(read())).digest('hex'));assert.equal(headers['cache-control'],'public, max-age=300')})
test('Contributor guides stay with their owning ecosystems', () => {
  const contexts = [
    ['misebox', 'misebox'],
    ['werkbox', 'werkbox'],
    ['buenohost', 'buenohost'],
    ['sharer', 'sharer'],
    ['apps-that-slap', 'slap'],
  ]
  for (const [file, owner] of contexts) {
    const packagePath = `packages/ecosystem/fireux-${owner}`
    const contextPath = `docs/ai/${file}-context.md`
    const guide = source(`${packagePath}/${contextPath}`)
    assert.ok(source(`${packagePath}/README.md`).includes(`(${contextPath})`))
    assert.equal(existsSync(new URL(contextPath, root)), false)
    assert.match(guide, /AGENTS.md/)
    assert.match(guide, /gpt-context.md/)
  }
})
