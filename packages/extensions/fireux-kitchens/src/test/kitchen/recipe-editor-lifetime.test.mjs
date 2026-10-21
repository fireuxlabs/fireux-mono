import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as vue from 'vue'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
function load(path, result, deps) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
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
const isFirestoreDocumentId = load(
  '../../../../../core/fireux-core/src/runtime/utils/firestoreDocumentId.ts',
  'isFirestoreDocumentId',
  {}
)
const preparation = load(
  '../../runtime/kitchen/utils/recipe-preparation.ts',
  '({normalizeRecipePreparation,validateRecipePreparation})',
  { isFirestoreDocumentId }
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
  for (let i = 0; i < 8; i++) await Promise.resolve()
}
function context() {
  const scope = vue.effectScope(),
    auth = deferred(),
    token = deferred(),
    response = deferred()
  const user = { uid: 'actor', getIdToken: () => token.promise },
    currentUser = vue.ref(user)
  const config = vue.reactive({ appId: 'app' }),
    appUser = vue.ref({ role: 'admin', created: { at: 1 } })
  const appPending = vue.ref(false),
    appError = vue.ref(null),
    appOutcome = vue.ref('ready')
  const selectedId = vue.ref('kitchen'),
    route = vue.reactive({
      fullPath: '/workspace/kitchen/prep/recipes/recipe',
    })
  const access = { ids: vue.ref(['kitchen']), outcome: vue.ref('ready') },
    calls = [],
    seeds = []
  const deps = {
    ...vue,
    ...preparation,
    useCommandScope,
    isFirestoreDocumentId,
    useAuth: () => ({ currentUser }),
    useFireUXConfig: () => config,
    useUserSession: () => ({ appUser, appPending, appError, appOutcome }),
    useKitchenAccess: () => access,
    useRoute: () => route,
    useKitchenWorkspaceSelection: () => ({ selectedId }),
    useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
    useRequireUser: () => auth.promise,
    useTranslationSeed: () => ({
      seedTranslations: async (input) => {
        seeds.push(input)
        return {
          sourceLanguage: 'en',
          text: { ...input.existingText, en: input.text },
          failedLanguages: [],
        }
      },
    }),
    $fetch: (url, options) => {
      calls.push({ url, options })
      return response.promise
    },
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
    if (kind === 'member') {
      const old = appUser.value
      appUser.value = { role: 'admin', created: { at: 2 } }
      appUser.value = old
    }
    if (kind === 'pending') {
      appPending.value = true
      appPending.value = false
    }
    if (kind === 'error') {
      appError.value = new Error('Membership failed')
      appError.value = null
    }
    if (kind === 'outcome') {
      appOutcome.value = 'pending'
      appOutcome.value = 'ready'
    }
    if (kind === 'access') {
      access.ids.value = []
      access.ids.value = ['kitchen']
    }
    if (kind === 'kitchen') {
      selectedId.value = 'other'
      selectedId.value = 'kitchen'
    }
    if (kind === 'route') {
      route.fullPath = '/other'
      route.fullPath = '/workspace/kitchen/prep/recipes/recipe'
    }
    if (kind === 'dispose') scope.stop()
  }
  const factories = () => {
    deps.useRecipeScope = load(
      '../../runtime/kitchen/composables/recipe/useRecipeScope.ts',
      'useRecipeScope',
      deps
    )
    deps.useRecipeMutation = load(
      '../../runtime/kitchen/composables/recipe/useRecipeMutation.ts',
      'useRecipeMutation',
      deps
    )
    for (const name of [
      'useRecipeCreate',
      'useRecipeUpdate',
      'useRecipeDelete',
    ])
      deps[name] = load(
        `../../runtime/kitchen/composables/recipe/${name}.ts`,
        name,
        deps
      )
    deps.useKitchenPrepItemCreate = load(
      '../../runtime/kitchen/composables/prep-item/useKitchenPrepItemCreate.ts',
      'useKitchenPrepItemCreate',
      deps
    )
  }
  factories()
  return {
    scope,
    auth,
    token,
    response,
    user,
    calls,
    seeds,
    deps,
    change,
    factories,
  }
}
const changedKinds = [
  'stable',
  'account',
  'app',
  'member',
  'pending',
  'error',
  'outcome',
  'access',
  'kitchen',
  'route',
  'local',
  'dispose',
]
test('Recipe mutation snapshots authority and local intent through auth/token waits while preserving dispatched results', async () => {
  for (const method of ['POST', 'PATCH', 'DELETE'])
    for (const stage of ['auth', 'token', 'response'])
      for (const changed of changedKinds) {
        const h = context(),
          local = vue.ref('before'),
          api = h.scope.run(() => h.deps.useRecipeMutation([local]))
        const body =
          method === 'POST'
            ? { draft: { name: 'Original' } }
            : { recipeId: 'recipe', changes: { name: 'Original' } }
        const flight = api.mutate(method, body)
        if (stage !== 'auth') {
          h.auth.resolve(h.user)
          await drain()
        }
        if (stage === 'response') {
          h.token.resolve('token')
          await drain()
          assert.equal(h.calls.length, 1)
        }
        if (changed === 'local') {
          local.value = 'other'
          local.value = 'before'
        } else h.change(changed)
        h.auth.resolve(h.user)
        h.token.resolve('token')
        h.response.resolve({ id: 'recipe' })
        if (changed !== 'stable' && stage !== 'response') {
          await assert.rejects(flight, /changed/)
          assert.equal(h.calls.length, 0)
        } else {
          assert.equal((await flight).id, 'recipe')
          assert.equal(h.calls.length, 1)
        }
        h.scope.stop()
      }
})
test('Recipe and Prep responses require a safe string document identity and exact update/delete target', async () => {
  for (const kind of ['create', 'update', 'delete', 'prep'])
    for (const id of [
      null,
      8,
      '',
      ' ',
      ' recipe ',
      'a/b',
      '..',
      '__reserved__',
      ...(kind === 'update' || kind === 'delete' ? ['other'] : []),
    ]) {
      const h = context(),
        api = h.scope.run(() =>
          kind === 'prep'
            ? h.deps.useKitchenPrepItemCreate()
            : h.deps.useRecipeMutation()
        )
      const flight =
        kind === 'prep'
          ? api.createPrepItem({ name: 'Prep' }, {}, { translate: false })
          : api.mutate(
              kind === 'create'
                ? 'POST'
                : kind === 'update'
                  ? 'PATCH'
                  : 'DELETE',
              kind === 'create'
                ? { draft: { name: 'Original' } }
                : { recipeId: 'recipe' }
            )
      h.auth.resolve(h.user)
      h.token.resolve('token')
      h.response.resolve({ id })
      await assert.rejects(flight, /response did not identify/)
      h.scope.stop()
    }
})
test('Recipe translation preparation stops before a second seed when its originating intent changes', async () => {
  const h = context(),
    seed = deferred()
  h.deps.useTranslationSeed = () => ({
    seedTranslations: (input) => {
      h.seeds.push(input)
      return seed.promise
    },
  })
  h.factories()
  const api = h.scope.run(() => h.deps.useRecipeCreate())
  const flight = api.createRecipe(
    { name: 'Original', description: 'Notes' },
    {},
    { translate: false }
  )
  h.change('app')
  seed.resolve({
    sourceLanguage: 'en',
    text: { en: 'Original' },
    failedLanguages: [],
  })
  await assert.rejects(flight, /changed/)
  assert.equal(h.seeds.length, 1)
  assert.equal(h.calls.length, 0)
  h.scope.stop()
})
test('Recipe mutation copies nested caller inputs before credentials', async () => {
  const h = context(),
    api = h.scope.run(() => h.deps.useRecipeMutation()),
    input = {
      recipeId: 'recipe',
      changes: {
        names: { en: 'Original' },
        preparation: { yield: { quantity: 2 } },
      },
    }
  const flight = api.mutate('PATCH', input)
  input.changes.names.en = 'Changed'
  input.changes.preparation.yield.quantity = 99
  h.auth.resolve(h.user)
  h.token.resolve('token')
  h.response.resolve({ id: 'recipe' })
  await flight
  assert.equal(h.calls[0].options.body.changes.names.en, 'Original')
  assert.equal(h.calls[0].options.body.changes.preparation.yield.quantity, 2)
  h.scope.stop()
})
function mountForm(h, recipe = null) {
  const props = vue.reactive({
      recipe,
      kitchenId: 'kitchen',
      canWrite: true,
      databaseId: 'database',
      rootCollection: 'kitchens',
    }),
    saved = []
  const ingredientRead = {
    ingredients: vue.ref([]),
    pending: vue.ref(false),
    error: vue.ref(null),
  }
  const readCounts = { ingredients: 0, prepItems: 0 }
  const deps = {
    ...h.deps,
    useKitchenIngredients: () => {
      readCounts.ingredients++
      return ingredientRead
    },
    useKitchenPrepItems: () => {
      readCounts.prepItems++
      return { prepItems: vue.ref([]), error: vue.ref(null) }
    },
  }
  const compileComponent = (file) => {
    const exposed = file.pathname.endsWith('PrepItems/Create.vue')
      ? 'createPrep,newPrepName,newPrepIngredient,newPrepQuantity,newPrepUnit,newPrepMethod,creatingPrep,message'
      : file.pathname.endsWith('Form/Index.vue')
        ? 'save,name,description,preparation,method,saving,creatingPrep,message'
        : ''
    let content = readFileSync(file, 'utf8')
    if (exposed)
      content = content.replace(
        '</script>',
        `\ndefineExpose({${exposed}})\n</script>`
      )
    const { descriptor } = parse(content)
    const script = compileScript(descriptor, {
      id: file.pathname,
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
      if (id.endsWith('.vue'))
        return { default: compileComponent(new URL(id, file)) }
      if (
        id === '#imports' ||
        /useRecipeScope|useRecipeCreate|useRecipeUpdate|useKitchenPrepItemCreate|useKitchenIngredients|useKitchenPrepItems|recipe-preparation/.test(
          id
        )
      )
        return deps
      throw new Error(id)
    }, exports)
    return exports.default
  }
  const Form = compileComponent(
    new URL(
      '../../runtime/kitchen/components/PrepAndProduction/Recipes/Form/Index.vue',
      import.meta.url
    )
  )
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
  const app = renderer.createApp({
    setup: () => () =>
      vue.h(Form, { ...props, onSaved: (id) => saved.push(id) }),
  })
  for (const section of ['Identity', 'Ingredients', 'PrepItems', 'Instructions'])
    app.component(
      `KitchenPrepAndProductionRecipesForm${section}`,
      compileComponent(new URL(
        `../../runtime/kitchen/components/PrepAndProduction/Recipes/Form/${section}.vue`,
        import.meta.url
      ))
    )
  app.component(
    'KitchenPrepAndProductionPrepItemsCreate',
    compileComponent(new URL(
      '../../runtime/kitchen/components/PrepAndProduction/PrepItems/Create.vue',
      import.meta.url
    ))
  )
  const warnings = []
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of ['UFormField', 'MoleculesStateCard'])
    app.component(name, {
      render() {
        return vue.h('div', this.$slots.default?.())
      },
    })
  for (const [name, type] of [
    ['UInput', 'input'],
    ['UTextarea', 'textarea'],
    ['USelect', 'select'],
    ['UButton', 'button'],
    ['NuxtLink', 'a'],
  ])
    app.component(name, {
      render() {
        return vue.h(type, this.$attrs, this.$slots.default?.())
      },
    })
  const root = { children: [] }
  app.mount(root)
  const parentApi = app._instance.subTree.component.exposed
  let prepApi
  const findPrep = (vnode) => {
    if (vnode?.component) {
      if (vnode.component.exposed?.createPrep) prepApi = vnode.component.exposed
      findPrep(vnode.component.subTree)
    }
    if (Array.isArray(vnode?.children)) vnode.children.forEach(findPrep)
  }
  findPrep(app._instance.subTree)
  assert.ok(prepApi, 'the real Prep creator is composed inside the Recipe form')
  const api = { ...prepApi, ...parentApi }
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
    prepApi,
    props,
    saved,
    nodes,
    ingredientRead,
    readCounts,
    unmount: () => {
      app.unmount()
      assert.deepEqual(warnings, [])
    },
  }
}
const existing = () => ({
  id: 'recipe',
  name: 'Original',
  description: 'Original notes',
  source_language: 'en',
  preparation: preparation.normalizeRecipePreparation({}),
})
test('native Recipe form locks during save, prevents nested Prep creation and intentionally converts numeric inputs', async () => {
  for (const mode of ['create', 'update']) {
    const h = context(),
      f = mountForm(h, mode === 'update' ? existing() : null)
    f.api.name.value = 'Submitted'
    f.api.preparation.value.yield.quantity = '2.5'
    f.api.preparation.value.ingredients = [
      { ingredient_id: 'carrot', quantity: '3', unit: 'g', note: '' },
    ]
    f.api.preparation.value.prep_items = [
      { prep_item_id: 'sauce', quantity: '4', unit: 'g', note: '' },
    ]
    f.api.newPrepName.value = 'Do not create'
    const flight = f.api.save()
    await vue.nextTick()
    assert.equal(f.nodes('fieldset')[0].props.disabled, true)
    await f.api.createPrep()
    assert.equal(h.calls.length, 0)
    h.auth.resolve(h.user)
    h.token.resolve('token')
    h.response.resolve({ id: 'recipe' })
    await flight
    assert.equal(h.calls.length, 1)
    assert.deepEqual(f.saved, ['recipe'])
    const draft =
      h.calls[0].options.body[mode === 'create' ? 'draft' : 'changes']
    assert.equal(draft.preparation.yield.quantity, 2.5)
    assert.equal(draft.preparation.ingredients[0].quantity, 3)
    assert.equal(draft.preparation.prep_items[0].quantity, 4)
    await vue.nextTick()
    assert.equal(f.nodes('fieldset')[0].props.disabled, false)
    f.unmount()
    h.scope.stop()
  }
})
test('native Recipe form rejects blank and non-finite quantities before any command', async () => {
  for (const quantity of ['', ' ', 'no', Infinity, 0]) {
    const h = context(),
      f = mountForm(h)
    f.api.name.value = 'Draft'
    f.api.preparation.value.yield.quantity = quantity
    await f.api.save()
    assert.equal(h.calls.length, 0)
    assert.match(f.api.message.value, /positive quantity/)
    f.unmount()
    h.scope.stop()
  }
})
test('local Recipe draft changes cancel credentials and suppress stale post-dispatch save effects', async () => {
  for (const stage of ['seed', 'token', 'response'])
    for (const failed of [false, true]) {
      const h = context(),
        seed = deferred()
      if (stage === 'seed') {
        h.deps.useTranslationSeed = () => ({
          seedTranslations: (input) => {
            h.seeds.push(input)
            return seed.promise
          },
        })
        h.factories()
      }
      const f = mountForm(h, stage === 'seed' ? null : existing())
      f.api.name.value = 'Submitted'
      const flight = f.api.save()
      h.auth.resolve(h.user)
      await drain()
      if (stage === 'response') {
        h.token.resolve('token')
        await drain()
        assert.equal(h.calls.length, 1)
      }
      f.api.name.value = 'Replacement'
      seed.resolve({
        sourceLanguage: 'en',
        text: { en: 'Submitted' },
        failedLanguages: [],
      })
      h.token.resolve('token')
      if (failed) {
        h.response.promise.catch(() => {})
        h.response.reject(new Error('Obsolete failure'))
      } else h.response.resolve({ id: 'recipe' })
      await flight
      assert.equal(h.calls.length, stage === 'response' ? 1 : 0)
      if (stage === 'seed') assert.equal(h.seeds.length, 1)
      assert.deepEqual(f.saved, [])
      assert.equal(f.api.name.value, 'Replacement')
      assert.equal(f.api.message.value, '')
      f.unmount()
      h.scope.stop()
    }
})
test('nested Prep creation locks Recipe save and keeps its saved reference as a separate unsaved edit', async () => {
  const h = context(),
    f = mountForm(h, existing())
  f.api.newPrepName.value = 'Sauce'
  f.api.newPrepQuantity.value = '2'
  f.api.newPrepUnit.value = 'g'
  const flight = f.api.createPrep()
  await vue.nextTick()
  assert.equal(f.nodes('fieldset')[0].props.disabled, true)
  await f.api.save()
  h.auth.resolve(h.user)
  h.token.resolve('token')
  h.response.resolve({ id: 'sauce' })
  await flight
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].url, '/api/workspace/kitchen/prep-items')
  assert.equal(h.calls[0].options.body.draft.yield.quantity, 2)
  assert.equal(f.api.preparation.value.prep_items[0].prep_item_id, 'sauce')
  assert.equal(f.api.preparation.value.prep_items[0].quantity, 2)
  assert.deepEqual(f.saved, [])
  assert.equal(f.api.creatingPrep.value, false)
  f.unmount()
  h.scope.stop()
})
test('changed Prep drafts cancel credentials and cannot append or clear another local draft after dispatch', async () => {
  for (const stage of ['token', 'response']) {
    const h = context(),
      f = mountForm(h, existing())
    f.api.newPrepName.value = 'Submitted'
    const flight = f.api.createPrep()
    await drain()
    h.auth.resolve(h.user)
    await drain()
    if (stage === 'response') {
      h.token.resolve('token')
      await drain()
      assert.equal(h.calls.length, 1)
    }
    f.api.newPrepName.value = 'Replacement'
    h.token.resolve('token')
    h.response.resolve({ id: 'sauce' })
    await flight
    assert.equal(h.calls.length, stage === 'token' ? 0 : 1)
    assert.equal(f.api.preparation.value.prep_items.length, 0)
    assert.equal(f.api.newPrepName.value, 'Replacement')
    assert.equal(f.api.creatingPrep.value, false)
    f.unmount()
    h.scope.stop()
  }
})
test('Recipe form hydrates clean live changes, preserves dirty drafts, and resets on actor/record intent changes', async () => {
  const h = context(),
    f = mountForm(h, existing())
  f.props.recipe = { ...existing(), name: 'Fresh' }
  await vue.nextTick()
  assert.equal(f.api.name.value, 'Fresh')
  f.api.name.value = 'Local'
  f.props.recipe = { ...existing(), name: 'External' }
  await vue.nextTick()
  assert.equal(f.api.name.value, 'Local')
  h.change('account')
  assert.equal(f.api.name.value, 'External')
  f.api.name.value = 'Old record'
  f.props.recipe = { ...existing(), id: 'next', name: 'Next' }
  await vue.nextTick()
  assert.equal(f.api.name.value, 'Next')
  f.unmount()
  h.scope.stop()
})
test('Recipe form suppresses disposed save and Prep completions', async () => {
  for (const action of ['save', 'createPrep']) {
    const h = context(),
      f = mountForm(h, existing())
    f.api.newPrepName.value = 'Prep'
    const flight = f.api[action]()
    h.auth.resolve(h.user)
    h.token.resolve('token')
    await drain()
    assert.equal(h.calls.length, 1)
    f.unmount()
    h.response.resolve({ id: action === 'save' ? 'recipe' : 'prep' })
    await flight
    assert.deepEqual(f.saved, [])
    h.scope.stop()
  }
})

