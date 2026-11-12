import { photoImageUrl } from 'fireux-core/runtime/utils/photo-image-url'
import * as itemChoices from '../runtime/kitchen/utils/item-choices.ts'
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
    if (name.endsWith('/item-choices')) return itemChoices
    if (name.endsWith('/photo-image-url')) return { photoImageUrl }
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
const ItemImage = component('menu/components/ItemImage.vue')
const ChoiceBubbles = component('menu/components/ChoiceBubbles.vue')
const ItemChoices = component('menu/components/ItemChoices.vue')
const Surface = {
  render() {
    return Vue.h('span', this.$slots.default?.())
  },
}
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
  app.component('MenuItemImage', ItemImage)
  app.component('MenuChoiceBubbles', ChoiceBubbles)
  app.component('MenuItemChoices', ItemChoices)
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
  let avatar
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
  app.component('MenuItemImage', ItemImage)
  app.component('MenuChoiceBubbles', ChoiceBubbles)
  app.component('MenuItemChoices', ItemChoices)
  app.component(
    'KitchenMenuItemsPhoto',
    component('kitchen/components/Menu/Items/Photo.vue')
  )
  app.component('UAvatar', {
    props: ['src', 'alt', 'icon'],
    setup(props) {
      avatar = props
      return () => Vue.h('span')
    },
  })
  app.component('FireActionSurface', Surface)
  app.component('MenuDetailMealDeal', { render: () => null })
  app.mount(root)
  const find = (tag, node = root) =>
    node.tag === tag
      ? node
      : (node.children || []).map((child) => find(tag, child)).find(Boolean)
  const all = (tag, node = root) => [
    ...(node.tag === tag ? [node] : []),
    ...(node.children || []).flatMap((child) => all(tag, child)),
  ]
  return { app, find, all, avatar: () => avatar }
}
test('failed customer images collapse safely and a changed URL can recover', async () => {
  for (const [Component, props, change] of [
    [
      ItemImage,
      Vue.reactive({ enabled: true, imageUrl: '/bad.jpg' }),
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

test('operator Item photos use shared delivery for existing uploads without rewriting records', async () => {
  const Cell = component('kitchen/components/Menu/Items/Cards/Cell.vue')
  const props = Vue.reactive({
    id: 'dish',
    title: 'Item',
    imageUrl: '/item.jpg',
  })
  const mounted = mount(Cell, props)
  assert.equal(mounted.find('img').props.src, '/item.jpg')
  props.imageUrl =
    'https://storage.example/o/kitchens%2Fk%2Fdishes%2Fd%2Fimage%2Fr.webp'
  await Vue.nextTick()
  assert.equal(mounted.find('img').props.src, photoImageUrl(props.imageUrl))
  assert.equal(mounted.find('img').props.onLoad, undefined)
  assert.equal(mounted.find('img').props.onError, undefined)
  assert.equal(mounted.find('img').props.style, undefined)
  props.imageUrl = ''
  await Vue.nextTick()
  assert.equal(mounted.find('img'), undefined)
  mounted.app.unmount()
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
      'kitchen/composables/useKitchenUpdate.ts',
      'useKitchenUpdate',
      {
        useAuth: () => ({ currentUser: Vue.ref(user) }),
        useAppSession: () => ({ appUser: Vue.ref({ id: 'operator' }) }),
        useFireUXConfig: () => ({ appId: 'app' }),
        useRoute: () => ({ path: '/appearance' }),
        useRuntimeConfig: () => ({ public: {} }),
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

test('the Appearance control saves only its boolean preference and forwards captured intent', async () => {
  const calls = []
  let field
  const guard = () => true
  const Editor = component('kitchen/components/Appearance/ItemImages.vue', {
    '../../composables/useKitchenUpdate': {
      useKitchenUpdate: () => ({
        captureIntent: () => guard,
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
    app.component('USwitch', {
      props: ['modelValue', 'disabled', 'loading'],
      setup(props, { attrs }) {
        field = { props, update: attrs['onUpdate:modelValue'] }
        return () => null
      },
    })
    await renderToString(app)
    assert.equal(field.props.modelValue, false)
    assert.equal(field.props.disabled, disabled)
    if (disabled) {
      const before = calls.length
      await field.update(true)
      assert.equal(calls.length, before)
    } else {
      for (const value of [true, false]) {
        await field.update(value)
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

test('public choice bubbles expose local preview controls without visible group headings', async () => {
  const html = await renderItem({
    item: item({
      priceOptions: [{ id: 'large', label: 'Large', price: 18 }],
      addOns: [
        { id: 'cheese', label: 'Cheese', price: 2 },
        { id: 'sauce', label: 'Sauce', price: 0 },
      ],
    }),
  })
  assert.match(html, /menu-choice-bubble/)
  assert.match(html, /Large/)
  assert.match(html, /18 CHF/)
  assert.match(html, /\+ 2 CHF/)
  assert.match(html, /Included/)
  assert.match(html, /type="radio"/)
  assert.match(html, /type="checkbox"/)
  assert.doesNotMatch(html, /options-label|<button|<details/)
})

test('ordering bubbles preserve native radio and checkbox state and emit the chosen identity', async () => {
  for (const multiple of [false, true]) {
    const selected = Vue.ref(['small']),
      emitted = []
    const props = Vue.reactive({
      label: 'Portions',
      interactive: true,
      multiple,
      options: [{ id: 'small', label: 'Small', priceLabel: '12 CHF' }],
      get selectedIds() {
        return selected.value
      },
      onChoose: (id) => emitted.push(id),
    })
    const mounted = mount(ChoiceBubbles, props)
    const input = mounted.find('input')
    assert.equal(input.props.type, multiple ? 'checkbox' : 'radio')
    assert.equal(input.props.checked, true)
    assert.equal(input.props.value, 'small')
    input.props.onChange()
    assert.deepEqual(emitted, ['small'])
    selected.value = []
    await Vue.nextTick()
    assert.equal(mounted.find('input').props.checked, false)
    mounted.app.unmount()
  }
})

test('direct ordering bubbles retain the existing add action', () => {
  const chosen = []
  const mounted = mount(ChoiceBubbles, {
    label: 'Pizza variants',
    action: true,
    options: [{ id: 'large', label: 'Large', priceLabel: '18 CHF' }],
    onChoose: (id) => chosen.push(id),
  })
  assert.equal(mounted.find('input'), undefined)
  const button = mounted.find('button')
  assert.equal(button.props.type, 'button')
  button.props.onClick()
  assert.deepEqual(chosen, ['large'])
  mounted.app.unmount()
})

test('browse preview selects a variant, toggles extras and resets without mutating the Item', async () => {
  const saved = item({
    price: 9,
    priceOptions: [
      { id: 'large', label: 'Large', price: 18 },
      { id: 'small', label: 'Small', price: 12 },
    ],
    addOns: [
      { id: 'cheese', label: 'Cheese', price: 2.5 },
      { id: 'sauce', label: 'Sauce', price: 0 },
    ],
  })
  const before = structuredClone(saved)
  const props = Vue.reactive({
    item: saved,
    accessibilityId: 'preview',
    currencyCode: 'CHF',
    currencyFormat: 'code',
    showCurrency: true,
    availableOptionsLabel: 'Options',
    optionalExtrasLabel: 'Extras',
  })
  const mounted = mount(Item, props)
  const input = (id) =>
    mounted.all('input').find((node) => node.props.value === id)
  const text = (node) =>
    [node.text || '', ...(node.children || []).map(text)].join('')
  const price = () =>
    text(
      mounted
        .all('span')
        .find((node) => node.props.class === 'menu-browse-item__price')
    )
  assert.equal(input('small').props.checked, true)
  assert.equal(price(), '12 CHF')
  input('large').props.onChange()
  await Vue.nextTick()
  assert.equal(price(), '18 CHF')
  input('cheese').props.onChange()
  await Vue.nextTick()
  assert.equal(price(), '20.50 CHF')
  input('sauce').props.onChange()
  await Vue.nextTick()
  assert.equal(price(), '20.50 CHF')
  input('cheese').props.onChange()
  await Vue.nextTick()
  assert.equal(price(), '18 CHF')
  assert.deepEqual(saved, before)
  props.item = item({ id: 'another', price: 4 })
  await Vue.nextTick()
  assert.equal(price(), '4 CHF')
  assert.equal(mounted.all('input').length, 0)
  mounted.app.unmount()
})

test('operator photo layout remounts keep one stable shared delivery URL', () => {
  const src =
    'https://storage.example/o/kitchens%2Fk%2Fdishes%2Fd%2Fimage%2Fr.webp'
  const Photo = component('kitchen/components/Menu/Items/Photo.vue')
  for (const layout of ['list', 'grid', 'list', 'grid']) {
    const surface = mount(Photo, { src, alt: layout })
    assert.equal(surface.find('img').props.src, photoImageUrl(src))
    assert.equal(surface.find('img').props.onLoad, undefined)
    assert.equal(surface.find('img').props.style, undefined)
    surface.app.unmount()
  }
})
