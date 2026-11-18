import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { starterMenu } from '../../runtime/menu/content/starter-menu.ts'
import {
  computed,
  ref,
  toRef,
  reactive,
  unref,
  watch,
  onScopeDispose,
  effectScope,
  nextTick,
} from 'vue'
function load(path, result, deps = {}) {
  deps = { starterMenu, ...deps }
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (source.includes('<script setup'))
    source = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replace(/import\.meta\.client/g, 'true')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const drain = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}
function context() {
  const lifetime = effectScope(),
    token = deferred(),
    response = deferred(),
    calls = [],
    effects = []
  const user = { uid: 'actor', getIdToken: () => token.promise },
    currentUser = ref(user),
    appUser = ref({ created: { at: 1 }, role: 'user' })
  const config = reactive({ appId: 'app' }),
    route = reactive({
      fullPath: '/workspace/kitchen/menu?create=1',
    }),
    kitchenId = ref('kitchen'),
    canWrite = ref(true),
    activeKitchenAppId = computed(() => config.appId)
  const deps = {
    computed,
    ref,
    reactive,
    unref,
    watch,
    onScopeDispose,
    useCommandScope,
    useAuth: () => ({ currentUser }),
    useUserSession: () => ({
      appUser,
      appUserPending: ref(false),
      appUserError: ref(null),
      appUserOutcome: ref('ready'),
    }),
    useKitchenAccess: () => ({ ids: ref(['kitchen']), outcome: ref('ready') }),
    useWorkspace: () => ({ selectedId: kitchenId }),
    useFireUXConfig: () => config,
    useRoute: () => route,
  }
  deps.useMenuEditorScope = load(
    '../../runtime/menu/composables/useMenuEditorScope.ts',
    'useMenuEditorScope',
    deps
  )
  deps.$fetch = (url, options) => {
    calls.push({ url, options })
    return response.promise
  }
  const change = (kind) => {
    if (kind === 'account') {
      currentUser.value = { uid: 'other' }
      currentUser.value = user
    }
    if (kind === 'app') {
      config.appId = 'other'
      config.appId = 'app'
    }
    if (kind === 'membership')
      appUser.value = { created: { at: 2 }, role: 'user' }
    if (kind === 'kitchen') {
      kitchenId.value = 'other'
      kitchenId.value = 'kitchen'
    }
    if (kind === 'route') {
      route.fullPath = '/other'
      route.fullPath = '/workspace/kitchen/menu?create=1'
    }
    if (kind === 'dispose') lifetime.stop()
  }
  const run = (path, result, extra) =>
    lifetime.run(() =>
      load(`../../runtime/${path}`, result, { ...deps, ...extra })
    )
  return {
    lifetime,
    token,
    response,
    calls,
    effects,
    user,
    currentUser,
    appUser,
    config,
    route,
    kitchenId,
    activeKitchenAppId,
    canWrite,
    deps,
    change,
    run,
  }
}
const changes = [
  'stable',
  'account',
  'app',
  'membership',
  'kitchen',
  'route',
  'dispose',
]
test('Free Menu creation starts with the combined Menu and respects unavailable creation', async () => {
  const h = context()
  const canCreateMenu = ref(false)
  const api = h.run(
    'kitchen/components/Menu/Menus/Create/Form.vue',
    '({ save, name })',
    {
      defineModel: () => ref(''),
      useMenuRecordNavigation: () => ({ openView: () => {} }),
      useOptionalKitchenMenus: () => ({
        kitchenId: h.kitchenId,
        canCreateMenu,
        menuCreateBlockedMessage: ref('Allowance reached'),
        subscription: ref('free'),
        createMenu: (input) => h.calls.push(input),
      }),
    }
  )
  assert.equal(api.name.value, starterMenu.name)
  await api.save()
  assert.deepEqual(h.calls, [])
  h.lifetime.stop()
})
function scheduledForm(h, subscription) {
  let intentCurrent
  const api = h.run(
    'kitchen/components/Menu/Menus/Create/Form.vue',
    '({ save, name, description, schedule, canPlanDaily, busy, error })',
    {
      defineModel: () => ref(''),
      useMenuRecordNavigation: () => ({
        openView: (...args) => h.effects.push(args),
      }),
      useOptionalKitchenMenus: () => ({
        kitchenId: h.kitchenId,
        canCreateMenu: ref(true),
        menuCreateBlockedMessage: ref(''),
        subscription,
        createMenu: (input, isCurrent) => {
          intentCurrent = isCurrent
          h.calls.push(structuredClone(input))
          return h.response.promise
        },
      }),
    }
  )
  return { api, current: () => intentCurrent?.() }
}
test('paid operators can create an undated Daily Menu through the existing form', async () => {
  for (const tier of ['pro', 'business']) {
    const h = context()
    try {
      const { api } = scheduledForm(h, ref(tier))
      assert.equal(api.canPlanDaily.value, true)
      assert.equal(api.schedule.value, 'regular')
      api.name.value = 'Daily menu'
      api.schedule.value = 'daily'
      h.response.resolve({ slug: 'daily-menu' })
      await api.save()
      assert.deepEqual(h.calls, [
        {
          name: 'Daily menu',
          description: '',
          format: 'interactive',
          schedule: 'daily',
        },
      ])
      assert.deepEqual(h.effects, [['daily-menu', 'content']])
    } finally {
      h.lifetime.stop()
    }
  }
})
test('the Free form keeps the combined regular Menu and cannot dispatch a Daily request', async () => {
  const h = context()
  try {
    const { api } = scheduledForm(h, ref('free'))
    assert.equal(api.canPlanDaily.value, false)
    assert.equal(api.name.value, starterMenu.name)
    api.schedule.value = 'daily'
    await api.save()
    assert.deepEqual(h.calls, [])
    api.schedule.value = 'regular'
    h.response.resolve({ slug: 'food-drinks' })
    await api.save()
    assert.deepEqual(h.calls, [
      { name: starterMenu.name, description: '', format: 'interactive' },
    ])
  } finally {
    h.lifetime.stop()
  }
})
test('schedule changes and loss of Daily entitlement invalidate an in-flight creation intent', async () => {
  for (const changed of ['schedule', 'subscription']) {
    const h = context()
    try {
      const subscription = ref('pro')
      const { api, current } = scheduledForm(h, subscription)
      api.name.value = 'Daily menu'
      api.schedule.value = 'daily'
      const pending = api.save()
      if (changed === 'schedule') {
        api.schedule.value = 'regular'
        api.schedule.value = 'daily'
      } else {
        subscription.value = 'free'
        await nextTick()
        assert.equal(api.schedule.value, 'regular')
        assert.equal(api.name.value, starterMenu.name)
      }
      assert.equal(current(), false)
      api.busy.value = true
      h.response.resolve({ slug: 'daily-menu' })
      await pending
      assert.deepEqual(h.effects, [])
      assert.equal(api.error.value, '')
      assert.equal(api.busy.value, true)
    } finally {
      h.lifetime.stop()
    }
  }
})
test('Menu creation suppresses obsolete navigation, errors and busy-state completion', async () => {
  for (const changed of changes)
    for (const failed of [false, true]) {
      let intentCurrent
      const h = context(),
        api = h.run(
          'kitchen/components/Menu/Menus/Create/Form.vue',
          '({save,name,description,busy,error})',
          {
            defineModel: () => ref(''),
            useMenuRecordNavigation: () => ({
              openView: (...args) => h.effects.push(args),
            }),
            useOptionalKitchenMenus: () => ({
              kitchenId: h.kitchenId,
              canCreateMenu: ref(true),
              menuCreateBlockedMessage: ref(''),
              subscription: ref('pro'),
              createMenu: (input, isCurrent) => {
                intentCurrent = isCurrent
                h.calls.push(structuredClone(input))
                return h.response.promise
              },
            }),
          }
        )
      api.name.value = 'Before'
      api.description.value = 'Original'
      const pending = api.save()
      h.change(changed)
      assert.equal(intentCurrent(), changed === 'stable')
      if (changed !== 'stable') api.busy.value = true
      failed
        ? h.response.reject(Error('Failure'))
        : h.response.resolve({ slug: 'before' })
      await pending
      assert.deepEqual(h.calls, [
        { name: 'Before', description: 'Original', format: 'interactive' },
      ])
      assert.deepEqual(
        h.effects,
        !failed && changed === 'stable' ? [['before', 'content']] : [],
        changed
      )
      assert.equal(
        api.error.value,
        failed && changed === 'stable' ? 'Failure' : '',
        changed
      )
      assert.equal(api.busy.value, changed !== 'stable', changed)
      h.lifetime.stop()
    }
})
test('URL source captures its body and blocks stale credentials and obsolete completion', async () => {
  for (const stage of ['token', 'response'])
    for (const changed of changes) {
      const h = context(),
        api = h.run(
          'kitchen/components/Menu/Menus/Create/Url.vue',
          '({save,sourceUrl,pending,error})',
          {
            crypto: { randomUUID: () => 'test-source' },
            navigateTo: (path) => h.effects.push(path),
            useOptionalKitchenMenus: () => ({
              activeKitchenAppId: h.activeKitchenAppId,
              canWrite: h.canWrite,
              kitchenId: h.kitchenId,
              currencyCode: ref('CHF'),
            }),
          }
        )
      api.sourceUrl.value = 'https://example.com/before'
      const pending = api.save()
      if (stage === 'response') {
        h.token.resolve('token')
        await drain()
        assert.equal(h.calls.length, 1)
      }
      h.change(changed)
      if (changed !== 'stable') api.pending.value = true
      h.token.resolve('token')
      h.response.resolve({ ok: true, id: 'source-test-source' })
      await pending
      assert.equal(
        h.calls.length,
        stage === 'response' || changed === 'stable' ? 1 : 0,
        `${stage}/${changed}`
      )
      if (h.calls.length)
        assert.deepEqual(h.calls[0].options.body, {
          appId: 'app',
          kitchenId: 'kitchen',
          uploadId: 'source-test-source',
          sourceUrl: 'https://example.com/before',
        })
      assert.deepEqual(
        h.effects,
        changed === 'stable'
          ? ['/workspace/kitchen/menu/uploads/source-test-source']
          : []
      )
      assert.equal(api.pending.value, changed !== 'stable')
      h.lifetime.stop()
    }
})
test('Menu removal submits its exact target to the record owner before live data unmounts the confirmation', async () => {
  const h = context()
  const menu = ref({ id: 'menu', name: 'Main', status: 'draft' })
  const api = h.run(
    'kitchen/components/Menu/Menus/Detail/Remove.vue',
    '({apply,confirm,busy})',
    {
      useKitchenMenuRecordContext: () => ({
        menu,
        offerings: ref([]),
        offeringsOutcome: ref('empty'),
        offeringsError: ref(null),
        allSections: ref([]),
        sectionsPending: ref(false),
        sectionsError: ref(null),
        menuId: computed(() => menu.value?.id || ''),
        menuSlug: ref('main'),
        kitchenId: h.kitchenId,
        canManage: computed(() => Boolean(menu.value)),
        deleteMenu: (kitchenId, menuId, isCurrent) => {
          h.calls.push({ kitchenId, menuId, isCurrent })
          return h.response.promise
        },
      }),
    }
  )
  api.confirm.value = 'delete'
  const request = api.apply()
  assert.equal(h.calls.length, 1)
  const [{ kitchenId, menuId, isCurrent }] = h.calls
  assert.deepEqual([kitchenId, menuId], ['kitchen', 'menu'])
  assert.equal(isCurrent(), true)
  assert.equal(api.busy.value, true)
  menu.value = null
  h.lifetime.stop()
  h.response.resolve({ ok: true })
  await request
  assert.equal(isCurrent(), false)
})

