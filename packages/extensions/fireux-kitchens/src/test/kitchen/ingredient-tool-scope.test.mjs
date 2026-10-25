import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as vue from 'vue'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'

function load(path, result, deps) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (source.includes('<script setup'))
    source = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  vue
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
  for (let i = 0; i < 6; i++) await Promise.resolve()
}
function context() {
  const lifetime = vue.effectScope(),
    token = deferred(),
    response = deferred()
  const user = { uid: 'actor', getIdToken: () => token.promise }
  const currentUser = vue.ref(user),
    config = vue.reactive({ appId: 'app' })
  const appUser = vue.ref({ role: 'admin', created: { at: 1 } })
  const appPending = vue.ref(false),
    appError = vue.ref(null),
    appOutcome = vue.ref('ready')
  const kitchenId = vue.ref('kitchen'),
    ingredientId = vue.ref('carrot'),
    canWrite = vue.ref(true)
  const access = { ids: vue.ref(['kitchen']), outcome: vue.ref('ready') }
  const calls = [],
    effects = [],
    route = vue.reactive({ fullPath: '/ingredients/carrot' })
  const deps = {
    ...vue,
    useCommandScope,
    useAuth: () => ({ currentUser }),
    useFireUXConfig: () => config,
    useUserSession: () => ({
      appUser,
      appPending,
      appError,
      appOutcome,
    }),
    useKitchenWorkspace: () => ({ id: kitchenId }),
    useKitchenAccess: () => access,
    useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
    useRoute: () => route,
    refreshNuxtData: async () => {},
    $fetch: (url, options) => {
      calls.push({ url, options })
      return response.promise
    },
    useToastify: () => ({
      success: (message) => effects.push(['success', message]),
      error: (message) => effects.push(['error', message]),
    }),
    navigateTo: async (path) => effects.push(['navigate', path]),
  }
  const useKitchenIngredientSelection = load(
    '../../runtime/kitchen/composables/workspace/ingredients/useKitchenIngredientSelection.ts',
    'useKitchenIngredientSelection',
    deps
  )
  deps.useKitchenIngredientSelection = useKitchenIngredientSelection
  const change = (kind) => {
    if (kind === 'account') {
      currentUser.value = { uid: 'other' }
      currentUser.value = user
    }
    if (kind === 'app') {
      config.appId = 'other'
      config.appId = 'app'
    }
    if (kind === 'membership') {
      const original = appUser.value
      appUser.value = { role: 'admin', created: { at: 2 } }
      appUser.value = original
    }
    if (kind === 'kitchen') {
      kitchenId.value = 'other'
      kitchenId.value = 'kitchen'
    }
    if (kind === 'access') {
      access.ids.value = []
      access.ids.value = ['kitchen']
    }
    if (kind === 'route') {
      route.fullPath = '/other'
      route.fullPath = '/ingredients/carrot'
    }
    if (kind === 'membership-pending') {
      appPending.value = true
      appPending.value = false
    }
    if (kind === 'membership-error') {
      appError.value = new Error('Membership read failed')
      appError.value = null
    }
    if (kind === 'membership-outcome') {
      appOutcome.value = 'pending'
      appOutcome.value = 'ready'
    }
    if (kind === 'dispose') lifetime.stop()
  }
  return {
    lifetime,
    token,
    response,
    calls,
    effects,
    kitchenId,
    ingredientId,
    canWrite,
    deps,
    change,
  }
}
const exactResponse = { ok: true, kitchenId: 'kitchen', ingredientId: 'carrot' }

