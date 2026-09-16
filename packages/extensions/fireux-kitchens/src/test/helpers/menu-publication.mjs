import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, name, dependencies) {
  const source = readFileSync(
    new URL(path, new URL('../', import.meta.url)),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const target = (collectionPath) => ({
  collectionPath,
  key: collectionPath,
  database: { kind: 'runtime' },
})
const targets = {
  FIRESTORE_MUTATION_TARGETS: {
    menus: target('menus'),
    kitchens: target('kitchens'),
    places: target('places'),
  },
  serverAppUsersTarget: (app) => target(`apps/${app}/users`),
  serverKitchenAccessTarget: (app) => target(`kitchen_access/${app}/users`),
  serverKitchenMenusTarget: (kitchen) => target(`kitchens/${kitchen}/menus`),
  serverKitchenDishesTarget: (kitchen) => target(`kitchens/${kitchen}/dishes`),
  serverKitchenMenuSectionsTarget: (kitchen, menu) =>
    target(`kitchens/${kitchen}/menus/${menu}/sections`),
  serverKitchenMenuItemsTarget: (kitchen, menu, section) =>
    target(`kitchens/${kitchen}/menus/${menu}/sections/${section}/items`),
}
const error = (input) => Object.assign(new Error(input.statusMessage), input)
export const menuPath = 'kitchens/k/menus/m'
export const rootPath = 'menus/la-tap--m'
const stamp = { by: 'operator', at: 'now' }
const deleteField = Symbol('delete')
const membershipTime = { seconds: 1, nanoseconds: 0 }

export function harness({ document = false, status = 'draft' } = {}) {
  const records = new Map([
    ['kitchens/k', { slug: 'la-tap' }],
    ['places/k', { name: 'La Tap' }],
    [
      'apps/app/users/operator',
      { role: 'user', subscription: 'free', created: { at: membershipTime } },
    ],
    [
      'kitchen_access/app/users/operator',
      { ids: ['k'], membership_created_at: membershipTime },
    ],
    [
      menuPath,
      {
        name: 'Lunch',
        slug: 'lunch',
        status,
        created: { by: 'creator', at: 'original' },
        ...(document ? { doc: { url: 'https://example.test/menu.pdf' } } : {}),
      },
    ],
    [`${menuPath}/sections/s`, { status: 'active' }],
    [`${menuPath}/sections/s/items/i`, { status: 'active', dish_id: 'dish' }],
    ['kitchens/k/dishes/dish', { name: 'Tapas' }],
  ])
  const state = {
    signedIn: true,
    failPath: '',
    failCommit: false,
    retry: null,
    attempts: 0,
    reads: [],
  }
  const snapshot = (path) => ({
    id: path.split('/').at(-1),
    exists: records.has(path),
    data: () => structuredClone(records.get(path)),
  })
  const collection = (path, options = {}) => ({
    path,
    ...options,
    doc: (id) => ({ path: `${path}/${id}` }),
    where: (field, op, value) =>
      collection(path, { ...options, field, op, value }),
    orderBy: (field) => {
      assert.equal(field, '__name__')
      return collection(path, options)
    },
    limit: (max) => collection(path, { ...options, max }),
    startAfter: (after) => collection(path, { ...options, after }),
  })
  const field = (data, key) =>
    key.split('.').reduce((value, part) => value?.[part], data)
  const db = {
    collection,
    async runTransaction(work) {
      for (;;) {
        state.attempts++
        const writes = []
        const raw = {
          async get(ref) {
            assert.equal(
              writes.length,
              0,
              'Every transaction read must precede every write'
            )
            state.reads.push(ref.path)
            if (!ref.doc) return snapshot(ref.path)
            const paths = [...records.keys()]
              .filter(
                (path) =>
                  path.startsWith(ref.path + '/') &&
                  !path.slice(ref.path.length + 1).includes('/')
              )
              .sort()
            return {
              docs: paths
                .filter(
                  (path) =>
                    (!ref.after || path.split('/').at(-1) > ref.after) &&
                    (!ref.field ||
                      field(records.get(path), ref.field) === ref.value)
                )
                .slice(0, ref.max)
                .map(snapshot),
            }
          },
          async getAll(...refs) {
            return Promise.all(refs.map((ref) => raw.get(ref)))
          },
          create: (ref, data) => queue('create', ref, data),
          update: (ref, data) => queue('update', ref, data),
          delete: (ref) => queue('delete', ref),
        }
        function queue(verb, ref, data) {
          if (ref.path === state.failPath) throw new Error('write failure')
          writes.push({ verb, path: ref.path, data })
        }
        const result = await work(raw)
        if (state.retry) {
          const retry = state.retry
          state.retry = null
          retry(records)
          continue
        }
        if (state.failCommit) throw new Error('commit failure')
        const next = new Map(records)
        for (const { verb, path, data } of writes) {
          if (verb === 'create') assert.equal(next.has(path), false)
          if (verb === 'update') assert.equal(next.has(path), true)
          const updated = { ...(next.get(path) || {}), ...data }
          for (const key of Object.keys(updated))
            if (updated[key] === deleteField) delete updated[key]
          if (verb === 'delete') next.delete(path)
          else next.set(path, updated)
        }
        records.clear()
        for (const entry of next) records.set(...entry)
        return result
      }
    },
  }
  const dependencies = {
    ...targets,
    FieldPath: { documentId: () => '__name__' },
    FieldValue: { delete: () => deleteField },
    getRuntimeFirestore: () => db,
    getRuntimeIdentityFirestore: () => {
      throw new Error('Unexpected database')
    },
    assertFirestoreMutationVerb: () => {},
    createError: error,
    readRecordString: (value, key) => String(value?.[key] || ''),
    normalizeSlug: (value) => value.toLowerCase(),
    publicKitchenMenuId: (kitchen, menu) => `${kitchen}--${menu}`,
    serverAuditStamp: (input) => ({
      ...stamp,
      ...(input.appId ? { app_id: input.appId } : {}),
    }),
    isAppUserSubscription: (value) =>
      ['free', 'premium', 'business'].includes(value),
    requireFirestoreDocumentId: (value) => {
      if (!value || value.includes('/')) throw new Error('Invalid id')
      return value
    },
    useFireUXConfig: () => ({ appId: 'app' }),
    requireFirebaseBearerUser: async () => {
      if (!state.signedIn)
        throw error({
          statusCode: 401,
          statusMessage: 'Sign in to manage this Kitchen.',
        })
      return { uid: 'operator' }
    },
  }
  dependencies.readKitchenAccessIds = load(
    '../runtime/kitchen/utils/kitchen-access.ts',
    'readKitchenAccessIds',
    {
      KITCHEN_USER_LIMIT: 50,
      readMembershipAccessIds: load(
        '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
        'readMembershipAccessIds',
        {}
      ),
    }
  )
  dependencies.runGuardedServerTransaction = load(
    '../../../../core/fireux-core/src/runtime/server/utils/firestore-mutations/server-transaction.ts',
    'runGuardedServerTransaction',
    dependencies
  )
  dependencies.requireKitchenWriterAccount = load(
    '../runtime/kitchen/server/core/operator-access.ts',
    'requireKitchenWriterAccount',
    dependencies
  )
  dependencies.readKitchenMutationActor = load(
    '../runtime/kitchen/server/core/mutation-authority.ts',
    'readKitchenMutationActor',
    dependencies
  )
  dependencies.requireKitchenMutationAuthority = load(
    '../runtime/kitchen/server/core/mutation-authority.ts',
    'requireKitchenMutationAuthority',
    dependencies
  )
  dependencies.ensureKitchenMenuRootEntry = load(
    '../runtime/menu/server/directory/root-entry.ts',
    'ensureKitchenMenuRootEntry',
    dependencies
  )
  dependencies.assertKitchenMenuCanPublish = load(
    '../runtime/menu/server/publication/validation.ts',
    'assertKitchenMenuCanPublish',
    dependencies
  )
  const publish = load(
    '../runtime/menu/server/publication/publish.ts',
    'publishKitchenMenu',
    dependencies
  )
  const withdraw = load(
    '../runtime/menu/server/publication/withdraw.ts',
    'withdrawKitchenMenu',
    dependencies
  )
  const sync = load(
    '../runtime/menu/server/directory/sync.ts',
    'syncKitchenMenuDirectory',
    dependencies
  )
  const input = { appId: 'app', kitchenId: 'k', menuId: 'm', uid: 'operator' }
  const routes = Object.fromEntries(
    ['publish', 'unpublish', 'archive'].map((action) => [
      action,
      load(
        `../runtime/server/api/workspace/kitchen/menus/${action}.post.ts`,
        'handler',
        {
          ...dependencies,
          defineEventHandler: (handler) => handler,
          readBody: async () => input,
          useRuntimeConfig: () => ({ public: { fireux: { id: 'app' } } }),
          requirePathSegment: dependencies.requireFirestoreDocumentId,
          publishKitchenMenu: publish,
          withdrawKitchenMenu: withdraw,
        }
      ),
    ])
  )
  return {
    records,
    state,
    routes,
    publish: () => publish(input),
    unpublish: () => withdraw({}, input, 'draft'),
    archive: () => withdraw({}, input, 'archived'),
    sync: () => sync(input),
  }
}
