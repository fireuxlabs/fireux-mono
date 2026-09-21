import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { randomUUID } from 'node:crypto'
import ts from 'typescript'
const compile = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText
const dates = { exports: {} }
runInNewContext(compile('../runtime/menu/utils/menu-date.ts'), {
  exports: dates.exports,
  Date,
})
const menuPath = 'kitchens/k/menus/m'
function harness(tier = 'premium') {
  const records = new Map([[menuPath, { status: 'draft', schedule: 'daily' }]])
  const target = (k, m, s) =>
    `kitchens/${k}/menus${m ? `/${m}/sections${s ? `/${s}/items` : ''}` : ''}`
  const api = { exports: {} }
  const require = (id) => {
    if (id === 'node:crypto') return { randomUUID }
    if (id === 'h3')
      return {
        createError: (data) =>
          Object.assign(new Error(data.statusMessage), data),
      }
    if (id.includes('menu-date')) return dates.exports
    if (id.endsWith('/targets'))
      return {
        serverKitchenMenusTarget: (k) => target(k),
        serverKitchenMenuSectionsTarget: (k, m) => target(k, m),
        serverKitchenMenuItemsTarget: target,
      }
    if (id.endsWith('/path'))
      return {
        requireFirestoreDocumentId: (v) => {
          if (!v || String(v).includes('/')) throw Error('Invalid id')
          return v
        },
      }
    if (id.endsWith('/stamps'))
      return { serverAuditStamp: () => ({ by: 'actor' }) }
    if (id.endsWith('/mutation-authority'))
      return {
        readKitchenMutationActor: async () => ({
          uid: 'actor',
          runtimeAppId: 'app',
        }),
        requireKitchenMutationAuthority: async () => {
          if (tier === 'denied') throw Error('Denied')
          return { subscription: tier }
        },
      }
    if (id.endsWith('/server-transaction'))
      return {
        runGuardedServerTransaction: async (_scope, fn) => {
          const writes = []
          await fn({
            read: async (path, id) => ({
              exists: records.has(`${path}/${id}`),
              data: records.get(`${path}/${id}`),
            }),
            readAll: async (path, limit) =>
              [...records]
                .filter(
                  ([key]) =>
                    key.startsWith(path + '/') &&
                    !key.slice(path.length + 1).includes('/')
                )
                .slice(0, limit)
                .map(([key, data]) => ({ id: key.split('/').at(-1), data })),
            create: (path, id, data) => writes.push([`${path}/${id}`, data]),
            update: (path, id, data) =>
              writes.push([
                `${path}/${id}`,
                { ...records.get(`${path}/${id}`), ...data },
              ]),
          })
          for (const [key, data] of writes) records.set(key, data)
        },
      }
    throw Error(id)
  }
  runInNewContext(compile('../runtime/menu/server/daily-menu.ts'), {
    exports: api.exports,
    require,
  })
  return {
    records,
    run: (input) =>
      api.exports.configureDailyMenu(
        {},
        { kitchenId: 'k', menuId: 'm', ...input }
      ),
  }
}
test('calendar dates reject impossible dates and cross month boundaries correctly', () => {
  assert.equal(dates.exports.isMenuDate('2026-02-30'), false)
  assert.equal(dates.exports.isMenuDate('2028-02-29'), true)
  assert.equal(dates.exports.shiftMenuDate('2026-09-30', 1), '2026-10-01')
})
test('daily selection is dated, kitchen-owned and does not alter existing menus', async () => {
  const h = harness()
  await h.run({ date: '2026-09-21', label: 'Lunch' })
  const selection = [...h.records].find(([path]) =>
    path.includes('/sections/')
  )[1]
  assert.equal(selection.date, '2026-09-21')
  assert.equal(selection.kitchen_id, 'k')
  assert.equal(h.records.get(menuPath).status, 'draft')
  await assert.rejects(
    h.run({ date: '2026-09-21', label: 'Lunch' }),
    /already exists/
  )
})
for (const tier of ['free', 'denied'])
  test(`${tier} cannot write daily selections`, async () => {
    const h = harness(tier)
    await assert.rejects(h.run({ date: '2026-09-21', label: 'Lunch' }))
    assert.equal(h.records.size, 1)
  })
test('copy uses new identities and reuses dish references; refuses occupied dates', async () => {
  const h = harness()
  h.records.set(menuPath + '/sections/s', {
    date: '2026-09-21',
    label: 'Lunch',
    status: 'active',
  })
  h.records.set(menuPath + '/sections/s/items/i', {
    dish_id: 'bratwurst',
    section_id: 's',
    status: 'active',
    price: 0,
  })
  await h.run({ date: '2026-09-22', copyFrom: '2026-09-21' })
  const copied = [...h.records].find(
    ([path, data]) => path.includes('/sections/') && data.date === '2026-09-22'
  )
  const item = [...h.records].find(([path]) =>
    path.startsWith(copied[0] + '/items/')
  )[1]
  assert.equal(item.dish_id, 'bratwurst')
  assert.notEqual(item.section_id, 's')
  await assert.rejects(
    h.run({ date: '2026-09-22', copyFrom: '2026-09-21' }),
    /already has/
  )
})