test('Ingredient selection keeps exact actor/App/member/Kitchen/local/disposal intent through credentials', async () => {
  for (const action of ['selectIngredient', 'unselectIngredient']) {
    for (const changed of [
      'stable',
      'account',
      'app',
      'membership',
      'membership-pending',
      'membership-error',
      'membership-outcome',
      'kitchen',
      'route',
      'access',
      'local',
      'dispose',
    ]) {
      const h = context(),
        open = vue.ref(true)
      const api = h.lifetime.run(() =>
        h.deps.useKitchenIngredientSelection([open])
      )
      const flight = api[action]('kitchen', 'carrot', {
        kitchenCollectionPath: 'kitchens',
      })
      if (changed === 'local') {
        open.value = false
        open.value = true
      } else h.change(changed)
      h.token.resolve('token')
      h.response.resolve(exactResponse)
      if (changed === 'stable') {
        assert.equal(await flight, 'carrot')
        assert.equal(h.calls.length, 1)
        assert.equal(
          h.calls[0].url,
          `/api/workspace/kitchen/ingredients/${action === 'selectIngredient' ? 'create' : 'delete'}`
        )
        assert.deepEqual(h.calls[0].options.body, {
          kitchenId: 'kitchen',
          ingredientId: 'carrot',
        })
      } else {
        await assert.rejects(flight, /changed/)
        assert.equal(h.calls.length, 0, `${action}: ${changed}`)
      }
      h.lifetime.stop()
    }
  }
})
test('Ingredient selection preserves truthful dispatched results and rejects mismatched responses', async () => {
  for (const action of ['selectIngredient', 'unselectIngredient']) {
    for (const changed of [
      'account',
      'app',
      'membership',
      'kitchen',
      'dispose',
    ]) {
      const h = context(),
        api = h.lifetime.run(() => h.deps.useKitchenIngredientSelection())
      const flight = api[action]('kitchen', 'carrot', {
        kitchenCollectionPath: 'kitchens',
      })
      h.token.resolve('token')
      await drain()
      assert.equal(h.calls.length, 1)
      h.change(changed)
      h.response.resolve(exactResponse)
      assert.equal(await flight, 'carrot')
      h.lifetime.stop()
    }
    for (const bad of [
      {},
      { ...exactResponse, ok: false },
      { ...exactResponse, kitchenId: 'other' },
      { ...exactResponse, ingredientId: 'other' },
    ]) {
      const h = context(),
        api = h.lifetime.run(() => h.deps.useKitchenIngredientSelection())
      const flight = api[action]('kitchen', 'carrot', {
        kitchenCollectionPath: 'kitchens',
      })
      h.token.resolve('token')
      h.response.resolve(bad)
      await assert.rejects(flight, /response did not match/)
      h.lifetime.stop()
    }
  }
})
function detail(h) {
  const ingredient = vue.ref({ id: 'carrot', name: 'Carrot' })
  const api = h.lifetime.run(() =>
    load(
      '../../runtime/kitchen/components/PrepAndProduction/Ingredients/Detail/Index.vue',
      '({removeIngredient, deleteOpen, deleting, deleteError})',
      {
        ...h.deps,
        useKitchenWorkspace: () => ({ outcome: vue.ref('ready'), id: h.kitchenId }),
        useRouteParam: () => h.ingredientId,
        useKitchenIngredientDetail: () => ({
          ingredient,
          ingredientId: h.ingredientId,
          kitchenId: h.kitchenId,
          canWrite: h.canWrite,
          pending: vue.ref(false),
          loadError: vue.ref(null),
          debug: vue.ref({}),
        }),
      }
    )
  )
  return { ...api, ingredient }
}

test('closing Ingredient removal before credentials cancels dispatch and lets the dialog reopen', async () => {
  const h = context(),
    api = detail(h)
  api.deleteOpen.value = true
  const flight = api.removeIngredient()
  assert.equal(api.deleting.value, true)
  api.deleteOpen.value = false
  assert.equal(api.deleting.value, false)
  api.deleteOpen.value = true
  h.token.resolve('token')
  h.response.resolve(exactResponse)
  await flight
  assert.equal(h.calls.length, 0)
  assert.deepEqual(h.effects, [])
  assert.equal(api.deleteError.value, '')
  assert.equal(api.deleting.value, false)
  h.lifetime.stop()
})
test('successful Ingredient removal closes and navigates with settled busy state', async () => {
  const h = context(),
    api = detail(h)
  api.deleteOpen.value = true
  const flight = api.removeIngredient()
  h.token.resolve('token')
  h.response.resolve(exactResponse)
  await flight
  assert.equal(api.deleteOpen.value, false)
  assert.equal(api.deleting.value, false)
  assert.deepEqual(h.effects, [
    ['navigate', '/workspace/kitchen/prep/ingredients'],
  ])
  api.deleteOpen.value = true
  assert.equal(api.deleting.value, false)
  h.lifetime.stop()
})
test('Ingredient removal suppresses stale navigation and errors after dispatch', async () => {
  for (const changed of [
    'account',
    'app',
    'membership',
    'kitchen',
    'close',
    'dispose',
  ]) {
    for (const failed of [false, true]) {
      const h = context(),
        api = detail(h)
      api.deleteOpen.value = true
      const flight = api.removeIngredient()
      h.token.resolve('token')
      await drain()
      assert.equal(h.calls.length, 1)
      if (changed === 'close') api.deleteOpen.value = false
      else h.change(changed)
      failed
        ? h.response.reject(new Error('Obsolete failure'))
        : h.response.resolve(exactResponse)
      await flight
      assert.deepEqual(h.effects, [], changed)
      assert.equal(api.deleteError.value, '', changed)
      h.lifetime.stop()
    }
  }
})

