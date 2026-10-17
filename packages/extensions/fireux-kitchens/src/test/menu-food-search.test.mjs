import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(new URL('../runtime/menu/server/index/food-search.ts',import.meta.url),'utf8').replace(/^import.*\n/gm,'').replace(/^export /gm,'')
const {readMatchingMenuDishes,matchesFoodSearch}=compileFunction(stripTypeScriptTypes(source)+';return {readMatchingMenuDishes,matchesFoodSearch}')()
const entry={id:'menus/food',source:{kitchen_id:'venue',menu_id:'food'}}
function database() {
  const reads=[]
  const data={
    'kitchens/venue/menus/food/sections':[{id:'pizza'},{id:'hidden',status:'archived'}],
    'kitchens/venue/menus/food/sections/pizza/items':[{id:'one',dish_id:'margherita'},{id:'duplicate',dish_id:'margherita'},{id:'removed',dish_id:'removed',status:'archived'},{id:'unavailable',dish_id:'unavailable'},{id:'missing',dish_id:'missing'}],
  }
  return {reads,
    collection:path=>({get:async()=>{reads.push(path);return {docs:(data[path]||[]).map(row=>({id:row.id,data:()=>row}))}}}),
    doc:path=>({path}),
    getAll:async(...refs)=>refs.map(ref=>{
      reads.push(ref.path)
      const id=ref.path.split('/').at(-1)
      const dish=id==='margherita'?{name:'Pizza Margherita'}:id==='unavailable'?{name:'Pizza Margherita',status:'archived'}:undefined
      return {id,exists:!!dish,data:()=>dish}
    }),
  }
}
test('search matches dish names case/accent independently and ignores archived sections, placements and dishes',async()=>{
  const db=database()
  assert.deepEqual(await readMatchingMenuDishes(db,entry,'MARGHÉRITA'),[{id:'margherita',name:'Pizza Margherita'}])
  assert.equal(db.reads.filter(path=>path.endsWith('/dishes/margherita')).length,1)
  assert.ok(!db.reads.some(path=>path.includes('/hidden/')||path.endsWith('/dishes/removed')))
  assert.ok(matchesFoodSearch('Pizza Margherita','margherita pizza'))
  assert.ok(!matchesFoodSearch('Pizza Margherita','salad'))
})
test('document menus and missing ownership do not search catalogue dishes',async()=>{
  const db=database()
  assert.deepEqual(await readMatchingMenuDishes(db,{...entry,kind:'doc'},'pizza'),[])
  assert.deepEqual(await readMatchingMenuDishes(db,{id:'unknown'},'pizza'),[])
  assert.deepEqual(db.reads,[])
})
test('failed content reads remain errors rather than false empty results',async()=>{
  await assert.rejects(readMatchingMenuDishes({collection:()=>({get:async()=>{throw new Error('Unavailable')}})},entry,'pizza'),/Unavailable/)
})
