import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(file, dependencies, result = 'handler') {
  const source = readFileSync(
    new URL(`../../../../${file}`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /m, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (value) => Object.assign(Error(value.statusMessage), value)
const denied = () => {
  throw createError({ statusCode: 403 })
}
const requireAdmin = (data) => {
  if (!['admin', 'dev'].includes(data?.role)) denied()
}
const requireProductManager = load(
  'packages/extensions/fireux-products/src/runtime/product/server/create/authority.ts',
  {
    createError,
    isAdminMembership: (data) => ['admin', 'dev'].includes(data?.role),
  },
  'requireProductManager'
)
function route(domain, state) {
  const path =
    domain === 'professional'
      ? 'packages/extensions/fireux-jobs/src/runtime/server/api/internal/profiles/professional/image.post.ts'
      : `packages/extensions/fireux-${domain === 'ingredients' ? 'kitchens' : domain}/src/runtime/server/api/${domain}/images.post.ts`
  const requireBlogAuthor = load(
    'packages/extensions/fireux-blogs/src/runtime/blog/server/authoring.ts',
    {
      createError,
      useFireUXConfig: () => ({ appId: 'app-a' }),
      requireFirestoreDocumentId: (value) => value,
      requireFirebaseBearerUser: async () => {
        if (state.anonymous) throw createError({ statusCode: 401 })
        return { uid: 'owner' }
      },
      defineFirestoreMutationTarget: (value) => value.collectionPath,
      APP_MUTATION_TARGETS: { runtimeApps: 'apps' },
      serverAppUsersTarget: () => 'members',
      requireAdmin,
      serverAuditStamp: () => ({}),
      validatePublicSlug: (slug) => ({ isValid: true, slug }),
      runGuardedServerTransaction: async (_database, run) =>
        run({
          read: async (target) => {
            if (target === 'apps') return { exists: true }
            if (target === 'members')
              return { exists: true, data: { role: state.role } }
            return {
              exists: state.exists !== false,
              data: { source_app_id: state.sourceApp || 'app-a' },
            }
          },
        }),
    },
    'requireBlogAuthor'
  )
  return load(path, {
    createError,
    defineEventHandler: (value) => value,
    uploadProtectedImage: async (_event, authorize) =>
      authorize(state.path, state.fields || {}),
    multipartField: (fields, name) => fields[name] || '',
    withPlaceWriter: async (_event, id, authority) => {
      state.received = { id, authority }
      if (!state.allowed) denied()
    },
    context: async () => ({
      uid: 'owner',
      placeRef: { get: async () => ({ exists: true, data: () => ({}) }) },
    }),
    canConfigure: () => state.allowed,
    curatorContext: async () => ({
      appId: 'app-a',
      uid: 'owner',
      isDeveloper: false,
    }),
    assertCurator: (data) => {
      if (data?.role !== 'admin') denied()
    },
    serverAppUsersTarget: (app) => app,
    runGuardedServerTransaction: async (_db, run) =>
      run({ read: async () => ({ data: { role: state.role } }) }),
    useFireUXConfig: () => ({ appId: 'app-a' }),
    requireFirebaseBearerUser: async () => {
      if (state.anonymous) throw createError({ statusCode: 401 })
      return { uid: 'owner' }
    },
    requireFirestoreDocumentId: (value) => value,
    getRuntimeFirestore: () => ({
      doc: (value) => value,
      getAll: async () => [
        { exists: true },
        {
          exists: true,
          data: () => ({
            role: state.role,
            canManageProducts: state.canManageProducts,
          }),
        },
        {
          exists: state.exists !== false,
          data: () => ({ source_app_id: state.sourceApp || 'app-a' }),
        },
      ],
    }),
    requireAdmin,
    requireBlogAuthor,
    requireProductManager,
    runtimeDatabases: () => ({
      appId: 'app-a',
      appDb: { doc: (value) => value, getAll: async () => [] },
    }),
    assertActiveProfessional: () => {
      if (!state.allowed) denied()
    },
  })
}

test('Place media uses the same exact Kitchen authority as identity edits', async () => {
  const state = {
    path: 'places/venue/image',
    fields: { app_id: 'app-a', kitchen_id: 'venue' },
    allowed: true,
  }
  await route('places', state)({})
  assert.deepEqual(state.received, {
    id: 'venue',
    authority: { app_id: 'app-a', kitchen_id: 'venue' },
  })
  state.allowed = false
  await assert.rejects(route('places', state)({}), { statusCode: 403 })
  for (const path of [
    'places/venue/private/file',
    'places/venue/../image',
    'other/venue/image',
  ]) {
    await assert.rejects(
      route('places', { ...state, allowed: true, path })({}),
      { statusCode: 400 }
    )
  }
})
test('onboarding media reuses creator configuration authority and its two supported images', async () => {
  const state = {
    path: 'places/venue/avatar',
    fields: { mode: 'onboarding' },
    allowed: true,
  }
  await route('places', state)({})
  await assert.rejects(route('places', { ...state, allowed: false })({}), {
    statusCode: 403,
  })
  await assert.rejects(
    route('places', { ...state, path: 'places/venue/logo' })({}),
    { statusCode: 400 }
  )
})
test('Ingredient images require the existing global curator, including before record creation', async () => {
  await route('ingredients', {
    path: 'ingredients/carrot/image_url',
    role: 'admin',
  })({})
  await assert.rejects(
    route('ingredients', {
      path: 'ingredients/carrot/image_url',
      role: 'user',
    })({}),
    { statusCode: 403 }
  )
  await assert.rejects(
    route('ingredients', { path: 'places/carrot/image', role: 'admin' })({}),
    { statusCode: 400 }
  )
})
test('Blog and Product media reject anonymous, ordinary and foreign-App writers', async () => {
  for (const domain of ['blogs', 'products']) {
    const state = { path: `${domain}/fixture/featured.jpg`, role: 'admin' }
    await route(domain, state)({})
    await route(domain, { ...state, exists: false })({})
    await assert.rejects(route(domain, { ...state, role: 'user' })({}), {
      statusCode: 403,
    })
    await assert.rejects(route(domain, { ...state, anonymous: true })({}), {
      statusCode: 401,
    })
    await assert.rejects(
      route(domain, { ...state, sourceApp: 'foreign' })({}),
      { statusCode: 403 }
    )
    await assert.rejects(
      route(domain, { ...state, path: 'places/fixture/image' })({}),
      { statusCode: 400 }
    )
  }
  await route('products', {
    path: 'products/fixture/main.jpg',
    role: 'user',
    canManageProducts: true,
  })({})
})
test('Professional media is limited to the current active profile owner', async () => {
  await route('professional', {
    path: 'professionals/owner/image/current',
    allowed: true,
  })({})
  await assert.rejects(
    route('professional', {
      path: 'professionals/other/image/current',
      allowed: true,
    })({}),
    { statusCode: 403 }
  )
  await assert.rejects(
    route('professional', {
      path: 'professionals/owner/image/current',
      allowed: false,
    })({}),
    { statusCode: 403 }
  )
})