function mountEdit(h) {
  const upload = deferred(),
    uploads = []
  const ingredient = vue.reactive({
    id: 'carrot',
    name: 'Carrot',
    aliases: [],
    category: 'vegetables',
    image_url: '',
  })
  const deps = {
    ...h.deps,
    useImageStorage: () => ({
      uploadImage: (path, file) => {
        uploads.push({ path, file })
        return upload.promise
      },
    }),
    INGREDIENT_CATEGORY_OPTIONS: [{ value: 'vegetables', label: 'Vegetables' }],
  }
  deps.useIngredientUpdate = load(
    '../../runtime/ingredient/composables/firestore/mutations/useIngredientUpdate.ts',
    'useIngredientUpdate',
    deps
  )
  deps.useIngredientImageGeneration = load(
    '../../runtime/ingredient/composables/useIngredientImageGeneration.ts',
    'useIngredientImageGeneration',
    deps
  )
  const content = readFileSync(
    new URL(
      '../../runtime/ingredient/components/Edit/Index.vue',
      import.meta.url
    ),
    'utf8'
  ).replace(
    '</script>',
    '\ndefineExpose({ form, saving, imageUploading, saveChanges, handleImageUpload, resetForm })\n</script>'
  )
  const { descriptor } = parse(content)
  const script = compileScript(descriptor, {
    id: 'ingredient-editor',
    inlineTemplate: true,
  })
  const exports = {}
  compileFunction(
    ts.transpileModule(script.content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    ['require', 'exports']
  )((id) => {
    if (id === 'vue') return vue
    if (
      /useToastify|useImageStorage|useIngredientUpdate|useIngredientImageGeneration|ingredient-taxonomy|useAuth|FireUXConfig|useUserSession/.test(
        id
      )
    )
      return deps
    throw new Error(id)
  }, exports)
  const renderer = vue.createRenderer({
    createElement: (type) => ({ type, children: [], props: {} }),
    createText: (text) => ({ text }),
    createComment: (text) => ({ text }),
    setText: (node, text) => {
      node.text = text
    },
    setElementText: (node, text) => {
      node.text = text
    },
    parentNode: (node) => node.parent,
    nextSibling: () => null,
    insert: (node, parent, anchor) => {
      if (node.parent) {
        const index = node.parent.children.indexOf(node)
        if (index >= 0) node.parent.children.splice(index, 1)
      }
      node.parent = parent
      const index = anchor ? parent.children.indexOf(anchor) : -1
      index < 0
        ? parent.children.push(node)
        : parent.children.splice(index, 0, node)
    },
    remove: (node) => {
      const index = node.parent?.children.indexOf(node)
      if (index >= 0) node.parent.children.splice(index, 1)
    },
    patchProp: (node, key, _old, value) => {
      node.props[key] = value
    },
  })
  const app = renderer.createApp(exports.default, {
    ingredientId: 'carrot',
    ingredient,
  })
  const warnings = []
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of ['UCard', 'UFormField', 'FireStateCard'])
    app.component(name, {
      render() {
        return vue.h('div', this.$slots.default?.())
      },
    })
  for (const [name, type] of [
    ['UInput', 'input'],
    ['USelect', 'select'],
    ['UButton', 'button'],
    ['FireFormsEditableImagePicker', 'image-picker'],
  ])
    app.component(name, {
      render() {
        return vue.h(type, this.$attrs, this.$slots.default?.())
      },
    })
  const root = { children: [] },
    api = app.mount(root)
  const nodes = (type) => {
    const found = []
    const walk = (node) => {
      if (node.type === type) found.push(node)
      for (const child of node.children || []) walk(child)
    }
    walk(root)
    return found
  }
  return {
    api,
    ingredient,
    props: app._instance.props,
    nodes,
    upload,
    uploads,
    unmount: () => {
      app.unmount()
      assert.deepEqual(warnings, [])
    },
  }
}
test('Ingredient curation locks editable fields and image action during save', async () => {
  const h = context(),
    editor = mountEdit(h)
  editor.api.form.name = 'New name'
  const flight = editor.api.saveChanges()
  await vue.nextTick()
  for (const node of [
    ...editor.nodes('input'),
    ...editor.nodes('select'),
    ...editor.nodes('image-picker'),
  ])
    assert.equal(node.props.disabled, true, node.type)
  await editor.api.handleImageUpload({ name: 'new.webp' })
  assert.equal(editor.uploads.length, 0)
  h.token.resolve('token')
  h.response.resolve({ ingredient: { id: 'carrot' } })
  await flight
  assert.deepEqual(h.calls[0].options.body, {
    name: 'New name',
    aliases: [],
    category: 'vegetables',
  })
  assert.deepEqual(h.effects, [['success', 'Ingredient updated']])
  await vue.nextTick()
  for (const node of [
    ...editor.nodes('input'),
    ...editor.nodes('select'),
    ...editor.nodes('image-picker'),
  ])
    assert.equal(node.props.disabled, false)
  editor.unmount()
  h.lifetime.stop()
})
test('Ingredient curation image upload is single-flight and blocks overlapping saves', async () => {
  const h = context(),
    editor = mountEdit(h)
  editor.api.form.name = 'Draft'
  const first = editor.api.handleImageUpload({ name: 'first.webp' })
  const duplicate = editor.api.handleImageUpload({ name: 'second.webp' })
  const save = editor.api.saveChanges()
  assert.equal(editor.uploads.length, 1)
  assert.equal(h.calls.length, 0)
  await vue.nextTick()
  assert.equal(editor.nodes('image-picker')[0].props.loading, true)
  for (const node of [...editor.nodes('input'), ...editor.nodes('select')])
    assert.equal(node.props.disabled, true)
  editor.upload.resolve('https://example.com/first.webp')
  h.token.resolve('token')
  h.response.resolve({ ingredient: { id: 'carrot' } })
  await Promise.all([first, duplicate, save])
  assert.deepEqual(h.calls[0].options.body, {
    image_url: 'https://example.com/first.webp',
  })
  assert.equal(editor.api.imageUploading, false)
  editor.unmount()
  h.lifetime.stop()
})
test('Ingredient curation upload cannot perform a follow-on write or feedback after disposal', async () => {
  const h = context(),
    editor = mountEdit(h)
  const flight = editor.api.handleImageUpload({ name: 'first.webp' })
  editor.unmount()
  editor.upload.resolve('https://example.com/obsolete.webp')
  await flight
  assert.equal(h.calls.length, 0)
  assert.deepEqual(h.effects, [])
  h.lifetime.stop()
})

