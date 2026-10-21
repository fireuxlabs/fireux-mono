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
const specification = load(
  '../../runtime/kitchen/utils/dish-specification.ts',
  '({emptyDishSpecification,validateDishSpecification})',
  {
    isFirestoreDocumentId,
    requireFirestoreDocumentId(value) {
      if (!isFirestoreDocumentId(value)) throw Error('Invalid document id')
      return value
    },
  }
)
const dishCategories = load(
  '../../runtime/kitchen/models/dish.model.ts',
  'dishCategories',
  {}
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
      fullPath: '/workspace/kitchen/food-and-drink/items/dish',
    })
  const access = { ids: vue.ref(['kitchen']), outcome: vue.ref('ready') },
    calls = [],
    seeds = []
  const deps = {
    ...vue,
    useCommandScope,
    File,
    FormData,
    useWorkspace: () => ({ selectedId }),
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
      route.fullPath = '/workspace/kitchen/food-and-drink/items/dish'
    }
    if (kind === 'dispose') scope.stop()
  }
  const factories = () => {
    deps.useDishEditorScope = load(
      '../../runtime/kitchen/composables/dish/useDishEditorScope.ts',
      'useDishEditorScope',
      deps
    )
    deps.useDishMutation = load(
      '../../runtime/kitchen/composables/dish/useDishMutation.ts',
      'useDishMutation',
      deps
    )
    for (const name of [
      'useDishCreate',
      'useDishUpdate',
      'useDishDelete',
      'useDishImageUpload',
    ])
      deps[name] = load(
        `../../runtime/kitchen/composables/dish/${name}.ts`,
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
    currentUser,
    selectedId,
    route,
    appPending,
    appError,
    appOutcome,
    access,
  }
}
function mount(h, component, exposed, extra = {}) {
  const identity = {
      dish: vue.ref(existing()),
      dishId: vue.ref('dish'),
      kitchenId: h.selectedId,
      storageKitchenId: vue.ref('kitchen'),
      canWrite: vue.ref(true),
      rootCollection: vue.ref('kitchens'),
      databaseId: vue.ref('database'),
      catalogue: vue.reactive({
        itemKind: 'food',
        singular: 'dish',
        plural: 'dishes',
        title: 'Dishes',
      }),
    },
    readOnly = vue.ref(false)
  const props = vue.reactive({}),
    saved = [],
    notices = []
  const deps = {
    ...h.deps,
    ...specification,
    dishCategories,
    useAuth: () => ({ currentUser: h.currentUser }),
    useKitchenWorkspaceDish: () => identity,
    useKitchenDishesContext: () => ({
      ...identity,
      dishes: vue.ref([identity.dish.value]),
      readOnly,
    }),
    useKitchenWorkspaceMenuSection: () => ({
      ...identity,
      menuId: vue.ref('menu'),
      sectionId: vue.ref('section'),
      dishes: vue.ref([]),
      itemRows: vue.ref([]),
      createItem: async (input) => {
        h.calls.push({ placement: input })
      },
    }),
    useToastify: () => ({ add: (notice) => notices.push(notice) }),
    URL: { createObjectURL: () => 'blob:preview', revokeObjectURL() {} },
    window: { confirm: () => true },
    ...extra,
    useKitchenIngredients: () => ({
      ingredients: vue.ref([]),
      pending: vue.ref(false),
      error: vue.ref(null),
    }),
    useKitchenRecipeCollection: () => ({
      recipes: vue.ref([]),
      error: vue.ref(null),
    }),
    useKitchenPrepItems: () => ({
      prepItems: vue.ref([]),
      error: vue.ref(null),
    }),
  }
  const content = readFileSync(
    new URL(
      `../../runtime/kitchen/components/${component}.vue`,
      import.meta.url
    ),
    'utf8'
  ).replace('</script>', `\ndefineExpose(${exposed})\n</script>`)
  const { descriptor } = parse(content),
    script = compileScript(descriptor, {
      id: 'dish-editor',
      inlineTemplate: true,
    }),
    exports = {}
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
      id === '#imports' ||
      /useDish|useKitchen|useToastify|useAuth|FireUXConfig|dish-specification|dish.model/.test(
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
  const app = renderer.createApp({
    setup: () => () =>
      vue.h(exports.default, { ...props, onSaved: (id) => saved.push(id) }),
  })
  const warnings = []
  app.config.warnHandler = (message) => warnings.push(message)
  for (const name of [
    'UFormField',
    'MoleculesStateCard',
    'UCard',
    'MoleculesCopyError',
    'KitchenFoodAndDrinkItemsDescriptionAssistant',
  ])
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
    ['USwitch', 'input'],
    ['UAvatar', 'img'],
    ['MoleculesFormsEditableImagePicker', 'button'],
    ['MoleculesFormsEditableSimpleField', 'input'],
    ['NuxtLink', 'a'],
  ])
    app.component(name, {
      render() {
        return vue.h(type, this.$attrs, this.$slots.default?.())
      },
    })
  const root = { children: [] }
  app.mount(root)
  const api = app._instance.subTree.component.exposed
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
    identity,
    readOnly,
    notices,
    props,
    saved,
    nodes,
    unmount: () => {
      app.unmount()
      assert.deepEqual(warnings, [])
    },
  }
}
const existing = () => ({
  id: 'dish',
  name: 'Original',
  description: 'Notes',
  kitchen_id: 'kitchen',
  item_kind: 'food',
  spec: specification.emptyDishSpecification(),
})
const imageResponse = () => ({
  ok: true,
  dish_id: 'dish',
  image: 'https://example.com/dish.webp',
  object_path: 'kitchens/kitchen/dishes/dish/image/revision',
})
const finish = async (h) => {
  h.auth.resolve(h.user)
  h.token.resolve('token')
  await drain()
}

