import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { parse, compileScript } from 'vue/compiler-sfc'
import { createSSRApp, h, reactive } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { transpileModule, ModuleKind } from 'typescript'

const require = createRequire(import.meta.url)
const path = new URL(
  '../../../../runtime/components/Workspace/AI/ModelLabel.vue',
  import.meta.url
)
const source = readFileSync(path, 'utf8')
function load(runtime, inlineTemplate = true) {
  const { descriptor } = parse(source, { filename: path.pathname })
  const script = compileScript(descriptor, {
    id: 'model-label',
    inlineTemplate,
  })
  const code = transpileModule(script.content, {
    compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
  }).outputText
  const module = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'])(
    (id) =>
      id === '#imports' ? { useRuntimeConfig: () => runtime } : require(id),
    module,
    module.exports
  )
  return module.exports.default
}

test('configured, default, simulator, Codex and development labels preserve their text and link', async () => {
  for (const [ai, developmentCodex, expected] of [
    [undefined, false, 'FireUX AI · gpt-4o-mini'],
    [
      {
        enabled: false,
        mode: 'disabled',
        provider: 'openai',
        model: 'kept-model',
      },
      false,
      'OpenAI · kept-model',
    ],
    [
      { mode: 'app', provider: 'google', model: 'gemini' },
      false,
      'google · gemini',
    ],
    [
      { mode: ' codex ', provider: 'openai', model: 'ignored' },
      false,
      'Codex · development override',
    ],
    [{ mode: 'simulator', model: 'ignored' }, false, 'FireUX AI · simulator'],
    [{ provider: ' openai ', model: '  ' }, false, 'OpenAI · gpt-4o-mini'],
    [
      { mode: 'app', provider: 'openai', model: 'kept-model' },
      true,
      'FireUX · Codex development',
    ],
  ]) {
    const app = createSSRApp(load({ public: { fireux: { ai } } }), {
      developmentCodex,
    })
    app.component('UButton', {
      props: ['to', 'label'],
      setup:
        (props, { slots }) =>
        () =>
          h('a', { href: props.to }, [slots.leading?.(), props.label]),
    })
    const html = await renderToString(app)
    assert.ok(html.includes(expected), expected)
    assert.match(html, /href="https:\/\/fireux.app\/gpt"/)
    assert.ok(html.includes(`title="${expected}"`))
    assert.match(html, /About this FireUX AI model/)
    assert.match(html, /\/img\/core\/brand\/logo.svg/)
  }
})

test('labels follow runtime presentation changes without selecting or changing execution', () => {
  const runtime = reactive({
    public: {
      fireux: {
        ai: {
          enabled: false,
          mode: 'app',
          provider: 'openai',
          model: 'first',
        },
      },
    },
  })
  const props = reactive({ developmentCodex: false })
  const state = load(runtime, false).setup(props, { expose() {} })
  assert.equal(state.modelLabel.value, 'OpenAI · first')
  runtime.public.fireux.ai.model = 'second'
  assert.equal(state.modelLabel.value, 'OpenAI · second')
  runtime.public.fireux.ai.mode = 'simulator'
  assert.equal(state.modelLabel.value, 'FireUX AI · simulator')
  props.developmentCodex = true
  assert.equal(state.modelLabel.value, 'FireUX · Codex development')
  props.developmentCodex = false
  assert.equal(state.modelLabel.value, 'FireUX AI · simulator')
  assert.deepEqual(runtime.public.fireux.ai, {
    enabled: false,
    mode: 'simulator',
    provider: 'openai',
    model: 'second',
  })
})
