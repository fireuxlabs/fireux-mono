import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'

function component(relative) {
  const filename = new URL(relative, import.meta.url).pathname
  const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
  const script = compileScript(descriptor, { id: filename, inlineTemplate: true })
  const code = ts.transpileModule(script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports'])((id) => {
    assert.equal(id, 'vue')
    return Vue
  }, exports)
  return exports.default
}
const ActionSurface = component('../runtime/components/Molecules/ActionSurface.vue')
const cards = [
  component('../../../../extensions/fireux-products/src/runtime/product/components/Cards/Pill.vue'),
  component('../../../../extensions/fireux-suppliers/src/runtime/supplier/components/Item/Cards/Cell.vue'),
  component('../runtime/app/components/Cards/Pill.vue'),
]
const ULink = Vue.defineComponent({
  props: ['to', 'disabled'],
  setup: (props, { slots }) => () => Vue.h('a', { href: props.disabled ? undefined : props.to }, slots.default?.()),
})
async function render(Card, props) {
  const app = Vue.createSSRApp({ render: () => Vue.h(Card, props) })
  app.component('FireActionSurface', ActionSurface)
  app.component('ULink', ULink)
  for (const name of ['UAvatar', 'UBadge', 'UIcon']) app.component(name, { render: () => null })
  return renderToString(app)
}
for (const [i, Card] of cards.entries()) {
  test(`card ${i + 1} composes static, link and native action surfaces`, async () => {
    const props = { title: 'Record', displayName: 'Record', to: '/record', badges: [] }
    const passive = await render(Card, props)
    assert.match(passive, /data-action-surface="static"/)
    assert.doesNotMatch(passive, /<button|<a\s/)
    const linked = await render(Card, { ...props, link: true })
    assert.match(linked, /href="\/record"/)
    const action = await render(Card, { ...props, action: true })
    assert.match(action, /<button[^>]*type="button"/)
    assert.match(action, /data-action-surface="button"/)
    const both = await render(Card, { ...props, action: true, link: true })
    assert.match(both, /data-action-surface="link"/)
    assert.doesNotMatch(both, /<button/)
  })
}
test('shared surface preserves native disabled action behavior', async () => {
  const html = await render(ActionSurface, { action: true, disabled: true })
  assert.match(html, /<button[^>]* disabled/)
  assert.match(html, /data-disabled="true"/)
})
