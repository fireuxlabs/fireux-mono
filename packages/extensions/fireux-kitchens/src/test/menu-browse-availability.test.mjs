import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(new URL('../runtime/menu/server/index/browse-availability.ts',import.meta.url),'utf8').replace(/^import.*\n/gm,'').replace('export async','async')
const hasPublishedPublicMenu = compileFunction(stripTypeScriptTypes(source)+';return hasPublishedPublicMenu',['FieldPath'])({documentId:()=> '__name__'})
function database(rows,fail=false) {
  const calls=[]
  const query=(after='')=>({
    where:(field,operator,value)=>{assert.deepEqual([field,operator,value],['status','==','published']);return query(after)},
    orderBy:()=>query(after),limit:value=>{assert.equal(value,50);return query(after)},startAfter:cursor=>query(cursor),
    get:async()=>{calls.push(after);if(fail)throw new Error('Unavailable');return {docs:rows.filter(row=>row.id>after&&row.status==='published').slice(0,50).map(row=>({id:row.id,data:()=>row}))}},
  })
  return {calls,collection:path=>{assert.equal(path,'kitchens/venue/menus');return query()}}
}
test('Browse availability comes from public published interactive or document Menus without service settings',async()=>{
  for(const format of ['interactive','document']) {
    const db=database([{id:'menu',status:'published',audience:'public',format}])
    assert.equal(await hasPublishedPublicMenu(db,'venue'),true)
  }
  assert.equal(await hasPublishedPublicMenu(database([{id:'default',status:'published'}]),'venue'),true)
})
test('draft, archived, private-link and protected-group menus do not grant public Browse',async()=>{
  for(const row of [{status:'draft'},{status:'archived'},{status:'published',audience:'private_link'},{status:'published',audience:'protected_group'}])
    assert.equal(await hasPublishedPublicMenu(database([{id:'menu',...row}]),'venue'),false)
  assert.equal(await hasPublishedPublicMenu(database([]),'venue'),false)
})
test('private records before the public menu cannot hide Browse, and failed reads remain failures',async()=>{
  const rows=Array.from({length:50},(_,i)=>({id:`a${String(i).padStart(2,'0')}`,status:'published',audience:'private_link'}))
  const db=database([...rows,{id:'z',status:'published',audience:'public'}])
  assert.equal(await hasPublishedPublicMenu(db,'venue'),true)
  assert.deepEqual(db.calls,['','a49'])
  await assert.rejects(hasPublishedPublicMenu(database([],true),'venue'),/Unavailable/)
})
