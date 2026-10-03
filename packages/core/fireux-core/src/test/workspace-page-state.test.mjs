import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createRenderer, h, nextTick, onUnmounted, ref } from 'vue'

// Exercise Vue's lifecycle with the actual layout boundary key, without a DOM.
test('Workspace entity changes dispose page drafts while unchanged scope preserves them', async () => {
  const source = readFileSync(new URL('../runtime/layouts/workspace.vue', import.meta.url), 'utf8')
  const expression = source.match(/<NuxtErrorBoundary :key="([^"]+)"/)[1]
  const key = new Function('workspace', 'activeEntityId', 'route', `return ${expression}`)
  const renderer = createRenderer({
    createElement: type => ({ type, children: [] }),
    createText: text => ({ text }), createComment: text => ({ text }),
    setText: (node, text) => { node.text = text },
    setElementText: (node, text) => { node.text = text },
    patchProp: () => {},
    insert: (node, parent) => { node.parent = parent; parent.children.push(node) },
    remove: node => { const children = node.parent.children; children.splice(children.indexOf(node), 1) },
    parentNode: node => node.parent, nextSibling: () => null,
  })
  const family = ref('portfolio'), entity = ref('a'), path = ref('/workspace/portfolio/identity')
  const drafts = [], disposed = []
  const Page = { setup() {
    const draft = ref('')
    drafts.push(draft)
    onUnmounted(() => disposed.push(draft))
    return () => h('div', draft.value)
  } }
  const app = renderer.createApp({ setup: () => () => h(Page, {
    key: key(family.value, entity.value, { path: path.value }),
  }) })
  app.mount({ children: [] })
  drafts[0].value = 'unsaved A'
  await nextTick()
  assert.equal(drafts.length, 1)
  assert.equal(drafts[0].value, 'unsaved A')
  entity.value = 'b'
  await nextTick()
  assert.equal(disposed.length, 1)
  assert.equal(drafts[1].value, '')
  family.value = 'supplier'
  await nextTick()
  assert.equal(disposed.length, 2)
  path.value = '/workspace/supplier/team'
  await nextTick()
  assert.equal(disposed.length, 3)
  app.unmount()
})