test('committed Ingredient create/update results do not depend on redundant Nuxt cache refresh', async () => {
  for (const name of ['useIngredientCreate', 'useIngredientUpdate']) {
    const h = context()
    let refreshes = 0
    const deps = {
      ...h.deps,
      normalizeSlug: (name) => name.toLowerCase(),
      refreshNuxtData: async () => {
        refreshes++
        throw new Error('Refresh failed after commit')
      },
    }
    const factory = load(
      `../../runtime/ingredient/composables/firestore/mutations/${name}.ts`,
      name,
      deps
    )
    const api = h.lifetime.run(() => factory())
    const flight =
      name === 'useIngredientCreate'
        ? api.createIngredient({ name: 'Carrot', category: 'vegetables' })
        : api.updateIngredient({
            ingredientId: 'carrot',
            changes: { name: 'Updated' },
          })
    h.token.resolve('token')
    h.response.resolve({ ingredient: { id: 'carrot', name: 'Updated' } })
    const result = await flight
    assert.equal(result.id, 'carrot')
    assert.equal(h.calls.length, 1)
    assert.equal(refreshes, 0)
    h.lifetime.stop()
  }
})

test('Ingredient curation preserves dirty identity drafts across image and external live updates', async () => {
  const h = context(),
    editor = mountEdit(h)
  Object.assign(editor.api.form, {
    name: 'Local name',
    aliases: 'Local alias',
    category: 'fruit',
  })
  editor.ingredient.image_url = 'https://example.com/live.webp'
  await vue.nextTick()
  assert.deepEqual(
    { ...editor.api.form },
    { name: 'Local name', aliases: 'Local alias', category: 'fruit' }
  )
  Object.assign(editor.ingredient, {
    name: 'Remote name',
    aliases: ['Remote alias'],
    category: 'meat',
  })
  await vue.nextTick()
  assert.deepEqual(
    { ...editor.api.form },
    { name: 'Local name', aliases: 'Local alias', category: 'fruit' }
  )
  editor.api.resetForm()
  assert.deepEqual(
    { ...editor.api.form },
    { name: 'Remote name', aliases: 'Remote alias', category: 'meat' }
  )
  editor.ingredient.name = 'Next remote name'
  await vue.nextTick()
  assert.equal(editor.api.form.name, 'Next remote name')
  editor.api.form.name = 'Another local draft'
  h.change('account')
  assert.equal(editor.api.form.name, 'Next remote name')
  editor.api.form.name = 'Previous record draft'
  editor.props.ingredientId = 'potato'
  assert.equal(editor.api.form.name, 'Next remote name')
  editor.unmount()
  h.lifetime.stop()
})
test('programmatic Ingredient draft changes cancel credentials and suppress obsolete completion', async () => {
  for (const stage of ['token', 'response']) {
    for (const failed of [false, true]) {
      const h = context(),
        editor = mountEdit(h)
      editor.api.form.name = 'Submitted name'
      const flight = editor.api.saveChanges()
      if (stage === 'response') {
        h.token.resolve('token')
        await drain()
        assert.equal(h.calls.length, 1)
      }
      editor.api.form.name = 'Replacement draft'
      h.token.resolve('token')
      failed
        ? h.response.reject(new Error('Old failure'))
        : h.response.resolve({ ingredient: { id: 'carrot' } })
      // A token-stage cancellation never consumes the command response promise.
      if (stage === 'token' && failed) h.response.promise.catch(() => {})
      await flight
      assert.equal(h.calls.length, stage === 'token' ? 0 : 1)
      assert.equal(editor.api.form.name, 'Replacement draft')
      assert.deepEqual(h.effects, [])
      editor.unmount()
      h.lifetime.stop()
    }
  }
})

