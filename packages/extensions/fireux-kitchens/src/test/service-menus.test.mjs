import assert from 'node:assert/strict'
import test from 'node:test'
import { serviceMenuPolicy } from './offering-test-helpers.mjs'
const { isServiceMenu, serviceMenuOptions, serviceMenuReadiness } =
  serviceMenuPolicy
const menu = {
  id: 'food',
  name: 'Food',
  format: 'interactive',
  status: 'published',
  schedule: 'regular',
}
const invalid = [
  { ...menu, schedule: 'daily' },
  { ...menu, format: 'document' },
  { ...menu, doc: { url: 'https://example.test/menu.pdf' } },
  { ...menu, status: 'archived' },
]

test('only regular interactive menus supply service items; draft and published are selectable', () => {
  assert.equal(isServiceMenu(menu), true)
  assert.equal(isServiceMenu({ id: 'food', status: 'published' }), true)
  assert.equal(isServiceMenu({ ...menu, status: 'draft' }), true)
  for (const entry of invalid) {
    assert.equal(isServiceMenu(entry), false)
    assert.deepEqual(serviceMenuOptions([entry]), [])
    assert.equal(serviceMenuReadiness([entry.id], [entry]).canEnable, false)
  }
})

test('unavailable existing choices stay visible for removal and cannot satisfy readiness', () => {
  for (const entry of invalid) {
    const [option] = serviceMenuOptions([entry], [entry.id])
    assert.equal(option.value, entry.id)
    assert.match(option.description, /Unavailable.*remove/)
    assert.equal(
      serviceMenuReadiness([entry.id], [entry]).validSelection,
      false
    )
  }
})

test('drafts can be saved off; enable requires a published menu and every selection must be eligible', () => {
  const draft = { ...menu, id: 'draft', status: 'draft' }
  assert.deepEqual(serviceMenuReadiness(['draft'], [draft]), {
    validSelection: true,
    hasPublishedMenu: false,
    canEnable: false,
  })
  assert.equal(
    serviceMenuReadiness(['draft', 'food'], [draft, menu]).canEnable,
    true
  )
  for (const extra of [
    undefined,
    ...invalid.map((entry) => ({ ...entry, id: 'bad' })),
  ]) {
    assert.equal(
      serviceMenuReadiness(['food', 'bad'], [menu, ...(extra ? [extra] : [])])
        .canEnable,
      false
    )
  }
  assert.equal(serviceMenuReadiness([], [menu]).canEnable, false)
  assert.equal(serviceMenuReadiness(['food'], []).canEnable, false)
})

test('missing saved menu references remain removable instead of becoming hidden selections', () => {
  const options = serviceMenuOptions([menu], ['food', 'missing'])
  assert.deepEqual(
    options.map((row) => row.value),
    ['food', 'missing']
  )
  assert.match(options[1].description, /remove from selection/)
  assert.equal(
    serviceMenuReadiness(['food', 'missing'], [menu]).canEnable,
    false
  )
  assert.equal(serviceMenuReadiness(['food'], [menu]).canEnable, true)
})
