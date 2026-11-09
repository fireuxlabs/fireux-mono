import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parse, compileScript } from 'vue/compiler-sfc'
import { ModuleKind, transpileModule } from 'typescript'
import * as fixtures from '../../../content/demo-cards.ts'

const require = createRequire(import.meta.url)
const read = (name) =>
  readFileSync(
    new URL(`../../../components/Demo/Cards/${name}.vue`, import.meta.url),
    'utf8'
  )
function component(name) {
  const { descriptor, errors } = parse(read(name))
  assert.deepEqual(errors, [])
  const compiled = compileScript(descriptor, { id: name, inlineTemplate: true })
  const code = transpileModule(compiled.content, {
    compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
  }).outputText
  const module = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'])(
    (id) => (id === '~/content/demo-cards' ? fixtures : require(id)),
    module,
    module.exports
  )
  return module.exports.default
}

test('the App gallery composes real domain Cards with supplied illustrative inputs', async () => {
  const captured = []
  const app = createSSRApp(component('Index'))
  const names = [
    ...new Set([...read('Index').matchAll(/<([A-Z]\w+)/g)].map((m) => m[1])),
  ]
  for (const name of names) {
    if (name === 'DemoCardsSpecimen') continue
    app.component(name, {
      inheritAttrs: false,
      setup: (_, { attrs, slots }) => {
        if (!name.startsWith('U')) captured.push({ name, attrs })
        return () =>
          h('div', { 'data-component': name }, [
            ...Object.values(slots).flatMap((slot) => slot?.() || []),
          ])
      },
    })
  }
  app.component('DemoCardsSpecimen', component('Specimen'))
  app.component('UCard', {
    setup:
      (_, { slots }) =>
      () =>
        h(
          'article',
          Object.values(slots).flatMap((slot) => slot?.() || [])
        ),
  })
  app.component('UButton', {
    props: ['label'],
    setup:
      (props, { attrs }) =>
      () =>
        h('button', attrs, props.label),
  })
  const html = await renderToString(app)
  for (const name of [
    'PlaceCardsPreview',
    'KitchenCardsPreview',
    'MenuCardsCell',
    'IngredientCardsPreview',
    'SupplierCardsPreview',
    'JobCardsPreview',
  ]) {
    assert.ok(
      captured.some((card) => card.name === name),
      name
    )
  }
  assert.equal(
    captured.find((card) => card.name === 'MenuCardsCell').attrs.menu.id,
    fixtures.menu.id
  )
  assert.match(html, /Copy Place · Preview/)
  assert.match(html, /cards-kitchen-supplier/)
})

test('specimen reference copying uses explicit family metadata and reports clipboard failure', async () => {
  const source = read('Specimen')
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import .*\n/gm, '')
  const copied = []
  let fail = false
  const state = compileFunction(
    `${stripTypeScriptTypes(source)};return { copyReference, copied, failed }`,
    ['computed', 'ref', 'defineProps', 'navigator']
  )(computed, ref, () => ({ family: 'Place', label: 'Preview' }), {
    clipboard: {
      writeText: async (value) => {
        if (fail) throw new Error('Unavailable')
        copied.push(value)
      },
    },
  })
  await state.copyReference()
  assert.deepEqual(copied, ['Place · Preview'])
  assert.equal(state.copied.value, true)
  fail = true
  await state.copyReference()
  assert.equal(state.failed.value, true)
  assert.equal(state.copied.value, false)
})