test('Ingredient removal hands off to the collection after its own live record disappears', async () => {
  const h = context(),
    api = detail(h)
  api.deleteOpen.value = true
  const flight = api.removeIngredient()
  h.token.resolve('token')
  await drain()
  assert.equal(h.calls.length, 1)
  api.ingredient.value = null
  h.canWrite.value = false
  h.response.resolve(exactResponse)
  await flight
  assert.equal(api.ingredient.value, null)
  assert.equal(api.deleting.value, false)
  assert.equal(api.deleteOpen.value, false)
  assert.deepEqual(h.effects, [
    ['navigate', '/workspace/kitchen/prep/ingredients'],
  ])
  h.lifetime.stop()
})

test('Ingredient add resets on authority changes and an old completion cannot clear a newer selection', async () => {
  for (const changed of ['account', 'app', 'membership', 'route']) {
    const h = context(),
      second = deferred()
    let requests = 0
    h.deps.$fetch = (url, options) => {
      h.calls.push({ url, options })
      return requests++ ? second.promise : h.response.promise
    }
    h.deps.useKitchenIngredientSelection = load(
      '../../runtime/kitchen/composables/workspace/ingredients/useKitchenIngredientSelection.ts',
      'useKitchenIngredientSelection',
      h.deps
    )
    const api = h.lifetime.run(() =>
      load(
        '../../runtime/kitchen/components/PrepAndProduction/Ingredients/Add/Index.vue',
        '({handleSelect, query, selectedId, submitting})',
        {
          ...h.deps,
          useKitchenWorkspaceIngredients: () => ({
            kitchenId: h.kitchenId,
            rootCollection: vue.ref('kitchens'),
            canWrite: h.canWrite,
            ingredients: vue.ref([]),
          }),
          useIngredientCollection: () => ({
            ingredients: vue.ref([]),
            pending: vue.ref(false),
            error: vue.ref(null),
          }),
          ingredientCategoryLabel: (value) => value,
        }
      )
    )
    const first = api.handleSelect('carrot')
    h.token.resolve('token')
    await drain()
    assert.equal(h.calls.length, 1)
    h.change(changed)
    assert.equal(api.submitting.value, false)
    const next = api.handleSelect('carrot')
    await drain()
    assert.equal(h.calls.length, 2)
    h.response.resolve(exactResponse)
    await first
    assert.equal(api.submitting.value, true)
    assert.equal(api.selectedId.value, 'carrot')
    assert.deepEqual(h.effects, [])
    second.resolve(exactResponse)
    await next
    assert.equal(api.submitting.value, false)
    assert.deepEqual(h.effects, [['success', 'Ingredient added']])
    h.lifetime.stop()
  }
})
