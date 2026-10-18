import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { compile, createSSRApp, h, ref } from 'vue'
import { parse } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'

const { descriptor } = parse(readFileSync(new URL(
  '../runtime/components/molecules/MultiSelect.vue', import.meta.url
), 'utf8'))
const create = compileFunction(
  stripTypeScriptTypes(descriptor.scriptSetup.content) + '; return { toggle }',
  ['defineProps', 'defineModel']
)
const items = [
  { label: 'Alpha', value: 'a' },
  { label: 'Beta', value: 'b' },
  { label: 'Unavailable', value: 'c', disabled: true },
]

test('multiple selection adds and removes choices without mutating the supplied array', () => {
  const original = ['a']
  const model = ref(original)
  const { toggle } = create(() => ({ items }), () => model)
  toggle('b')
  assert.deepEqual(model.value, ['a', 'b'])
  assert.deepEqual(original, ['a'])
  toggle('a')
  assert.deepEqual(model.value, ['b'])
  toggle('b')
  assert.deepEqual(model.value, [])
})

test('disabled choices, a disabled group and unknown values cannot change selection', () => {
  const props = { items, disabled: false }
  const model = ref(['a'])
  const { toggle } = create(() => props, () => model)
  toggle('c')
  toggle('unknown')
  props.disabled = true
  toggle('a')
  toggle('b')
  assert.deepEqual(model.value, ['a'])
})

test('all options remain native labelled buttons with explicit pressed and disabled states', async () => {
  const model = ref(['a'])
  const props = { items, label: 'Choices', disabled: false }
  const { toggle } = create(() => props, () => model)
  const app = createSSRApp({
    setup: () => ({ ...props, model, toggle }),
    render: compile(descriptor.template.content),
  })
  app.component('UBadge', {
    inheritAttrs: false,
    props: ['as', 'label', 'color', 'variant', 'leadingIcon'],
    setup: (props, { attrs }) => () => h(props.as, attrs, props.label),
  })
  const html = await renderToString(app)
  assert.match(html, /role="group" aria-label="Choices"/)
  assert.equal((html.match(/<button/g) || []).length, 3)
  assert.match(html, /type="button"[^>]*aria-pressed="true"[^>]*>Alpha/)
  assert.match(html, /aria-pressed="false"[^>]*>Beta/)
  assert.match(html, /aria-pressed="false"[^>]*disabled[^>]*>Unavailable/)
})