test('Menu suggestions stay locked for Free and create ordinary interactive drafts for Pro', async () => {
  for (const tier of ['free', 'pro', 'business']) {
    const h = context()
    const api = h.run(
      'kitchen/components/Menu/Menus/Collection/Suggestions.vue',
      '({create,hasPro,suggestions})',
      {
        useKitchenMenus: () => ({
          menus: ref([]),
          subscription: ref(tier),
          canCreateMenu: ref(true),
          kitchenId: h.kitchenId,
          createMenu: async (input) => {
            h.calls.push(input)
            return { slug: 'breakfast' }
          },
        }),
        useMenuRecordNavigation: () => ({
          openView: (...args) => h.effects.push(args),
        }),
      }
    )
    assert.deepEqual(api.suggestions.value, ['Breakfast', 'Lunch', 'Specials'])
    await api.create('Breakfast')
    assert.deepEqual(
      h.calls,
      tier === 'free' ? [] : [{ name: 'Breakfast', format: 'interactive' }]
    )
    assert.deepEqual(
      h.effects,
      tier === 'free' ? [] : [['breakfast', 'content']]
    )
  }
})

test('Menu archive UI shows affected services and restores only to draft', async () => {
  for (const archived of [false, true]) {
    const h = context(),
      calls = []
    const menu = ref({
      id: 'menu',
      name: 'Main',
      status: archived ? 'archived' : 'published',
    })
    const api = h.run(
      'kitchen/components/Menu/Menus/Detail/Remove.vue',
      '({apply,confirm,canDelete,affectedServices,busy})',
      {
        useKitchenMenuRecordContext: () => ({
          menu,
          menuId: ref('menu'),
          menuSlug: ref('main'),
          kitchenId: h.kitchenId,
          canManage: ref(true),
          offerings: ref([
            { id: 'lunch', name: 'Lunch', enabled: false, menu_ids: ['menu'] },
          ]),
          offeringsOutcome: ref('ready'),
          offeringsError: ref(null),
          allSections: ref([]),
          sectionsPending: ref(false),
          sectionsError: ref(null),
          deleteMenu: () => {
            throw Error('Must not delete')
          },
          archiveMenu: (...args) => {
            calls.push(['archive', ...args])
            return h.response.promise
          },
          restoreMenu: (...args) => {
            calls.push(['restore', ...args])
            return h.response.promise
          },
        }),
      }
    )
    assert.equal(api.canDelete.value, false)
    assert.equal(api.affectedServices.value[0].name, 'Lunch')
    const action = archived ? 'restore' : 'archive'
    api.confirm.value = action
    menu.value.status = archived ? 'draft' : 'archived'
    const obsoleteRequest = api.apply()
    assert.deepEqual(
      calls,
      [],
      'another operator already completed this action'
    )
    assert.equal(api.confirm.value, '')
    await obsoleteRequest

    menu.value.status = archived ? 'archived' : 'published'
    api.confirm.value = action
    const request = api.apply()
    assert.deepEqual(calls, [[action, 'kitchen', 'menu']])
    h.route.fullPath = '/elsewhere'
    h.response.resolve({ ok: true })
    await request
    assert.equal(api.busy.value, false)
    assert.deepEqual(h.effects, [])
    h.lifetime.stop()
  }
})

