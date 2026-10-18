import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(new URL('../runtime/kitchen/utils/service-summary.ts', import.meta.url),'utf8')
const tableSource = readFileSync(new URL('../runtime/kitchen/utils/table-service.ts', import.meta.url),'utf8')
const tableChannelEnabled = compileFunction(stripTypeScriptTypes(tableSource.replace(/^import.*\n/gm,'').replace(/export /g,''))+';return tableChannelEnabled')()
const { kitchenServiceSummary } = compileFunction(stripTypeScriptTypes(source.replace(/^import.*\n/gm,'').replace('export function','function'))+';return {kitchenServiceSummary}', ['tableChannelEnabled'])(tableChannelEnabled)
test('public service summary lists configured channels once without exposing policy',()=>{
  const offering={enabled:true,menu_ids:['food'],interactions:[
    {type:'browse',enabled:true},
    {type:'dine_in',enabled:true,table_channels:{staff_pos:true,table_qr:true}},
    {type:'delivery',enabled:true,notifications:{recipient:'secret'}},
    {type:'collection',enabled:false},
  ]}
  assert.deepEqual(kitchenServiceSummary([offering,offering]),['Browse menus','Table service','QR table ordering','Delivery'])
  assert.deepEqual(kitchenServiceSummary([{...offering,enabled:false}]),[])
  assert.deepEqual(kitchenServiceSummary([{...offering,menu_ids:[]}]),[])
  assert.deepEqual(kitchenServiceSummary([]),[])
})

test('service setup uses the glossary labels for eating in and takeaway', () => {
  const labels = readFileSync(new URL('../runtime/kitchen/utils/kitchen-order-label.ts', import.meta.url),'utf8')
  const script = labels.slice(labels.indexOf('export const kitchenOrderTypeLabel'), labels.indexOf('type KitchenOrderLabelInput')).replace('export const','const')
  const label = compileFunction(stripTypeScriptTypes(script)+';return kitchenOrderTypeLabel')()
  assert.equal(label('eat_in'),'Eat in')
  assert.equal(label('takeaway'),'Takeaway')
  assert.equal(label('dine_in'),'Table service')
  assert.equal(label('pre_order'),'Pre-order')
})

test('directory and Workspace agree when table channel settings are absent or explicit', () => {
  const make = table_channels => [{enabled:true,menu_ids:['food'],interactions:[{type:'dine_in',enabled:true,...(table_channels ? {table_channels} : {})}]}]
  assert.deepEqual(kitchenServiceSummary(make()),[])
  assert.deepEqual(kitchenServiceSummary(make({staff_pos:false,table_qr:true})),['QR table ordering'])
  assert.deepEqual(kitchenServiceSummary(make({staff_pos:true,table_qr:false})),['Table service'])
  assert.deepEqual(kitchenServiceSummary(make({staff_pos:false,table_qr:false})),[])
})
