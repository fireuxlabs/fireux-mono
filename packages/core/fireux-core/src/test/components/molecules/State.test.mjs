import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { compileScript, parse } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'
import { transpileModule, ModuleKind } from 'typescript'

const file = new URL(
  '../../../runtime/components/molecules/State.vue',
  import.meta.url
)
const { descriptor } = parse(readFileSync(file, 'utf8'))
const script = compileScript(descriptor, {
  id: 'state-test',
  inlineTemplate: true,
})
const { outputText } = transpileModule(script.content, {
  compilerOptions: { module: ModuleKind.CommonJS },
})
const exports = {}
compileFunction(outputText, ['require', 'exports'])((id) => {
  assert.equal(id, 'vue')
  return Vue
}, exports)

async function render(props) {
  let retry,
    retries = 0
  const app = Vue.createSSRApp({
    render: () =>
      Vue.h(exports.default, { ...props, onRetry: () => retries++ }),
  })
  app.component('UIcon', {
    render: () => Vue.h('span', { 'data-spinner': true }),
  })
  app.component('FireCopyError', {
    props: ['message'],
    setup: (p) => () =>
      Vue.h('button', { 'data-copy': p.message }, 'Copy error'),
  })
  app.component('UButton', {
    props: ['label'],
    setup: (p, { attrs }) => {
      retry = attrs.onClick
      return () => Vue.h('button', p.label)
    },
  })
  return {
    html: await renderToString(app),
    retry: () => retry(),
    retries: () => retries,
  }
}

test('shared feedback presents the five read outcomes with accessible semantics', async () => {
  for (const outcome of ['idle', 'pending', 'error', 'empty', 'ready']) {
    const { html } = await render({ outcome, entity: 'projects' })
    if (outcome === 'idle' || outcome === 'ready') {
      assert.doesNotMatch(html, /fx-state|Copy error|Try again/)
      continue
    }
    assert.match(html, outcome === 'error' ? /role="alert"/ : /role="status"/)
    assert.match(
      html,
      outcome === 'error' ? /aria-live="assertive"/ : /aria-live="polite"/
    )
    assert.match(html, new RegExp(`aria-busy="${outcome === 'pending'}"`))
    if (outcome === 'pending') {
      assert.match(html, /Loading projects…/)
      assert.match(html, /data-spinner/)
    }
    if (outcome === 'empty') assert.match(html, /No projects yet\./)
    if (outcome === 'error')
      assert.match(html, /data-copy="Unable to load projects\."/)
    assert.doesNotMatch(html, /Try again/)
  }
})

test('error feedback copies supplied details and emits retry only when offered', async () => {
  const feedback = await render({
    outcome: 'error',
    entity: 'projects',
    error: 'Connection interrupted',
    retryable: true,
  })
  assert.match(feedback.html, /Unable to load projects\./)
  assert.match(feedback.html, /data-copy="Connection interrupted"/)
  assert.match(feedback.html, /Try again/)
  feedback.retry()
  assert.equal(feedback.retries(), 1)
  for (const outcome of ['idle', 'pending', 'empty', 'ready']) {
    const { html } = await render({
      outcome,
      retryable: true,
      error: 'Stale error',
    })
    assert.doesNotMatch(html, /Try again|Copy error|Stale error/)
  }
})