test('paid Specials board preset creates a daily Menu with explicit purpose', async () => {
  const h = context()
  try {
    const { api } = scheduledForm(h, ref('business'))
    api.name.value = 'Specials'
    api.schedule.value = 'specials'
    h.response.resolve({ slug: 'specials' })
    await api.save()
    assert.deepEqual(h.calls, [
      {
        name: 'Specials',
        description: '',
        format: 'interactive',
        schedule: 'daily',
        purpose: 'specials',
      },
    ])
  } finally {
    h.lifetime.stop()
  }
})

test('standalone blank and URL creation explicitly construct their lower owner while provided flows reuse it', async () => {
  for (const provided of [false, true]) {
    const h = context()
    let constructions = 0
    const owner = {
      kitchenId: h.kitchenId,
      activeKitchenAppId: h.activeKitchenAppId,
      canCreateMenu: ref(true),
      menuCreateBlockedMessage: ref(''),
      subscription: ref('pro'),
      canWrite: h.canWrite,
      currencyCode: ref('CHF'),
      createMenu: async (input) => {
        h.calls.push(input)
        return { slug: 'created' }
      },
    }
    const dependencies = {
      useOptionalKitchenMenus: () => (provided ? owner : null),
      useKitchenWorkspaceMenus: () => {
        constructions++
        return owner
      },
      defineModel: () => ref('Standalone menu'),
      useMenuRecordNavigation: () => ({
        openView: (...args) => h.effects.push(args),
      }),
      crypto: { randomUUID: () => 'source-id' },
      $fetch: async (_url, request) => {
        h.calls.push(request.body)
        return { ok: true, id: request.body.uploadId }
      },
      navigateTo: async (value) => h.effects.push(value),
    }
    try {
      const form = h.run(
        'kitchen/components/Menu/Menus/Create/Form.vue',
        '({ save })',
        dependencies
      )
      await form.save()
      assert.equal(h.calls[0].name, 'Standalone menu')
      assert.deepEqual(h.effects[0], ['created', 'content'])
      const url = h.run(
        'kitchen/components/Menu/Menus/Create/Url.vue',
        '({ save, sourceUrl })',
        dependencies
      )
      url.sourceUrl.value = 'https://example.test/menu'
      h.token.resolve('token')
      await url.save()
      assert.equal(h.calls[1].sourceUrl, 'https://example.test/menu')
      assert.equal(
        h.effects[1],
        '/workspace/kitchen/menu/uploads/source-source-id'
      )
      assert.equal(
        constructions,
        provided ? 0 : 2,
        'only the two independent standalone workflow owners construct'
      )
    } finally {
      h.lifetime.stop()
    }
  }
})
