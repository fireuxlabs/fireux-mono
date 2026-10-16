import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  ref,
  reactive,
  unref,
  watch,
  onScopeDispose,
  effectScope,
} from 'vue'
function load(path, result, deps = {}) {
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
    route = reactive({ fullPath: '/workspace/kitchen/menus/create' }),
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
      appPending: ref(false),
      appError: ref(null),
      appOutcome: ref('ready'),
    }),
    useKitchenAccess: () => ({ ids: ref(['kitchen']), outcome: ref('ready') }),
    useKitchenWorkspaceSelection: () => ({ selectedId: kitchenId }),
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
      route.fullPath = '/workspace/kitchen/menus/create'
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
test('Menu creation suppresses obsolete navigation, errors and busy-state completion', async () => {
  for (const changed of changes)
    for (const failed of [false, true]) {
      const h = context(),
        api = h.run(
          'kitchen/components/Workspace/Menus/Create/Form.vue',
          '({save,name,description,busy,error})',
          {
            defineProps: () => ({ format: 'interactive' }),
            useMenuRecordNavigation: () => ({
              openView: (...args) => h.effects.push(args),
            }),
            useKitchenMenusContextSource: () => ({
              kitchenId: h.kitchenId,
              canCreateMenu: ref(true),
              menuCreateBlockedMessage: ref(''),
              subscription: ref('premium'),
              createMenu: (input) => {
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
          'kitchen/components/Workspace/Menus/Create/Url.vue',
          '({save,menuName,sourceUrl,pending,message,error})',
          {
            normalizeSlug: (value) => value.trim().toLowerCase(),
            useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
            useKitchenMenusContextSource: () => ({
              activeKitchenAppId: h.activeKitchenAppId,
              canWrite: h.canWrite,
              kitchenId: h.kitchenId,
              currencyCode: ref('CHF'),
            }),
          }
        )
      api.menuName.value = 'Before'
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
      h.response.resolve({ ok: true })
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
          uploadId: 'before',
          sourceUrl: 'https://example.com/before',
        })
      assert.equal(
        api.message.value,
        changed === 'stable'
          ? 'Saved before. Process it from the queue below.'
          : ''
      )
      assert.equal(api.pending.value, changed !== 'stable')
      h.lifetime.stop()
    }
})
test('upload token binding clears immediately, ignores obsolete resolution/rejection and stops on disposal', async () => {
  const h = context(),
    second = deferred(),
    third = deferred()
  const api = h.run(
    'kitchen/composables/workspace/menus/useKitchenWorkspaceMenuUploadPayload.ts',
    'useKitchenWorkspaceMenuUploadPayload()',
    {
      normalizeSlug: (value) => String(value).trim().toLowerCase(),
      window: { location: { origin: 'https://example.com' } },
      useOptionalKitchenMenuRecordContext: () => null,
      useKitchenMenusContextSource: () => ({
        selectedKitchen: ref({ slug: 'kitchen' }),
        kitchenId: h.kitchenId,
        activeKitchenAppId: h.activeKitchenAppId,
        canWrite: h.canWrite,
        currencyCode: ref('CHF'),
      }),
    }
  )
  assert.equal(api.authToken.value, '')
  assert.equal(api.canUseTool.value, false)
  h.currentUser.value = { uid: 'second', getIdToken: () => second.promise }
  second.resolve('second-token')
  await drain()
  assert.equal(api.authToken.value, 'second-token')
  assert.equal(api.canUseTool.value, true)
  h.token.resolve('first-token')
  await drain()
  assert.equal(api.authToken.value, 'second-token')
  h.currentUser.value = { uid: 'third', getIdToken: () => third.promise }
  assert.equal(api.authToken.value, '')
  assert.equal(api.canUseTool.value, false)
  third.reject(Error('Token failed'))
  await drain()
  assert.equal(api.authToken.value, '')
  const last = deferred()
  h.currentUser.value = { uid: 'last', getIdToken: () => last.promise }
  h.lifetime.stop()
  last.resolve('disposed-token')
  await drain()
  assert.equal(api.authToken.value, '')
})
test('shared-price adoption rejects scope round trips and disposed completion while retaining captured reviewed forms', async () => {
  for (const stage of ['token', 'response'])
    for (const changed of [
      ...changes.filter((value) => value !== 'kitchen'),
      'row',
    ]) {
      const h = context(),
        props = reactive({
          row: { id: 'item', priceOptions: [{ label: 'Bottle', price: 5 }] },
          kitchenId: 'kitchen',
          menuId: 'menu',
          sectionId: 'section',
          canWrite: true,
        })
      const api = h.run(
        'kitchen/components/Workspace/Menus/Items/AdoptSharedTerms.vue',
        '({adopt,open,busy,error,forms})',
        {
          defineProps: () => props,
          defineEmits:
            () =>
            (...args) =>
              h.effects.push(args),
          isFirestoreDocumentId: (value) =>
            typeof value === 'string' &&
            Boolean(value.trim()) &&
            !value.includes('/'),
        }
      )
      api.open.value = true
      await drain()
      api.forms.value[0].volume = 330
      const pending = api.adopt()
      if (stage === 'response') {
        h.token.resolve('token')
        await drain()
        assert.equal(h.calls.length, 1)
      }
      if (changed === 'row') {
        props.row.id = 'other'
        props.row.id = 'item'
      } else h.change(changed)
      if (changed !== 'stable') api.busy.value = true
      h.token.resolve('token')
      h.response.resolve({ sellableId: 'sellable' })
      await pending
      assert.equal(
        h.calls.length,
        changed === 'stable' || stage === 'response' ? 1 : 0,
        `${stage}/${changed}`
      )
      if (h.calls.length)
        assert.deepEqual(h.calls[0].options.body, {
          kitchenId: 'kitchen',
          menuId: 'menu',
          sectionId: 'section',
          itemId: 'item',
          variantForms: [{ volume: { value: 330, unit: 'ml' } }],
          expectedPriceOptions: [{ label: 'Bottle', price: 5 }],
        })
      assert.deepEqual(
        h.effects,
        changed === 'stable' ? [['adopted', 'sellable']] : [],
        `${stage}/${changed}`
      )
      assert.equal(api.open.value, changed !== 'stable')
      assert.equal(api.busy.value, changed !== 'stable')
      h.lifetime.stop()
    }
})
test('variant editor preserves a changed draft and suppresses obsolete callback errors', async () => {
  for (const changed of [
    ...changes.filter((value) => value !== 'kitchen'),
    'row',
    'draft',
  ])
    for (const failed of [false, true]) {
      const h = context(),
        props = reactive({
          row: {
            id: 'item',
            item: {
              kitchen_id: 'kitchen',
              menu_id: 'menu',
              section_id: 'section',
            },
            price: 5,
            priceOptions: [],
            addOns: [],
          },
          canWrite: true,
          updatePriceOptions: (options) => {
            h.calls.push(structuredClone(options))
            return h.response.promise
          },
          updateAddOns: () => h.response.promise,
        })
      const api = h.run(
        'kitchen/components/Workspace/Menus/Items/Options.vue',
        '({runAction,addPriceOption,variantDraft,actionError})',
        {
          defineProps: () => props,
          normalizeSlug: (value) => String(value).trim().toLowerCase(),
        }
      )
      api.variantDraft.label = 'Original'
      api.variantDraft.price = 8
      const pending = api.runAction(api.addPriceOption)
      if (changed === 'row') {
        props.row.id = 'other'
        props.row.id = 'item'
      } else if (changed === 'draft') {
        api.variantDraft.label = 'New draft'
        api.variantDraft.price = 9
      } else h.change(changed)
      failed ? h.response.reject(Error('Failure')) : h.response.resolve()
      await pending
      assert.deepEqual(h.calls, [
        [{ label: 'Original', quantity: 0, unit: '', price: 8 }],
      ])
      assert.equal(
        api.actionError.value,
        failed && changed === 'stable' ? 'Failure' : '',
        changed
      )
      assert.equal(
        api.variantDraft.label,
        !failed && changed === 'stable'
          ? ''
          : changed === 'draft'
            ? 'New draft'
            : 'Original',
        changed
      )
      h.lifetime.stop()
    }
})

test('add-on editor preserves a new draft after obsolete success or failure', async () => {
  for (const failed of [false, true]) {
    const h = context(),
      props = reactive({
        row: {
          id: 'item',
          item: {
            kitchen_id: 'kitchen',
            menu_id: 'menu',
            section_id: 'section',
          },
          price: 5,
          priceOptions: [],
          addOns: [],
        },
        canWrite: true,
        updatePriceOptions: () => h.response.promise,
        updateAddOns: (options) => {
          h.calls.push(structuredClone(options))
          return h.response.promise
        },
      })
    const api = h.run(
      'kitchen/components/Workspace/Menus/Items/Options.vue',
      '({runAction,addAddOn,addOnDraft,actionError})',
      {
        defineProps: () => props,
        normalizeSlug: (value) => String(value).trim().toLowerCase(),
      }
    )
    api.addOnDraft.label = 'Original'
    api.addOnDraft.price = 2
    const pending = api.runAction(api.addAddOn)
    api.addOnDraft.label = 'New draft'
    api.addOnDraft.price = 3
    failed ? h.response.reject(Error('Failure')) : h.response.resolve()
    await pending
    assert.deepEqual(h.calls, [
      [{ id: 'original', label: 'Original', price: 2 }],
    ])
    assert.equal(api.addOnDraft.label, 'New draft')
    assert.equal(api.addOnDraft.price, 3)
    assert.equal(api.actionError.value, '')
    h.lifetime.stop()
  }
})

test('shared-price adoption refuses malformed returned identities without emitting adoption', async () => {
  for (const result of [
    {},
    { sellableId: 123 },
    { sellableId: 'parent/child' },
  ]) {
    const h = context(),
      props = reactive({
        row: { id: 'item', priceOptions: [] },
        kitchenId: 'kitchen',
        menuId: 'menu',
        sectionId: 'section',
        canWrite: true,
      })
    const api = h.run(
      'kitchen/components/Workspace/Menus/Items/AdoptSharedTerms.vue',
      '({adopt,open,error})',
      {
        defineProps: () => props,
        defineEmits:
          () =>
          (...args) =>
            h.effects.push(args),
        isFirestoreDocumentId: (value) =>
          typeof value === 'string' &&
          Boolean(value.trim()) &&
          !value.includes('/'),
      }
    )
    api.open.value = true
    const pending = api.adopt()
    h.token.resolve('token')
    h.response.resolve(result)
    await pending
    assert.deepEqual(h.effects, [])
    assert.equal(api.open.value, true)
    assert.match(api.error.value, /Could not confirm/)
    h.lifetime.stop()
  }
})

test('Options invalidates same-ID and same-route completion after ownership or write access switches', async () => {
  for (const field of ['kitchen_id', 'menu_id', 'section_id', 'canWrite'])
    for (const failed of [false, true]) {
      const h = context(),
        props = reactive({
          row: {
            id: 'item',
            item: {
              kitchen_id: 'kitchen',
              menu_id: 'menu',
              section_id: 'section',
            },
            price: 5,
            priceOptions: [],
            addOns: [],
          },
          canWrite: true,
          updatePriceOptions: () => h.response.promise,
          updateAddOns: () => h.response.promise,
        })
      const api = h.run(
        'kitchen/components/Workspace/Menus/Items/Options.vue',
        '({runAction,addPriceOption,variantDraft,actionError})',
        {
          defineProps: () => props,
          normalizeSlug: (value) => String(value).trim().toLowerCase(),
        }
      )
      api.variantDraft.label = 'Original'
      api.variantDraft.price = 8
      const pending = api.runAction(api.addPriceOption)
      if (field === 'canWrite') {
        props.canWrite = false
        props.canWrite = true
      } else {
        const original = props.row.item[field]
        props.row.item[field] = 'other'
        props.row.item[field] = original
      }
      assert.equal(props.row.id, 'item')
      assert.equal(h.route.fullPath, '/workspace/kitchen/menus/create')
      failed ? h.response.reject(Error('Failure')) : h.response.resolve()
      await pending
      assert.equal(api.actionError.value, '', field)
      assert.equal(api.variantDraft.label, 'Original', field)
      h.lifetime.stop()
    }
})

test('Menu removal returns to the collection after live data removes the record', async () => {
  const h = context()
  const menuId = ref('menu'),
    menuSlug = ref('main'),
    canManage = ref(true)
  const api = h.run(
    'kitchen/components/Workspace/Menus/Detail/Remove.vue',
    '({remove,busy,error})',
    {
      useKitchenMenuRecordContext: () => ({
        menu: ref({ id: 'menu', name: 'Main' }),
        menuId,
        menuSlug,
        kitchenId: h.kitchenId,
        canManage,
      }),
      useMenuDelete: () => ({ deleteMenu: () => h.response.promise }),
      navigateTo: (path) => h.effects.push(path),
    }
  )
  const request = api.remove()
  menuId.value = ''
  canManage.value = false
  h.response.resolve({ ok: true })
  await request
  assert.deepEqual(h.effects, ['/workspace/kitchen/menus'])
  assert.equal(api.busy.value, false)
})

test('Menu suggestions stay locked for Free and create ordinary interactive drafts for Plus', async () => {
  for (const tier of ['free', 'premium', 'business']) {
    const h = context()
    const api = h.run('kitchen/components/Workspace/Menus/Collection/Suggestions.vue', '({create,hasPlus,suggestions})', {
      useKitchenMenusContext: () => ({ menus: ref([]), subscription: ref(tier), canCreateMenu: ref(true), kitchenId: h.kitchenId,
        createMenu: async input => { h.calls.push(input); return { slug: 'breakfast' } } }),
      useMenuRecordNavigation: () => ({ openView: (...args) => h.effects.push(args) }),
    })
    assert.deepEqual(api.suggestions.value, ['Breakfast', 'Lunch', 'Specials'])
    await api.create('Breakfast')
    assert.deepEqual(h.calls, tier === 'free' ? [] : [{ name: 'Breakfast', format: 'interactive' }])
    assert.deepEqual(h.effects, tier === 'free' ? [] : [['breakfast', 'content']])
  }
})
