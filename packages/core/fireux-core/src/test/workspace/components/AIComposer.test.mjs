import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { transpileModule, ModuleKind } from 'typescript'

const require = createRequire(import.meta.url)
const path = new URL(
  '../../../runtime/workspace/components/AI/Composer.vue',
  import.meta.url
)
const { descriptor } = parse(readFileSync(path, 'utf8'), {
  filename: path.pathname,
})
const script = compileScript(descriptor, {
  id: 'passive-composer',
  inlineTemplate: true,
})
const code = transpileModule(script.content, {
  compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
}).outputText
const module = { exports: {} }
compileFunction(code, ['require', 'module', 'exports'])(
  require,
  module,
  module.exports
)
const component = module.exports.default

async function render(props = {}, slots = {}) {
  const events = [],
    controls = { suggestions: [] }
  const app = createSSRApp({
    render: () =>
      h(
        component,
        {
          ...props,
          'onUpdate:modelValue': (value) => events.push(['prompt', value]),
          onSubmit: () => events.push(['submit']),
          onSelectSuggestion: (value) => events.push(['suggestion', value]),
        },
        slots
      ),
  })
  app.component('UChatPrompt', {
    setup: (_, { attrs, slots, emit }) => {
      controls.prompt = attrs
      controls.setPrompt = (value) => emit('update:modelValue', value)
      return () =>
        h('section', [slots.default?.(), h('footer', slots.footer?.())])
    },
  })
  app.component('UChatPromptSubmit', {
    setup: (_, { attrs }) => {
      controls.submit = attrs
      return () => h('button', 'Send')
    },
  })
  app.component('UButton', {
    props: ['label'],
    setup: (props, { attrs }) => {
      if (props.label) controls.suggestions.push(attrs)
      return () => h('button', props.label)
    },
  })
  const html = await renderToString(app)
  return { html, controls, events }
}

test('Core composer works without AI configuration and renders supplied model presentation', async () => {
  const plain = await render()
  assert.doesNotMatch(plain.html, /OpenAI|gpt-4o|fireux.app\/gpt/)
  const supplied = await render(
    {},
    { model: () => h('span', 'Supplied model information') }
  )
  assert.match(supplied.html, /Supplied model information/)
  assert.match(supplied.html, /Send/)
})

test('prompt events, sizing, suggestions and submit availability remain with Core', async () => {
  const suggestion = { label: 'Explain this page' }
  const { controls, events, html } = await render({
    modelValue: 'Question',
    spacious: true,
    submitting: true,
    canSubmit: false,
    suggestions: [suggestion],
  })
  controls.setPrompt('Changed')
  let prevented = false
  controls.prompt.onSubmit({
    preventDefault() {
      prevented = true
    },
  })
  controls.suggestions[0].onClick()
  assert.equal(prevented, true)
  assert.deepEqual(events, [
    ['prompt', 'Changed'],
    ['submit'],
    ['suggestion', suggestion],
  ])
  assert.equal(controls.prompt.rows, 3)
  assert.equal(controls.prompt.maxrows, 12)
  assert.equal(controls.submit.status, 'submitted')
  assert.equal(controls.submit.disabled, true)
  assert.match(html, /Explain this page/)
})