test('Dish commands capture member/access/local intent before credentials and preserve committed results', async () => {
  for (const method of ['POST', 'PATCH', 'DELETE'])
    for (const stage of ['auth', 'token', 'response'])
      for (const changed of [
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
      ]) {
        const h = context(),
          local = vue.ref('original'),
          api = h.scope.run(() => h.deps.useDishMutation([local])),
          flight = api.mutate(
            method,
            method === 'POST'
              ? { draft: { name: 'Dish' } }
              : { dishId: 'dish', changes: { name: 'Dish' } }
          )
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
          local.value = 'original'
        } else h.change(changed)
        h.auth.resolve(h.user)
        h.token.resolve('token')
        h.response.resolve({ id: 'dish' })
        if (changed !== 'stable' && stage !== 'response') {
          await assert.rejects(flight, /changed/)
          assert.equal(h.calls.length, 0)
        } else assert.equal((await flight).id, 'dish')
        h.scope.stop()
      }
})
test('Dish adapters validate safe string identities and exact update/delete response targets', async () => {
  for (const method of ['POST', 'PATCH', 'DELETE'])
    for (const id of [
      null,
      8,
      '',
      ' ',
      ' dish ',
      'a/b',
      '..',
      '__reserved__',
      ...(method === 'POST' ? [] : ['other']),
    ]) {
      const h = context(),
        api = h.scope.run(() => h.deps.useDishMutation()),
        flight = api.mutate(
          method,
          method === 'POST' ? { draft: { name: 'Dish' } } : { dishId: 'dish' }
        )
      await finish(h)
      h.response.resolve({ id })
      await assert.rejects(flight, /response did not identify/)
      h.scope.stop()
    }
})
test('Image transport snapshots its file, rejects obsolete credentials, and retains dispatched success', async () => {
  for (const stage of ['token', 'response'])
    for (const changed of [
      'stable',
      'account',
      'app',
      'pending',
      'access',
      'kitchen',
      'route',
      'local',
      'dispose',
    ]) {
      const h = context(),
        local = vue.ref('original'),
        api = h.scope.run(() => h.deps.useDishImageUpload([local])),
        input = {
          dishId: 'dish',
          kitchenId: 'kitchen',
          file: new File(['original'], 'original.png'),
        },
        flight = api.uploadDishImage(input)
      input.file = new File(['replacement'], 'replacement.png')
      input.dishId = 'other'
      if (stage === 'response') {
        h.token.resolve('token')
        await drain()
        assert.equal(h.calls.length, 1)
        assert.equal(h.calls[0].options.body.get('file').name, 'original.png')
      }
      if (changed === 'local') {
        local.value = 'other'
        local.value = 'original'
      } else h.change(changed)
      h.token.resolve('token')
      h.response.resolve(imageResponse())
      if (stage === 'token' && changed !== 'stable') {
        await assert.rejects(flight, /changed/)
        assert.equal(h.calls.length, 0)
      } else assert.equal((await flight).dish_id, 'dish')
      h.scope.stop()
    }
})
test('Native creation locks food/drink inputs and invalidates changed text/image intent during token waits', async () => {
  for (const kind of ['food', 'drink'])
    for (const changed of ['stable', 'name', 'image']) {
      const h = context(),
        f = mount(
          h,
          'FoodAndDrink/Items/Create/Index',
          '{addDish,name,description,imageFile,saving,message}'
        )
      f.identity.catalogue.itemKind = kind
      f.api.name.value = 'Submitted'
      const flight = f.api.addDish()
      await vue.nextTick()
      assert.equal(f.nodes('input')[0].props.disabled, true)
      await f.api.addDish()
      h.auth.resolve(h.user)
      await drain()
      if (changed === 'name') f.api.name.value = 'Replacement'
      if (changed === 'image')
        f.api.imageFile.value = new File(['changed'], 'changed.png')
      h.token.resolve('token')
      h.response.resolve({ id: 'dish' })
      await flight
      assert.equal(h.calls.length, changed === 'stable' ? 1 : 0)
      if (changed === 'stable') {
        assert.equal(h.calls[0].options.body.draft.item_kind, kind)
        assert.equal(f.api.name.value, '')
        assert.match(f.api.message.value, /Created Submitted/)
      } else {
        assert.equal(f.api.message.value, '')
        assert.equal(
          f.api.name.value,
          changed === 'name' ? 'Replacement' : 'Submitted'
        )
      }
      f.unmount()
      h.scope.stop()
    }
})
test('Creation reports saved Dish with failed image and suppresses obsolete follow-on upload', async () => {
  for (const changed of [false, true]) {
    const h = context(),
      uploads = [],
      f = mount(h, 'FoodAndDrink/Items/Create/Index', '{addDish,name,imageFile,message}', {
        useDishImageUpload: () => ({
          uploadDishImage: async (input) => {
            uploads.push(input)
            throw Error('Upload failed')
          },
        }),
      })
    f.api.name.value = 'Dish'
    f.api.imageFile.value = new File(['original'], 'original.png')
    const flight = f.api.addDish()
    await finish(h)
    if (changed) f.api.name.value = 'Replacement'
    h.response.resolve({ id: 'dish' })
    await flight
    assert.equal(uploads.length, changed ? 0 : 1)
    if (changed) {
      assert.equal(f.api.name.value, 'Replacement')
      assert.equal(f.api.message.value, '')
    } else
      assert.match(
        f.api.message.value,
        /Created Dish, but its image was not saved/
      )
    f.unmount()
    h.scope.stop()
  }
})
test('Specification Save and nested Prep cannot overlap and explicitly convert UInput numeric text', async () => {
  for (const action of ['save', 'createPrep']) {
    const h = context(),
      f = mount(
        h,
        'FoodAndDrink/Items/Spec',
        '{toggle,save,createPrep,draft,assembly,editing,saving,creating,newPrep,error}'
      )
    f.api.toggle()
    f.api.draft.value.portion = '2'
    f.api.draft.value.ingredients = [
      { ingredient_id: 'carrot', quantity: '3', unit: 'g', note: '' },
    ]
    f.api.newPrep.value = {
      ...f.api.newPrep.value,
      name: 'Sauce',
      quantity: '4',
    }
    const flight = f.api[action]()
    await vue.nextTick()
    assert.equal(f.nodes('fieldset')[0].props.disabled, true)
    await f.api[action === 'save' ? 'createPrep' : 'save']()
    await finish(h)
    h.response.resolve({ id: action === 'save' ? 'dish' : 'sauce' })
    await flight
    assert.equal(h.calls.length, 1)
    if (action === 'save') {
      assert.equal(h.calls[0].options.body.changes.spec.portion, 2)
      assert.equal(
        h.calls[0].options.body.changes.spec.ingredients[0].quantity,
        3
      )
    } else {
      assert.equal(h.calls[0].options.body.draft.yield.quantity, 4)
      assert.equal(f.api.editing.value, true)
    }
    f.unmount()
    h.scope.stop()
  }
})
test('Specification changed draft or closed/reopened editor cancels credentials without erasing replacement draft', async () => {
  for (const changed of ['draft', 'reopen', 'prep'])
    for (const stage of ['token', 'response']) {
      const h = context(),
        f = mount(
          h,
          'FoodAndDrink/Items/Spec',
          '{toggle,save,createPrep,draft,assembly,editing,saving,creating,newPrep,error}'
        )
      f.api.toggle()
      f.api.newPrep.value.name = 'Original'
      const flight = f.api[changed === 'prep' ? 'createPrep' : 'save']()
      h.auth.resolve(h.user)
      await drain()
      if (stage === 'response') {
        h.token.resolve('token')
        await drain()
        assert.equal(h.calls.length, 1)
      }
      if (changed === 'reopen') {
        f.api.editing.value = false
        f.api.toggle()
        f.api.draft.value.station = 'Replacement'
      } else if (changed === 'prep') f.api.newPrep.value.name = 'Replacement'
      else f.api.draft.value.station = 'Replacement'
      h.token.resolve('token')
      h.response.resolve({ id: changed === 'prep' ? 'prep' : 'dish' })
      await flight
      assert.equal(h.calls.length, stage === 'response' ? 1 : 0)
      assert.equal(f.api.editing.value, true)
      assert.equal(f.api.error.value, '')
      if (changed === 'prep')
        assert.equal(f.api.newPrep.value.name, 'Replacement')
      else assert.equal(f.api.draft.value.station, 'Replacement')
      f.unmount()
      h.scope.stop()
    }
})
test('Specification clean same-ID live updates hydrate while dirty drafts and own pending saves survive', async () => {
  const h = context(),
    f = mount(h, 'FoodAndDrink/Items/Spec', '{toggle,save,draft,assembly,editing,error}')
  f.api.toggle()
  f.identity.dish.value = {
    ...existing(),
    spec: { ...specification.emptyDishSpecification(), station: 'Fresh' },
  }
  await vue.nextTick()
  assert.equal(f.api.draft.value.station, 'Fresh')
  f.api.draft.value.station = 'Local'
  f.identity.dish.value = {
    ...existing(),
    spec: { ...specification.emptyDishSpecification(), station: 'External' },
  }
  await vue.nextTick()
  assert.equal(f.api.draft.value.station, 'Local')
  const flight = f.api.save()
  await finish(h)
  f.identity.dish.value = null
  f.identity.canWrite.value = false
  await vue.nextTick()
  assert.equal(f.api.editing.value, true)
  assert.equal(f.nodes('fieldset')[0].props.disabled, true)
  h.response.resolve({ id: 'dish' })
  await flight
  assert.equal(f.api.editing.value, false)
  f.unmount()
  h.scope.stop()
})
test('Specification rejects blank/non-finite quantities before a command and suppresses disposed completion', async () => {
  for (const quantity of ['', Infinity, 0]) {
    const h = context(),
      f = mount(h, 'FoodAndDrink/Items/Spec', '{toggle,save,draft,error}')
    f.api.toggle()
    f.api.draft.value.portion = quantity
    await f.api.save()
    assert.equal(h.calls.length, 0)
    assert.match(f.api.error.value, /positive quantity/)
    f.unmount()
    h.scope.stop()
  }
  const h = context(),
    f = mount(h, 'FoodAndDrink/Items/Spec', '{toggle,save}')
  f.api.toggle()
  const flight = f.api.save()
  await finish(h)
  f.unmount()
  h.response.resolve({ id: 'dish' })
  await flight
  h.scope.stop()
})
test('Identity fields pass real local completion predicates through credentials and lock other controls', async () => {
  const h = context(),
    f = mount(h, 'FoodAndDrink/Items/Edit/Index', '{handleName,handleImageUpload,fieldSaving}')
  const draft = vue.ref('Submitted'),
    capture = h.scope.run(() => useCommandScope([draft])),
    isCurrent = capture(),
    flight = f.api.handleName('Submitted', isCurrent)
  await vue.nextTick()
  assert.equal(f.nodes('select')[0].props.disabled, true)
  h.auth.resolve(h.user)
  await drain()
  draft.value = 'Replacement'
  h.token.resolve('token')
  h.response.resolve({ id: 'dish' })
  await flight
  assert.equal(h.calls.length, 0)
  assert.deepEqual(f.notices, [])
  assert.equal(f.api.fieldSaving.value, false)
  f.unmount()
  h.scope.stop()
})
test('Drink description assistance and Menu add-by-name retain changed local drafts and stop obsolete follow-on effects', async () => {
  for (const component of [
    'FoodAndDrink/Items/DescriptionAssistant',
    'FoodAndDrink/Menus/Items/Add/ByName',
  ]) {
    const h = context(),
      f = mount(
        h,
        component,
        component.startsWith('FoodAndDrink/Items')
          ? '{notes,proposal,proposeDescription,approveDescription}'
          : '{names,addNames,error}'
      )
    if (component.startsWith('FoodAndDrink/Items')) {
      f.identity.catalogue.itemKind = 'drink'
      f.api.notes.value = 'Original'
      const flight = f.api.proposeDescription()
      f.api.notes.value = 'Replacement'
      h.token.resolve('token')
      h.response.resolve({ proposal: 'Old' })
      await flight
      assert.equal(h.calls.length, 0)
      assert.equal(f.api.notes.value, 'Replacement')
      assert.equal(f.api.proposal.value, '')
    } else {
      f.api.names.value = 'Original'
      const flight = f.api.addNames()
      await finish(h)
      f.api.names.value = 'Replacement'
      h.response.resolve({ id: 'dish' })
      await flight
      assert.equal(h.calls.length, 1)
      assert.equal(f.api.names.value, 'Replacement')
      assert.equal(f.api.error.value, '')
    }
    f.unmount()
    h.scope.stop()
  }
})

