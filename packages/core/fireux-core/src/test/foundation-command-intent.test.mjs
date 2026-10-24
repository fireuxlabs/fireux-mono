import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import {
  ref,
  computed,
  reactive,
  watch,
  onScopeDispose,
  effectScope,
  nextTick,
} from 'vue'
const root = new URL('../../../../', import.meta.url)
function load(path, name, deps) {
  const source = readFileSync(new URL(path, root), 'utf8')
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const helperPath =
  'core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
const useCommandScope = load(helperPath, 'useCommandScope', {
  watch,
  onScopeDispose,
})
const captureCommandScope = load(helperPath, 'captureCommandScope', { watch })
const readUserProfileChanges = load(
  'core/fireux-core/src/runtime/user/utils/profile-validation.ts',
  'readUserProfileChanges',
  {}
)
const specs = [
  [
    'App public settings',
    'core/fireux-core/src/runtime/app/composables/featured/useAppFeaturedContent.ts',
    'useAppFeaturedContent',
    'public-settings',
  ],
  [
    'User notifications',
    'core/fireux-core/src/runtime/user/composables/notifications/useUserNotificationMarkRead.ts',
    'useUserNotificationMarkRead',
    'notification',
  ],
  [
    'Portfolio root',
    'extensions/fireux-properties/src/runtime/portfolio/composables/firestore/mutations/usePortfolioUpdate.ts',
    'usePortfolioUpdate',
    'portfolio',
  ],
  [
    'App settings',
    'core/fireux-core/src/runtime/app/composables/identity/useAppIdentityUpdate.ts',
    'useAppIdentityUpdate',
    'settings',
  ],
  [
    'App membership',
    'core/fireux-core/src/runtime/app/utils/runAppUserCommand.ts',
    'runAppUserCommand',
    'membership',
  ],
  [
    'App initialization',
    'core/fireux-core/src/runtime/app/utils/initialize-configured-app.ts',
    'initializeConfiguredApp',
    'initialization',
  ],
  [
    'App media',
    'core/fireux-core/src/runtime/app/utils/sync-app-media.ts',
    'syncAppMediaToStorage',
    'media',
  ],
  [
    'User profile',
    'core/fireux-core/src/runtime/user/composables/identity/useUserProfileUpdate.ts',
    'useUserProfileUpdate',
    'profile',
  ],
  [
    'User handle',
    'core/fireux-core/src/runtime/user/utils/update-user-handle.ts',
    'updateUserHandle',
    'handle',
  ],
  [
    'User avatar',
    'core/fireux-core/src/runtime/user/utils/provision-user-avatar.ts',
    'provisionSignedInUserAvatar',
    'avatar',
  ],
  [
    'Kitchen root',
    'extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/useKitchenUpdate.ts',
    'useKitchenUpdate',
    'kitchen',
  ],
]
function deferred() {
  let resolve, reject
  const promise = new Promise((r, j) => {
    resolve = r
    reject = j
  })
  return { promise, resolve, reject }
}
function harness(spec, waitAt = 'token', invalid = false) {
  const wait = deferred(),
    reached = deferred(),
    calls = [],
    scope = effectScope()
  const actor = {
    uid: 'actor',
    getIdToken: async () => {
      if (waitAt === 'token') {
        reached.resolve()
        await wait.promise
      }
      return 'token'
    },
  }
  const currentUser = ref(actor),
    config = reactive({ appId: 'app' }),
    app = ref({ id: 'app' }),
    profile = ref({ id: 'actor' })
  const selected = ref('k1'),
    appUser = ref({ created: { at: 'first' } }),
    route = reactive({
      path: '/workspace/kitchen',
      fullPath: '/workspace/kitchen',
    })
  const input = {
    social: { website: 'https://before.test' },
    userId: 'target',
    action: 'set-role',
    role: 'admin',
    display_name: 'Before',
    name: 'Before',
    kinds: ['logo'],
  }
  const kind = spec[3]
  const payload = {
    ok: true,
    appId: 'app',
    userId: 'actor',
    uid: 'actor',
    action: 'set-role',
    handle: 'ada',
    created: false,
    changed: true,
    uploaded: {},
    failed: [],
    avatar: 'saved',
    kitchen_id: 'k1',
    supplier_id: 'k1',
    portfolioId: 'k1',
    notificationId: 'n1',
    read: true,
    field: 'featured_kitchens_slugs',
    values: ['logo'],
  }
  if (kind === 'membership') payload.userId = 'target'
  if (invalid) {
    payload.appId = 'wrong'
    payload.uid = 'wrong'
    payload.kitchen_id = 'wrong'
    payload.supplier_id = 'wrong'
    payload.portfolioId = 'wrong'
    payload.notificationId = 'wrong'
    payload.userId = 'wrong'
  }
  const deps = {
    ref,
    computed,
    watch,
    useWorkspace: () => ({ selectedId: selected }),
    useUserSession: () => ({ isAdmin: ref(true), appUser }),
    useFirestoreRead: () => ({ firestoreFetchDoc: () => ref({}) }),
    useCommandScope,
    captureCommandScope,
    readUserProfileChanges,
    useAuth: () => ({ currentUser }),
    useFireUXConfig: () => config,
    useAppSession: () => ({ appUser }),
    useRoute: () => route,
    useRequireUser: async () => {
      if (waitAt === 'require') {
        reached.resolve()
        await wait.promise
      }
      return actor
    },
    updateUserHandle: async () => ({}),
    provisionSignedInUserAvatar: async () => 'saved',
    validateUserHandleForPublicRoute: (value) => ({
      isValid: true,
      handle: value,
    }),
    validatePublicSlug: (value) => ({ isValid: true, slug: value }),
    USER_ECOSYSTEM_AVATAR_SRC: '/avatar.png',
    fetch: async (url, options) => {
      calls.push({
        url,
        options,
        body:
          options.body instanceof FormData
            ? options.body
            : JSON.parse(options.body || '{}'),
      })
      return { ok: true, json: async () => payload }
    },
    $fetch: async (url, options) => {
      calls.push({ url, options, body: options.body })
      return payload
    },
  }
  const fn = load(spec[1], spec[2], deps)
  const controller = scope.run(() =>
    kind === 'settings'
      ? fn(app)
      : kind === 'profile'
        ? fn({ user: profile })
        : kind === 'handle'
          ? fn
          : kind === 'kitchen'
            ? fn([selected])
            : ['public-settings', 'notification', 'portfolio'].includes(kind)
              ? fn()
              : fn
  )
  const invoke = () =>
    kind === 'public-settings'
      ? controller.updateFeaturedSlugs('featured_kitchens_slugs', input.kinds)
      : kind === 'notification'
        ? controller.markRead('n1')
        : kind === 'portfolio'
          ? controller.updatePortfolio({
              portfolioId: selected.value,
              changes: { identity: { name: input.name } },
            })
          : kind === 'settings'
            ? controller.updateSocialLinks(input.social)
            : kind === 'membership'
              ? controller({
                  action: input.action,
                  userId: input.userId,
                  role: input.role,
                })
              : kind === 'profile'
                ? controller.update(input)
                : kind === 'handle'
                  ? controller('actor', 'ada', input)
                  : kind === 'avatar'
                    ? controller(
                        'actor',
                        new Blob(['image'], { type: 'image/png' })
                      )
                    : kind === 'media'
                      ? controller(input.kinds)
                      : kind === 'kitchen'
                        ? controller.updateKitchen({
                            kitchenId: selected.value,
                            changes: input,
                          })
                        : controller()
  // Profile validation accepts only genuine profile fields, and mutations below change that same submitted object.
  if (kind === 'profile')
    for (const key of Object.keys(input))
      if (key !== 'display_name') delete input[key]
  return {
    invoke,
    reached,
    release: () => wait.resolve(),
    calls,
    input,
    currentUser,
    actor,
    config,
    app,
    profile,
    selected,
    appUser,
    route,
    scope,
  }
}
for (const spec of specs)
  for (const waitAt of ['require', 'token']) {
    test(`${spec[0]} rejects an account round trip before ${waitAt} dispatch`, async () => {
      const h = harness(spec, waitAt),
        flight = h.invoke()
      await h.reached.promise
      h.currentUser.value = { uid: 'other' }
      h.currentUser.value = h.actor
      h.release()
      await assert.rejects(flight, /changed/)
      assert.equal(h.calls.length, 0)
      h.scope.stop()
    })
    test(`${spec[0]} preserves submitted values while ${waitAt} waits`, async () => {
      const h = harness(spec, waitAt),
        flight = h.invoke()
      await h.reached.promise
      if (h.input.social) h.input.social.website = 'https://after.test'
      if (h.input.kinds) h.input.kinds.push('cover')
      h.input.display_name = 'After'
      h.input.name = 'After'
      h.input.userId = 'other'
      h.release()
      await flight
      assert.equal(h.calls.length, 1)
      const body = h.calls[0].body
      if (spec[3] === 'settings')
        assert.equal(body.social_links.website, 'https://before.test')
      if (spec[3] === 'membership') assert.equal(body.userId, 'target')
      if (spec[3] === 'profile') assert.equal(body.display_name, 'Before')
      if (spec[3] === 'handle') assert.equal(body.create.display_name, 'Before')
      if (spec[3] === 'media') assert.deepEqual(body.kinds, ['logo'])
      if (spec[3] === 'kitchen') assert.equal(body.patch.name, 'Before')
      if (spec[3] === 'portfolio')
        assert.equal(body.changes.identity.name, 'Before')
      if (spec[3] === 'public-settings') assert.deepEqual(body.values, ['logo'])
      h.scope.stop()
    })
  }
for (const spec of specs.filter((s) =>
  [
    'settings',
    'membership',
    'initialization',
    'media',
    'kitchen',
    'public-settings',
    'portfolio',
    'notification',
  ].includes(s[3])
))
  test(`${spec[0]} rejects an App round trip`, async () => {
    const h = harness(spec),
      flight = h.invoke()
    await h.reached.promise
    h.config.appId = 'other'
    h.config.appId = 'app'
    h.release()
    await assert.rejects(flight, /changed/)
    assert.equal(h.calls.length, 0)
    h.scope.stop()
  })
for (const change of ['selection', 'membership', 'route', 'disposal'])
  test(`Kitchen root rejects obsolete ${change}`, async () => {
    const h = harness(specs.find((s) => s[3] === 'kitchen')),
      flight = h.invoke()
    await h.reached.promise
    if (change === 'selection') {
      h.selected.value = 'k2'
      h.selected.value = 'k1'
    }
    if (change === 'membership') {
      const old = h.appUser.value
      h.appUser.value = { created: { at: 'next' } }
      h.appUser.value = old
    }
    if (change === 'route') {
      h.route.path = '/other'
      h.route.path = '/workspace/kitchen'
    }
    if (change === 'disposal') h.scope.stop()
    h.release()
    await assert.rejects(flight, /changed/)
    assert.equal(h.calls.length, 0)
    h.scope.stop()
  })
for (const spec of specs.filter((s) => s[3] !== 'avatar'))
  test(`${spec[0]} rejects a mismatched successful response`, async () => {
    const h = harness(spec, 'token', true),
      flight = h.invoke()
    await h.reached.promise
    h.release()
    await assert.rejects(flight, /response/)
    assert.equal(h.calls.length, 1)
    h.scope.stop()
  })

for (const changed of [
  'none',
  'account',
  'selection',
  'dialog',
  'draft',
  'disposal',
])
  for (const fails of [false, true])
    test(`Kitchen Home completion respects ${changed} scope on ${fails ? 'failure' : 'success'}`, async () => {
      const reply = deferred(),
        scope = effectScope(),
        props = reactive({ open: false }),
        events = [],
        calls = []
      const currentUser = ref({ uid: 'actor' }),
        id = ref('k1'),
        outcome = ref('ready')
      const data = ref({
        id: 'k1',
        slug: 'before',
        status: 'active',
        visibility: false,
      })
      const workspace = {
        id,
        outcome,
        data,
        crud: {
          update: async (input) => {
            calls.push(input)
            await reply.promise
          },
        },
      }
      const deps = {
        ref,
        watch,
        useCommandScope,
        useAuth: () => ({ currentUser }),
        useKitchenWorkspace: () => workspace,
        useKitchenUpdate: () => ({ updateKitchen: workspace.crud.update }),
        defineProps: () => props,
        defineEmits:
          () =>
          (...args) =>
            events.push(args),
      }
      const state = scope.run(() =>
        load(
          'extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Home/Edit.vue',
          '({save, slug, saving, updateError})',
          deps
        )
      )
      props.open = true
      await nextTick()
      const flight = state.save()
      assert.equal(calls.length, 1)
      if (changed === 'account') {
        currentUser.value = { uid: 'other' }
        currentUser.value = { uid: 'actor' }
      }
      if (changed === 'selection') {
        id.value = 'k2'
        id.value = 'k1'
      }
      if (changed === 'dialog') {
        props.open = false
        await nextTick()
        props.open = true
        await nextTick()
      }
      if (changed === 'draft') state.slug.value = 'after'
      if (changed === 'disposal') scope.stop()
      if (fails) reply.reject(new Error('Old save failed'))
      else reply.resolve()
      await flight
      if (changed !== 'none') {
        assert.equal(events.length, 0)
        assert.equal(state.updateError.value, '')
      } else if (fails) {
        assert.equal(events.length, 0)
        assert.equal(state.updateError.value, 'Old save failed')
        assert.equal(state.saving.value, false)
      } else {
        assert.deepEqual(events, [['update:open', false]])
        assert.equal(state.saving.value, false)
      }
      assert.deepEqual(calls[0], {
        kitchenId: 'k1',
        changes: {
          'identity.slug': 'before',
          'identity.status': 'active',
          'identity.visibility': false,
        },
      })
      scope.stop()
    })

for (const kind of ['public-settings', 'portfolio']) {
  const changes =
    kind === 'public-settings'
      ? ['membership', 'disposal']
      : ['membership', 'selection', 'route', 'disposal']
  for (const change of changes)
    test(`${kind} rejects obsolete ${change}`, async () => {
      const h = harness(specs.find((s) => s[3] === kind)),
        flight = h.invoke()
      await h.reached.promise
      if (change === 'membership') {
        const old = h.appUser.value
        h.appUser.value = { created: { at: 'next' } }
        h.appUser.value = old
      }
      if (change === 'selection') {
        h.selected.value = 'other'
        h.selected.value = 'k1'
      }
      if (change === 'route') {
        const old = { ...h.route }
        h.route.path = '/other'
        h.route.fullPath = '/other'
        Object.assign(h.route, old)
      }
      if (change === 'disposal') h.scope.stop()
      h.release()
      await assert.rejects(flight, /changed/)
      assert.equal(h.calls.length, 0)
      h.scope.stop()
    })
}
