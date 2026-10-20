import test from 'node:test'
import assert from 'node:assert/strict'
import { loadOfferingSource } from './offering-test-helpers.mjs'
const { foodItemSummary, foodMenuSummary, foodPromotionSummary } = loadOfferingSource(
  'kitchen/utils/food-catalogue-summary', 'foodItemSummary,foodMenuSummary,foodPromotionSummary'
)
test('items flag missing names and prices, allowing zero and variant prices without requiring photos', () => {
  assert.deepEqual(foodItemSummary([{name:'Water',price:0},{name:'Pizza',price_options:[{price:12}]}]).flags, [])
  assert.deepEqual(foodItemSummary([{name:' ',price:-1},{name:'Soup'}]).flags, ['1 missing a name','2 need a price'])
  assert.equal(foodItemSummary([]).status, 'No items yet')
})
test('Menu summary separates drafts and excludes daily and archived menus', () => {
  const summary = foodMenuSummary([
    {name:'Main',status:'published'}, {name:'Draft',status:'draft'},
    {name:'Daily',status:'draft',schedule:'daily'}, {status:'archived'},
    {name:'PDF',status:'draft',format:'document'},
  ])
  assert.equal(summary.status, '1 published · 2 draft')
  assert.deepEqual(summary.flags,['1 missing a document'])
})
test('Promotions flag incomplete choices and missing dishes without treating no promotions as a problem', () => {
  assert.deepEqual(foodPromotionSummary([],[]), {status:'No promotions',flags:[]})
  const offer={name:'Sunday',status:'active',days:['sunday'],dishes:[{dishId:'pizza',price:11}]}
  assert.deepEqual(foodPromotionSummary([offer],[{id:'pizza'}]).flags,[])
  assert.equal(foodPromotionSummary([offer],[]).flags.length,1)
  const deal={name:'Lunch',status:'paused',days:['monday'],price:15,groups:[{name:'Main',choose:1,dishes:[{dishId:'pizza',supplement:0}]}]}
  assert.deepEqual(foodPromotionSummary([deal],[{id:'pizza'}]),{status:'0 active · 1 paused',flags:[]})
  deal.groups[0].choose=2
  assert.equal(foodPromotionSummary([deal],[{id:'pizza'}]).flags.length,1)
})
