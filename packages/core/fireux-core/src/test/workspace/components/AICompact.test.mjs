import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse } from 'vue/compiler-sfc'
import { compile, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const { descriptor } = parse(
  readFileSync(
    new URL(
      '../../../runtime/workspace/components/AI/Compact.vue',
      import.meta.url
    ),
    'utf8'
  )
)
const component = {
  props: [
    'modelValue',
    'placeholder',
    'ariaLabel',
    'resultsLabel',
    'submitting',
    'disabled',
    'canSubmit',
  ],
  setup: () => ({ emit() {} }),
  render: compile(descriptor.template.content),
}
async function render(slots = {}) {
  const app = createSSRApp({
    render: () =>
      h(component, { ariaLabel: 'Page AI', resultsLabel: 'Results' }, slots),
  })
  app.component('WorkspaceAICompactComposer', {
    props: ['spacious'],
    setup: (props) => () => h('textarea', { rows: props.spacious ? 3 : 1 }),
  })
  return renderToString(app)
}
test('idle compact chat renders a one-row composer without an empty results region', async () => {
  const html = await render()
  assert.match(html, /rows="1"/)
  assert.doesNotMatch(html, /role="region"/)
})
test('domain result and composer slots retain controls and explicit compact size', async () => {
  let spacious
  const html = await render({
    results: () => h('button', 'Confirm action'),
    composer: (props) => {
      spacious = props.spacious
      return h('textarea', { 'aria-label': 'Domain prompt' })
    },
  })
  assert.equal(spacious, false)
  assert.match(html, /role="region" aria-label="Results" tabindex="0"/)
  assert.match(html, /Confirm action/)
  assert.equal((html.match(/<textarea/g) || []).length, 1)
})

test('compact prompt guards keyboard submission for busy, disabled and empty states', async () => {
  const { compileFunction } = await import('node:vm')
  const { stripTypeScriptTypes } = await import('node:module')
  const { descriptor: prompt } = parse(
    readFileSync(
      new URL(
        '../../../runtime/workspace/components/AI/CompactComposer.vue',
        import.meta.url
      ),
      'utf8'
    )
  )
  for (const [overrides, expected] of [
    [{}, 1],
    [{ submitting: true }, 0],
    [{ disabled: true }, 0],
    [{ canSubmit: false }, 0],
    [{ modelValue: '  ' }, 0],
  ]) {
    let submitted = 0
    const submit = compileFunction(
      `${stripTypeScriptTypes(prompt.scriptSetup.content)}; return submit`,
      ['defineProps', 'withDefaults', 'defineEmits']
    )(
      () => ({ modelValue: 'Help', canSubmit: true, ...overrides }),
      (props, defaults) => ({ ...defaults, ...props }),
      () => () => submitted++
    )
    submit()
    assert.equal(submitted, expected)
  }
})
