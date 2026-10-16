import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function reader(rows, kitchens) {
  const reads = []
  const snapshot = (path, data) => ({
    id: path.split('/').at(-1),
    ref: { path },
    exists: !!data,
    data: () => data,
  })
  const query = (state = {}) => ({
    orderBy: () => query(state),
    limit: (limit) => query({ ...state, limit }),
    startAfter: (after) => query({ ...state, after }),
    get: async () => {
      reads.push({ ...state })
      return {
        docs: rows
          .filter((row) => !state.after || row.path > state.after)
          .slice(0, state.limit)
          .map((row) => snapshot(row.path, row.data)),
      }
    },
  })
  const db = {
    collectionGroup: (name) => {
      assert.equal(name, 'menus')
      return query()
    },
    collection: () => {
      throw new Error('Global discovery must not read root Menu records')
    },
    doc: (path) => ({ path }),
    getAll: async (...refs) =>
      refs.map((ref) => snapshot(ref.path, kitchens[ref.path.split('/')[1]])),
  }
  const dependencies = {
    getRuntimeFirestore: () => db,
    resolveTenantMenuScope: async () => null,
    resolveDirectoryMenuScope: async () => {
      throw new Error('Unexpected venue lookup')
    },
    currentMenuAppId: () => 'app',
    FieldPath: { documentId: () => '__name__' },
    MENU_DIRECTORY_PAGE_SIZE: 24,
    MENU_DIRECTORY_MAX_PAGE_SIZE: 50,
    readScopedMenuDirectoryContext: async (_db, scope) => ({
      kitchenName: scope.kitchenSlug,
    }),
    projectMenuDirectoryEntry: (document, scope) =>
      document.data.status === 'published' &&
      (!document.data.audience || document.data.audience === 'public')
        ? {
            id: document.id,
            name: document.data.name,
            source: {
              kitchen_id: scope.kitchenId,
              menu_id: document.id,
              kitchen_slug: scope.kitchenSlug,
              menu_slug: document.data.slug,
            },
          }
        : null,
    menuServiceOfferings: () => [],
    createError: (input) =>
      Object.assign(new Error(input.statusMessage), input),
    Buffer,
    TextEncoder,
  }
  const source = readFileSync(
    new URL('../runtime/menu/server/index/read.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const read = compileFunction(
    stripTypeScriptTypes(source) + '; return readMenuDirectoryPage',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return { read, reads }
}

const visible = (slug) => ({
  identity: { slug, status: 'active', visibility: true },
})
const menu = (path, changes = {}) => ({
  path,
  data: {
    name: path,
    slug: 'food',
    status: 'published',
    format: 'interactive',
    ...changes,
  },
})

test('global discovery reads canonical paths, skips hidden records and pages across repeated Menu ids', async () => {
  const rows = [
    menu('apps/old/kitchens/a/menus/food'),
    menu('kitchens/a/menus/draft', { status: 'draft' }),
    menu('kitchens/a/menus/food'),
    menu('kitchens/a/menus/private', { audience: 'private_link' }),
    menu('kitchens/b/menus/food', { format: 'document' }),
    menu('kitchens/hidden/menus/food'),
    menu('menus/obsolete-root'),
  ]
  const h = reader(rows, {
    a: visible('alpha'),
    b: visible('beta'),
    hidden: {
      identity: { slug: 'hidden', status: 'active', visibility: false },
    },
  })
  const first = await h.read({ limit: 1 })
  assert.deepEqual(
    first.items.map((item) => item.id),
    ['kitchens/a/menus/food']
  )
  const second = await h.read({ limit: 1, cursor: first.nextCursor })
  assert.deepEqual(
    second.items.map((item) => item.id),
    ['kitchens/b/menus/food']
  )
  assert.equal(second.items[0].source.menu_id, 'food')
  const last = await h.read({ limit: 1, cursor: second.nextCursor })
  assert.deepEqual(last.items, [])
  assert.equal(last.nextCursor, null)
})

test('global discovery rejects malformed cursors before acquiring a page', async () => {
  const h = reader([], {})
  await assert.rejects(h.read({ cursor: 'not-a-valid-cursor' }), {
    statusCode: 400,
  })
  assert.deepEqual(h.reads, [])
})

test('Menu detail routes have only Kitchen-directory or tenant scope, with no root aliases', () => {
  const source = readFileSync(
    new URL('../config/module/pages-config.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import .*\n/gm, '')
    .replace(/^export /gm, '')
  const configure = compileFunction(
    stripTypeScriptTypes(source) + '; return configureMenuDetailRoutes'
  )()
  const pages = () => [
    { file: '/runtime/pages/menus/index.vue', path: '/menus' },
    { file: '/runtime/pages/menus/[menuId]/index.vue', path: '/menus/:menuId' },
    { file: '/runtime/pages/menus/[menuId]/qr.vue', path: '/menus/:menuId/qr' },
    {
      file: '/runtime/pages/kitchens/[slug]/menus/[menuId]/index.vue',
      path: '/kitchens/:slug/menus/:menuId',
    },
  ]
  const directory = pages()
  configure(directory, false)
  assert.deepEqual(
    directory.map((page) => page.path),
    ['/menus', '/kitchens/:slug/menus/:menuId']
  )
  const tenant = pages()
  configure(tenant, true)
  assert.deepEqual(
    tenant.slice(1, 3).map((page) => page.path),
    ['/:menuId', '/:menuId/qr']
  )
  assert.ok(tenant.every((page) => !page.alias))
})