test('Identity replacement field action keeps its busy state when an older token finishes', async () => {
  const h = context(),
    firstToken = deferred(),
    secondToken = deferred()
  let tokens = 0
  h.deps.useRequireUser = async () => ({
    uid: 'actor',
    getIdToken: () =>
      ++tokens === 1 ? firstToken.promise : secondToken.promise,
  })
  h.factories()
  const f = mount(h, 'FoodAndDrink/Items/Edit/Index', '{handleName,fieldSaving}'),
    draft = vue.ref('First'),
    capture = h.scope.run(() => useCommandScope([draft]))
  const first = f.api.handleName('First', capture())
  await drain()
  draft.value = 'Second'
  const second = f.api.handleName('Second', capture())
  await drain()
  assert.equal(f.api.fieldSaving.value, true)
  firstToken.resolve('old')
  await first
  assert.equal(f.api.fieldSaving.value, true)
  assert.equal(h.calls.length, 0)
  secondToken.resolve('new')
  await drain()
  h.response.resolve({ id: 'dish' })
  await second
  assert.equal(h.calls.length, 1)
  assert.equal(f.api.fieldSaving.value, false)
  assert.equal(f.notices.length, 1)
  f.unmount()
  h.scope.stop()
})
test('Categories validate their chosen field and ignore changed search intent during credentials', async () => {
  for (const changed of ['invalid', 'query']) {
    const h = context(),
      f = mount(h, 'FoodAndDrink/Items/Categories', '{save,query,error,busy,saved}'),
      flight = f.api.save('dish', changed === 'invalid' ? 'unknown' : 'main')
    if (changed === 'query') f.api.query.value = 'Another row'
    await finish(h)
    h.response.resolve({ id: 'dish' })
    await flight
    assert.equal(h.calls.length, 0)
    if (changed === 'invalid')
      assert.match(f.api.error.value, /valid dish category/)
    else {
      assert.equal(f.api.query.value, 'Another row')
      assert.equal(f.api.error.value, '')
    }
    f.unmount()
    h.scope.stop()
  }
})
test('Drink approval keeps replacement proposal and blocks its obsolete token dispatch', async () => {
  const h = context(),
    f = mount(
      h,
      'FoodAndDrink/Items/DescriptionAssistant',
      '{notes,proposal,approveDescription,saving}'
    )
  f.identity.catalogue.itemKind = 'drink'
  f.api.notes.value = 'Notes'
  f.api.proposal.value = 'Original'
  const flight = f.api.approveDescription()
  h.auth.resolve(h.user)
  await drain()
  f.api.proposal.value = 'Replacement'
  h.token.resolve('token')
  h.response.resolve({ id: 'dish' })
  await flight
  assert.equal(h.calls.length, 0)
  assert.equal(f.api.proposal.value, 'Replacement')
  assert.equal(f.api.notes.value, 'Notes')
  assert.equal(f.api.saving.value, false)
  assert.deepEqual(f.notices, [])
  f.unmount()
  h.scope.stop()
})
