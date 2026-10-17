import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref } from 'vue'
const source = readFileSync(new URL('../runtime/menu/components/Collection/Results.vue', import.meta.url), 'utf8')
test('Menu discovery retains each menu, filters services and preserves destination intent without a Kitchen read', () => {
  const rows = [
    { id: 'food', name: 'Pizza', contexts: ['collection', 'delivery'], source: { kitchen_slug: 'baren' }, offerings: [{id:'pickup'}, {id:'courier'}, {id:'tables'}], offering_options: [{ kitchen_offering_id:'pickup', type:'collection' }, { kitchen_offering_id:'courier', type:'delivery' }, { kitchen_offering_id:'tables', type:'dine_in' }] },
    { id: 'breakfast', name: 'Breakfast', contexts: [], source: { kitchen_slug: 'baren' }, offering_options: [{type:'dine_in'}] },
    { id: 'paused', name: 'Paused', source: { kitchen_slug: 'elsewhere' }, offering_options: [{type:'collection',paused:true}] },
  ]
  const script = source.split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import.*\n/gm, '')
  const deps = { computed, ref, defineProps: () => ({menus:rows}), useCollectionSearch: ({items}) => ({query:ref(''),visibleItems:items,visibleCount:computed(()=>items.value.length)}), directoryMenuRouteScope: kitchenSlug=>({kind:'directory',kitchenSlug}), rootMenuRouteScope:()=>({kind:'root'}), menuRouteIndexPath:(scope,service)=>`/kitchens/${scope.kitchenSlug}/menu.${service}`, menuRoutePath:({scope,menuId})=>`/kitchens/${scope.kitchenSlug}/menus/${menuId}` }
  const api = compileFunction(`${stripTypeScriptTypes(script)}; return {service,visibleItems,destination,servingTimes,groups}`, Object.keys(deps))(...Object.values(deps))
  assert.equal(api.visibleItems.value.length,1)
  assert.equal(api.groups.value.length,1)
  assert.equal(api.groups.value[0].menus.length,1)
  assert.equal(api.groups.value[0].actions.length,2)
  assert.equal(api.groups.value[0].to,'/kitchens/baren/menu.collection')
  assert.equal(api.groups.value[0].offerings.length,2)
  assert.equal(api.destination(rows[0]),'/kitchens/baren/menus/food')
  api.service.value='collection'
  assert.deepEqual(api.visibleItems.value.map(row=>row.id),['food'])
  assert.equal(api.destination(rows[0]),'/kitchens/baren/menu.collection')
  assert.deepEqual(api.servingTimes(rows[0]),[{id:'pickup'}])
  api.service.value='delivery'
  assert.equal(api.destination(rows[0]),'/kitchens/baren/menu.delivery')
  assert.deepEqual(api.servingTimes(rows[0]),[{id:'courier'}])
  assert.doesNotMatch(source,/useKitchenCollection|MenuCollectionList/)
})
