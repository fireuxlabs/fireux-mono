import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'
import { parse, compileScript } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'
import ts from 'typescript'

const runtime = new URL('../runtime/', import.meta.url)
function load(path, names, dependencies = {}) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + `; return {${names}}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const currency = load('utils/currency-display.ts', 'formatCurrencyAmount')
function component(path, dependencies = {}) {
  const filename = new URL(path, runtime)
  const { descriptor } = parse(readFileSync(filename, 'utf8'), {
    filename: filename.pathname,
  })
  const script = compileScript(descriptor, { id: path, inlineTemplate: true })
  const code = ts.transpileModule(script.content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports'])((name) => {
    if (name === 'vue') return Vue
    assert.ok(dependencies[name], name)
    return dependencies[name]
  }, exports)
  return exports.default
}

test('zero is a visible amount while missing and invalid terms remain absent', () => {
  const format = currency.formatCurrencyAmount
  assert.equal(format(0, { currencyCode: 'CHF', format: 'code' }), '0 CHF')
  assert.equal(format(0, { currencyCode: 'CHF', format: 'dash' }), '0.-')
  assert.equal(format(0, { showCurrency: false }), '0')
  for (const value of [undefined, null, '', '0', NaN, Infinity, -1])
    assert.equal(format(value), '')
  assert.equal(
    format(12.5, { currencyCode: 'CHF', format: 'code' }),
    '12.50 CHF'
  )
})

const Item = component('menu/components/Detail/Item.vue', {
  '../../../utils/currency-display': currency,
})
const item = (changes = {}) => ({
  id: 'free',
  dishId: 'dish',
  itemKind: 'food',
  name: 'Free item',
  description: 'Available without a photograph',
  imageUrl: '/item.jpg',
  price: 0,
  priceLabel: '',
  priceOptions: [],
  addOns: [],
  ...changes,
})
async function renderItem(changes = {}) {
  const app = Vue.createSSRApp({
    render: () =>
      Vue.h(Item, {
        item: item(),
        accessibilityId: 'item',
        currencyCode: 'CHF',
        currencyFormat: 'code',
        showCurrency: true,
        availableOptionsLabel: 'Options',
        optionalExtrasLabel: 'Extras',
        ...changes,
      }),
  })
  app.component('MenuDetailMealDeal', { render: () => null })
  return renderToString(app)
}
test('normal zero, free variants and price choices render without a promotion marker', async () => {
  const plain = await renderItem()
  assert.match(plain, /0 CHF/)
  assert.match(plain, /Free item/)
  const variants = await renderItem({
    item: item({
      priceOptions: [
        { id: 'small', label: 'Small', price: 0 },
        { id: 'large', label: 'Large', price: 2 },
      ],
    }),
  })
  assert.match(variants, /Small/)
  assert.match(variants, /0 CHF/)
  assert.match(variants, /2 CHF/)
  const pricedOptions = await renderItem({
    item: item({
      priceOptions: [
        { id: 'small', label: 'Small', price: 5 },
        { id: 'large', label: 'Large', price: 7 },
      ],
    }),
  })
  assert.match(pricedOptions, /<span>5 CHF<\/span>/)
  assert.doesNotMatch(pricedOptions, /0 CHF/)
})
test('both customer styles keep complete text and prices with or without an image', async () => {
  assert.doesNotMatch(await renderItem(), /<img/)
  assert.match(await renderItem({ showItemImages: true }), /src="\/item.jpg"/)
  for (const showItemImages of [false, true]) {
    const html = await renderItem({
      showItemImages,
      item: item({ imageUrl: '' }),
    })
    assert.doesNotMatch(html, /<img/)
    assert.match(html, /Free item/)
    assert.match(html, /0 CHF/)
  }
})

function mount(Component, props) {
  const host = Vue.createRenderer({
    createElement: (tag) => ({ tag, props: {}, children: [] }),
    createText: (text) => ({ text }),
    createComment: (text) => ({ comment: text }),
    setElementText: (node, text) => {
      node.text = text
    },
    setText: (node, text) => {
      node.text = text
    },
    patchProp: (node, key, _old, value) => {
      node.props[key] = value
    },
    insert(node, parent, anchor) {
      node.parent = parent
      const index = anchor ? parent.children.indexOf(anchor) : -1
      if (index < 0) parent.children.push(node)
      else parent.children.splice(index, 0, node)
    },
    remove(node) {
      node.parent.children.splice(node.parent.children.indexOf(node), 1)
    },
    parentNode: (node) => node.parent,
    nextSibling: () => null,
  })
  const root = { children: [] }
  const app = host.createApp({ render: () => Vue.h(Component, props) })
  app.component('NuxtLink', {
    render() {
      return Vue.h('a', this.$slots.default?.())
    },
  })
  app.component('UIcon', { render: () => Vue.h('span') })
  app.component('MenuDetailMealDeal', { render: () => null })
  app.mount(root)
  const find = (tag, node = root) =>
    node.tag === tag
      ? node
      : (node.children || []).map((child) => find(tag, child)).find(Boolean)
  return { app, find }
}
test('failed customer and operator images collapse safely and a changed URL can recover', async () => {
  const SelectionImage = component('menu/components/Selection/Image.vue')
  const Cell = component('kitchen/components/FoodAndDrink/Items/Cards/Cell.vue')
  for (const [Component, props, change] of [
    [
      SelectionImage,
      Vue.reactive({ enabled: true, imageUrl: '/bad.jpg' }),
      (p) => (p.imageUrl = '/new.jpg'),
    ],
    [
      Cell,
      Vue.reactive({
        id: 'dish',
        title: 'Free item',
        priceLabel: '0 CHF',
        imageUrl: '/bad.jpg',
      }),
      (p) => (p.imageUrl = '/new.jpg'),
    ],
    [
      Item,
      Vue.reactive({
        item: item({ imageUrl: '/bad.jpg' }),
        showItemImages: true,
        accessibilityId: 'x',
        currencyCode: 'CHF',
        currencyFormat: 'code',
        showCurrency: true,
        availableOptionsLabel: 'Options',
        optionalExtrasLabel: 'Extras',
      }),
      (p) => (p.item = item({ imageUrl: '/new.jpg' })),
    ],
  ]) {
    const mounted = mount(Component, props)
    assert.equal(mounted.find('img').props.src, '/bad.jpg')
    mounted.find('img').props.onError()
    await Vue.nextTick()
    assert.equal(mounted.find('img'), undefined)
    change(props)
    await Vue.nextTick()
    assert.equal(mounted.find('img').props.src, '/new.jpg')
    mounted.app.unmount()
  }
})

test('image preference validation is strict and does not admit pricing or Item writes', () => {
  const { parseKitchenUpdate } = load(
    'kitchen/server/identity/update-input.ts',
    'parseKitchenUpdate',
    {
      createError: (value) => new Error(value.statusMessage),
      validatePublicSlug: () => ({}),
    }
  )
  for (const enabled of [true, false])
    assert.deepEqual(parseKitchenUpdate({ 'services.item_images': enabled }), {
      'services.item_images': enabled,
    })
  for (const value of ['true', 1, null, {}, []])
    assert.throws(
      () => parseKitchenUpdate({ 'services.item_images': value }),
      /boolean/
    )
  assert.throws(() => parseKitchenUpdate({ price: 0 }), /unsupported/)
})

test('customer image preference follows the existing Kitchen presentation projection', () => {
  const { readKitchenPresentation } = load(
    'kitchen/utils/kitchen-presentation.ts',
    'readKitchenPresentation',
    {
      readPlacePresentation: () => ({}),
      readPlaceCurrencyCode: () => 'CHF',
      readKitchenThemePalette: () => null,
    }
  )
  const { menuPayloadPresentation } = load(
    'menu/server/payload/presentation.ts',
    'menuPayloadPresentation',
    {
      menuSourceFromData: () => ({ kitchen_name: 'Fixture venue' }),
      resolveEffectiveMenuTheme: () => ({ theme: {}, themeSource: 'default' }),
    }
  )
  for (const [services, expected] of [
    [undefined, false],
    [{ item_images: true }, true],
    [{ item_images: false }, false],
    [{ item_images: 'true' }, false],
    [[], false],
  ]) {
    const before = structuredClone(services)
    const kitchen = readKitchenPresentation({ services })
    assert.equal(kitchen.showItemImages, expected)
    assert.equal(
      menuPayloadPresentation({}, kitchen, true).showItemImages,
      expected
    )
    assert.deepEqual(services, before)
  }
})

test('closing an editor during credentials cannot dispatch its prepared Kitchen preference', async () => {
  for (const stage of ['account', 'token']) {
    let release
    const waiting = new Promise((resolve) => {
      release = resolve
    })
    let current = true
    const calls = []
    const user = {
      uid: 'operator',
      getIdToken: () => (stage === 'token' ? waiting : 'token'),
    }
    const { useKitchenUpdate } = load(
      'kitchen/composables/firestore/useKitchenUpdate.ts',
      'useKitchenUpdate',
      {
        useAuth: () => ({ currentUser: Vue.ref(user) }),
        useAppSession: () => ({ appUser: Vue.ref({ id: 'operator' }) }),
        useFireUXConfig: () => ({ appId: 'app' }),
        useRoute: () => ({ path: '/appearance' }),
        useCommandScope: () => () => () => true,
        useRequireUser: () => (stage === 'account' ? waiting : user),
        $fetch: (...input) => {
          calls.push(input)
          return { ok: true, kitchen_id: 'k' }
        },
      }
    )
    const command = useKitchenUpdate().updateKitchen(
      {
        kitchenId: 'k',
        changes: { 'services.item_images': true },
      },
      () => current
    )
    await Promise.resolve()
    current = false
    release(stage === 'account' ? user : 'token')
    await assert.rejects(command, /context changed/)
    assert.deepEqual(calls, [])
  }
})

test('the Appearance control saves only its boolean preference and retains the field guard', async () => {
  const calls = []
  let field
  const Editor = component('kitchen/components/Appearance/ItemImages.vue', {
    '../../composables/firestore/useKitchenUpdate': {
      useKitchenUpdate: () => ({
        captureIntent: () => () => true,
        updateKitchen: (...args) => {
          calls.push(args)
        },
      }),
    },
  })
  for (const disabled of [false, true]) {
    const app = Vue.createSSRApp({
      render: () =>
        Vue.h(Editor, {
          kitchenId: 'k',
          enabled: false,
          disabled,
        }),
    })
    app.component('UCard', {
      render() {
        return Vue.h('div', this.$slots.default?.())
      },
    })
    app.component('FireFormsEditableCheckbox', {
      props: ['value', 'update'],
      setup(props) {
        field = props
        return () => null
      },
    })
    await renderToString(app)
    assert.equal(field.value, false)
    const guard = () => true
    if (disabled) {
      await assert.rejects(field.update(true, guard), /read-only/)
    } else {
      for (const value of [true, false]) {
        await field.update(value, guard)
        assert.deepEqual(calls.at(-1)[0], {
          kitchenId: 'k',
          changes: { 'services.item_images': value },
        })
        assert.equal(calls.at(-1)[1], guard)
      }
    }
  }
  assert.equal(calls.length, 2)
})
