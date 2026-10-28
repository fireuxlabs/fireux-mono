import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'

const filename = new URL(
  '../runtime/user/components/Notifications/Button.vue',
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

async function render(count, instances = [{}]) {
  const unreadCount = Vue.ref(count)
  const isOpen = Vue.ref(false)
  const clicks = []
  const hints = []
  const exports = {}
  compileFunction(code, ['require', 'exports'])((id) => {
    if (id === 'vue') return Vue
    assert.equal(id, '../../composables/notifications/useUserNotifications')
    return {
      useUserNotifications: () => ({
        unreadCount,
        open: () => {
          isOpen.value = true
        },
      }),
    }
  }, exports)
  const app = Vue.createSSRApp({
    render: () =>
      Vue.h(
        'div',
        instances.map((props) => Vue.h(exports.default, props))
      ),
  })
  app.component('UTooltip', {
    props: ['text', 'kbds'],
    setup(props, { slots }) {
      hints.push(props.kbds)
      return () => Vue.h('div', { title: props.text }, slots.default?.())
    },
  })
  app.component('UButton', {
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      clicks.push(attrs.onClick)
      return () =>
        Vue.h(
          'button',
          { 'aria-label': attrs['aria-label'] },
          slots.default?.()
        )
    },
  })
  app.component('UChip', {
    props: ['show', 'text', 'color', 'inset'],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h(
          'span',
          { 'data-badge': props.show ? props.text : undefined },
          slots.default?.()
        ),
  })
  app.component('UIcon', { render: () => Vue.h('i') })
  return { html: await renderToString(app), clicks, hints, isOpen }
}

for (const [count, label, badge] of [
  [0, 'Notifications', undefined],
  [1, '1 unread notification', '1'],
  [99, '99 unread notifications', '99'],
  [100, '100 unread notifications', '99+'],
]) {
  test(`notification control presents ${count} unread with an honest accessible label`, async () => {
    const { html } = await render(count)
    assert.ok(html.includes(`aria-label="${label}"`))
    if (badge) assert.ok(html.includes(`data-badge="${badge}"`))
    else assert.doesNotMatch(html, /data-badge=/)
  })
}

test('Dashboard and Workspace controls open the same notification state and retain their own keyboard hints', async () => {
  const { clicks, hints, isOpen } = await render(3, [{ kbds: ['N'] }, {}])
  assert.deepEqual(hints, [['N'], undefined])
  assert.equal(clicks.length, 2)
  clicks[0]()
  assert.equal(isOpen.value, true)
  isOpen.value = false
  clicks[1]()
  assert.equal(isOpen.value, true)
})
