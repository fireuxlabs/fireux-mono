import assert from 'node:assert/strict'
import test from 'node:test'
import { harness, menuPath, rootPath } from './helpers/menu-publication.mjs'

test('directory sync retries from the current status instead of restoring a stale publication', async () => {
  const h = harness({ status: 'published' })
  h.state.retry = (records) =>
    records.set(menuPath, {
      ...records.get(menuPath),
      status: 'draft',
      name: 'Renamed',
    })
  await h.sync()
  assert.equal(h.records.get(rootPath).status, 'draft')
  assert.equal(h.records.get(rootPath).name, 'Renamed')
})

test('root projection reuses the original App doorway, archives duplicates and removes stale description', async () => {
  const h = harness()
  h.records.set(rootPath, {
    status: 'draft',
    description: 'old',
    created: { at: 'original', by: 'original' },
    source: { app_id: 'original-app', kitchen_id: 'k', menu_id: 'm' },
  })
  const duplicate = `${rootPath}-2`
  h.records.set(duplicate, {
    status: 'published',
    source: { app_id: 'app', kitchen_id: 'k', menu_id: 'm' },
  })
  await h.publish()
  assert.equal(h.records.get(rootPath).source.app_id, 'original-app')
  assert.equal(h.records.get(rootPath).created.by, 'original')
  assert.equal(h.records.get(duplicate).status, 'archived')
  assert.equal(Object.hasOwn(h.records.get(rootPath), 'description'), false)
})

test('projection collision exhaustion cannot overwrite another Menu', async () => {
  const h = harness()
  for (let i = 1; i <= 20; i++)
    h.records.set(rootPath + (i === 1 ? '' : `-${i}`), {
      source: { kitchen_id: 'other', menu_id: 'm' },
    })
  const before = structuredClone(h.records)
  await assert.rejects(h.publish(), /No available public Menu identifier/)
  assert.deepEqual(h.records, before)
})

test('validation and directory reads continue across bounded transaction pages', async () => {
  const h = harness()
  for (let i = 0; i < 1000; i++)
    h.records.set(
      `${menuPath}/sections/s/items/a${String(i).padStart(4, '0')}`,
      { status: 'archived' }
    )
  for (let i = 0; i < 100; i++)
    h.records.set(`menus/a${String(i).padStart(3, '0')}`, {
      source: { kitchen_id: 'k', menu_id: `other${i}` },
    })
  h.records.set('menus/z-existing', {
    source: { kitchen_id: 'k', menu_id: 'm' },
    status: 'draft',
  })
  assert.equal((await h.publish()).root.id, 'z-existing')
  assert.equal(h.records.get('menus/z-existing').status, 'published')
  assert.equal(h.records.has(rootPath), false)
})

test('a failed duplicate archival rolls back the canonical doorway and Menu too', async () => {
  const h = harness()
  h.records.set(rootPath, {
    status: 'draft',
    source: { app_id: 'app', kitchen_id: 'k', menu_id: 'm' },
  })
  h.records.set(`${rootPath}-2`, {
    status: 'published',
    source: { app_id: 'app', kitchen_id: 'k', menu_id: 'm' },
  })
  const before = structuredClone(h.records)
  h.state.failPath = `${rootPath}-2`
  await assert.rejects(h.publish(), /write failure/)
  assert.deepEqual(h.records, before)
})
