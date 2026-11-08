import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { compileScript, parse } from 'vue/compiler-sfc'
import ts from 'typescript'

const filename = new URL(
  '../../../../runtime/user/components/Driver/Cards/Overview.vue',
  import.meta.url
).pathname
const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
const script = compileScript(descriptor, { id: filename, inlineTemplate: true })
const code = ts.transpileModule(script.content, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const exports = {}
compileFunction(code, ['require', 'exports'])((id) => {
  assert.equal(id, 'vue')
  return Vue
}, exports)
const Overview = exports.default

async function render({
  radius = 1500,
  name = 'Alex Driver',
  tags = ['Bicycle', 'Evenings'],
} = {}) {
  const app = Vue.createSSRApp({
    render: () =>
      Vue.h(
        Overview,
        {
          card: { displayName: name, summary: 'Driver summary' },
          profile: { tags, coverage: { radius_m: radius } },
        },
        { actions: () => Vue.h('button', 'Open driver dashboard') }
      ),
  })
  app.component('UserProfileHero', {
    props: ['displayName', 'summary', 'labels', 'stats'],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h('header', [
          props.displayName,
          props.summary,
          Vue.h('small', props.stats[0].value),
          slots.actions?.(),
        ]),
  })
  app.component('UserProfileSection', {
    props: ['title'],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h('section', [Vue.h('h2', props.title), slots.default?.()]),
  })
  app.component('UBadge', {
    props: ['label'],
    setup: (props) => () => Vue.h('span', props.label),
  })
  return renderToString(app)
}

test('Driver Overview preserves public coverage, capabilities and its supplied dashboard action', async () => {
  const html = await render()
  for (const text of [
    'Alex Driver',
    'Driver summary',
    'Delivery coverage',
    '1.5 km',
    'km radius',
    'Bicycle',
    'Evenings',
    'Open driver dashboard',
    'contact details stay private',
  ])
    assert.ok(html.includes(text), text)
})

test('Driver Overview preserves radius formatting and empty identity/capability fallbacks', async () => {
  for (const [radius, label] of [
    [450, '450 m'],
    [2000, '2 km'],
    [-1, '0 m'],
  ]) {
    const html = await render({ radius, name: '', tags: [] })
    assert.ok(html.includes(label), label)
    assert.match(html, /Driver profile/)
    assert.match(html, /available through the kitchen delivery network/)
  }
})
