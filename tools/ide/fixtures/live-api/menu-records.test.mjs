import assert from 'node:assert/strict'
import test from 'node:test'
import { readItemOffer } from '../../../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item-pricing.ts'
import { readPlaceCurrencyCode } from '../../../../packages/extensions/fireux-places/src/runtime/place/utils/place-spine.ts'
import { dailyMenuSelection } from '../../../../packages/extensions/fireux-kitchens/src/runtime/menu/utils/calendar/daily.ts'
import {
  fixtureItemChoices,
  fixtureItemPath,
  fixtureMenuDate,
  fixtureMenuPath,
  fixtureMenuRecords,
} from './server/utils/menu-records.mjs'

test('the Kitchen-owned seed recipe is admitted by canonical selling, currency and Daily selection readers', () => {
  const records = new Map(
    fixtureMenuRecords({
      at: { seconds: 1, nanoseconds: 0 },
      by: 'fixture-actor',
    })
  )
  const item = records.get(fixtureItemPath)
  const offer = readItemOffer(item)
  assert.equal(offer.price, 25)
  assert.equal(offer.choice_groups[0].options[0].price, 2)
  assert.equal(readPlaceCurrencyCode({ default_currency_code: 'CHF' }), 'CHF')
  const selection = dailyMenuSelection(
    records.get(fixtureMenuPath),
    'Europe/Zurich',
    new Date('2026-11-16T12:00:00Z')
  )
  assert.equal(selection.date, fixtureMenuDate)
  assert.equal(selection.published, true)
  const changed = readItemOffer({
    ...item,
    price: 27,
    choice_groups: fixtureItemChoices(3),
  })
  assert.equal(changed.price, 27)
  assert.equal(changed.choice_groups[0].options[0].price, 3)
})

test('placements retain only references while date withdrawal and disabled translation remain explicit', () => {
  const records = new Map(
    fixtureMenuRecords({
      at: { seconds: 1, nanoseconds: 0 },
      by: 'fixture-actor',
    })
  )
  const placement = records.get(
    `${fixtureMenuPath}/sections/selection/items/roll-placement`
  )
  assert.equal(placement.dish_id, 'roll')
  for (const field of [
    'name',
    'price',
    'image',
    'choice_groups',
    'price_options',
    'add_ons',
  ])
    assert.equal(Object.hasOwn(placement, field), false)
  const selection = dailyMenuSelection(
    { ...records.get(fixtureMenuPath), published_dates: [] },
    'Europe/Zurich',
    new Date('2026-11-16T12:00:00Z')
  )
  assert.equal(selection.published, false)
  assert.equal(
    records.get('kitchens/place-000/integrations/sproochli').enabled,
    false
  )
})