test('Recipe form retains a committed save completion through its own live read refresh', async () => {
  const h = context(),
    f = mountForm(h, existing())
  f.api.name.value = 'Submitted'
  const flight = f.api.save()
  h.auth.resolve(h.user)
  h.token.resolve('token')
  await drain()
  assert.equal(h.calls.length, 1)
  f.props.canWrite = false
  f.props.recipe = { ...existing(), name: 'Submitted' }
  await vue.nextTick()
  assert.equal(f.api.name.value, 'Submitted')
  assert.equal(f.nodes('fieldset')[0].props.disabled, true)
  h.response.resolve({ id: 'recipe' })
  await flight
  assert.deepEqual(f.saved, ['recipe'])
  f.unmount()
  h.scope.stop()
})

test('Recipe and Prep commands reject unsettled membership before starting preparation or credentials', async () => {
  for (const kind of ['recipe', 'prep'])
    for (const blocked of ['pending', 'error', 'outcome', 'access']) {
      const h = context(),
        member = h.deps.useUserSession(),
        access = h.deps.useKitchenAccess()
      if (blocked === 'pending') member.appPending.value = true
      if (blocked === 'error')
        member.appError.value = new Error('Member read failed')
      if (blocked === 'outcome') member.appOutcome.value = 'missing'
      if (blocked === 'access') access.outcome.value = 'pending'
      const api = h.scope.run(() =>
        kind === 'recipe'
          ? h.deps.useRecipeCreate()
          : h.deps.useKitchenPrepItemCreate()
      )
      const flight =
        kind === 'recipe'
          ? api.createRecipe({ name: 'Draft' }, {}, { translate: false })
          : api.createPrepItem({ name: 'Prep' }, {}, { translate: false })
      await assert.rejects(flight, /changed/)
      assert.equal(h.seeds.length, 0)
      assert.equal(h.calls.length, 0)
      h.scope.stop()
    }
})

