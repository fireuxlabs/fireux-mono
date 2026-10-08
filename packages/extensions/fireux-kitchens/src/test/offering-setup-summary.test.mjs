import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'

const source = readFileSync(
  new URL('../runtime/kitchen/utils/offering-setup-summary.ts', import.meta.url),
  'utf8'
)
  .replace(/^import type .*\n/gm, '')
  .replace(/^export /gm, '')
const { offeringSetupSummary } = compileFunction(
  `${stripTypeScriptTypes(source)}; return { offeringSetupSummary }`
)()
const menu = { id: 'food-id', slug: 'food', name: 'Food', status: 'published' }
const service = {
  id: 'all-day',
  name: 'All day',
  enabled: false,
  menu_ids: [menu.id],
  hours: {
    timezone: 'Europe/Zurich',
    windows: [{ days: ['monday'], open: '12:00', close: '22:00' }],
  },
  interactions: [
    { type: 'browse', enabled: true },
    { type: 'collection', enabled: true },
  ],
}

test('configuration can be complete while the service is off; it does not claim checkout readiness', () => {
  const summary = offeringSetupSummary(service, [menu], 'ready')
  assert.equal(summary.configured, true)
  assert.equal(summary.canEnable, true)
  assert.equal(summary.paused, false)
  assert.deepEqual(summary.selectedMenus, [menu])
  assert.equal(service.enabled, false)
})

test('only exact selected, published, structured menus satisfy ordering setup', () => {
  for (const menus of [
    [{ ...menu, status: 'draft' }],
    [{ ...menu, doc: { url: 'https://example.test/menu.pdf' } }],
    [{ ...menu, id: 'other-id' }],
    [],
  ]) {
    const summary = offeringSetupSummary(service, menus, 'ready')
    assert.equal(summary.configured, false)
    assert.equal(summary.checks[0].done, false)
  }
})

test('unknown or failed reads never reuse stale menus as configured', () => {
  for (const outcome of ['idle', 'pending', 'error']) {
    const summary = offeringSetupSummary(service, [menu], outcome)
    assert.equal(summary.configured, false)
    assert.deepEqual(summary.selectedMenus, [])
    assert.equal(summary.checks[0].pending, outcome !== 'error')
  }
})

test('browse and on-site options do not imply online collection or delivery is configured', () => {
  for (const type of [
    'browse',
    'eat_in',
    'takeaway',
    'dine_in',
    'room_service',
  ]) {
    assert.equal(
      offeringSetupSummary(
        { ...service, interactions: [{ type, enabled: true }] },
        [menu],
        'ready'
      ).configured,
      false
    )
  }
})

test('paused summary requires every configured online option to be paused', () => {
  const collection = {
    type: 'collection',
    enabled: true,
    availability: { paused: true },
  }
  assert.equal(
    offeringSetupSummary(
      { ...service, interactions: [collection] },
      [menu],
      'ready'
    ).paused,
    true
  )
  assert.equal(
    offeringSetupSummary(
      {
        ...service,
        interactions: [collection, { type: 'delivery', enabled: true }],
      },
      [menu],
      'ready'
    ).paused,
    false
  )
})

test('enable guidance mirrors minimum command requirements, including browse-only services', () => {
  assert.equal(
    offeringSetupSummary({ ...service, hours: undefined }, [menu], 'ready')
      .canEnable,
    false
  )
  assert.equal(
    offeringSetupSummary({ ...service, menu_ids: [] }, [menu], 'ready')
      .canEnable,
    false
  )
  const browseOnly = {
    ...service,
    hours: undefined,
    interactions: [{ type: 'browse', enabled: true }],
  }
  const summary = offeringSetupSummary(browseOnly, [menu], 'ready')
  assert.equal(summary.canEnable, true)
  assert.equal(summary.configured, false)
})