test('native Recipe editor distinguishes failed and pending ingredient reads from a truly empty Kitchen', async () => {
  const h = context(),
    f = mountForm(h)
  const text = (node) =>
    [node.text || '', ...(node.children || []).map(text)].join('')
  const hasEmptyHelp = () =>
    f
      .nodes('p')
      .some((node) =>
        text(node).includes('Add ingredients to this kitchen first.')
      )
  assert.equal(hasEmptyHelp(), true)
  f.ingredientRead.error.value = new Error('Ingredient read failed')
  await vue.nextTick()
  assert.equal(hasEmptyHelp(), false)
  f.ingredientRead.error.value = null
  f.ingredientRead.pending.value = true
  await vue.nextTick()
  assert.equal(hasEmptyHelp(), false)
  f.ingredientRead.pending.value = false
  await vue.nextTick()
  assert.equal(hasEmptyHelp(), true)
  f.unmount()
  h.scope.stop()
})

test('composed Recipe sections write through to the single parent draft', async () => {
  const h = context(),
    f = mountForm(h, existing())
  const name = f
    .nodes('input')
    .find((node) => node.props['aria-label'] === 'Recipe name')
  name.props['onUpdate:modelValue']('Changed through section')
  const quantity = f
    .nodes('input')
    .find((node) => node.props['aria-label'] === 'Yield quantity')
  quantity.props['onUpdate:modelValue']('3')
  const method = f
    .nodes('textarea')
    .find((node) => node.props['aria-label'] === 'Method')
  method.props['onUpdate:modelValue']('Mix\nBake')
  assert.equal(f.api.name.value, 'Changed through section')
  assert.equal(f.api.preparation.value.yield.quantity, '3')
  assert.equal(f.api.method.value, 'Mix\nBake')
  assert.deepEqual(f.readCounts, { ingredients: 1, prepItems: 1 })
  assert.equal(h.calls.length, 0)
  f.unmount()
  h.scope.stop()
})

test('Prep creation failure belongs to the Prep editor and preserves the Recipe draft', async () => {
  const h = context(),
    f = mountForm(h, existing())
  f.api.name.value = 'Unsaved recipe'
  await vue.nextTick()
  f.api.newPrepName.value = 'Sauce'
  const flight = f.api.createPrep()
  h.auth.resolve(h.user)
  h.token.resolve('token')
  await drain()
  h.response.reject(new Error('Prep creation failed'))
  await flight
  assert.equal(f.prepApi.message.value, 'Prep creation failed')
  assert.equal(f.api.message.value, '')
  assert.equal(f.api.name.value, 'Unsaved recipe')
  assert.deepEqual(f.api.preparation.value.prep_items, [])
  assert.equal(f.api.creatingPrep.value, false)
  assert.deepEqual(f.saved, [])
  f.unmount()
  h.scope.stop()
})
