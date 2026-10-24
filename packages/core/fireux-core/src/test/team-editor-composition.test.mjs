import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { compile, createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

const source = readFileSync(new URL('../runtime/workspace/components/Team/Editor.vue', import.meta.url), 'utf8')
const template = source.slice(source.indexOf('<template>') + 10, source.lastIndexOf('</template>'))
const script = source.split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
async function render({ status = 'ready', members = [], memberId, custom = false } = {}) {
  const selections = [], seen = {}, labels = { a: ['Host'] }
  const props = { title: 'Example Team', roleLabels: labels, memberId, singlePath: '/team/a', error: 'Connection failed', team: {
    state: ref({ team: { members, selectedTeamMemberId: 'a' } }),
    derived: ref({ status, capability: { availableActions: [], primitives: {} } }),
    primitives: { create() {}, update() {}, delete() {} },
    natives: { select: id => selections.push(id) },
  } }
  const state = compileFunction(stripTypeScriptTypes(script) + '; return { state, derived, primitives, collection, crud }', ['ref', 'defineProps', 'defineExpose'])(ref, () => props, () => {})
  const Editor = { setup: () => ({ ...props, ...state }), render: compile(template) }
  const app = createSSRApp({ render: () => h(Editor, {}, custom ? { collection: () => h('p', 'Domain collection'), single: () => h('p', 'Domain action') } : { single: () => h('p', 'Domain action') }) })
  app.component('WorkspaceCapability', { setup: (_, { slots }) => () => h('main', [slots['collection-panel']?.(), slots['single-panel']?.()]) })
  app.component('WorkspaceTeamCollection', { props: ['title'], setup: (p, { slots }) => () => h('section', [h('h2', p.title), slots.default?.()]) })
  app.component('WorkspaceTeamSingle', { props: { selectedMemberId: String, editing: Boolean }, setup: (p, { slots }) => { seen.single = p; return () => h('aside', slots.default?.()) } })
  app.component('WorkspaceTeamPeople', { props: ['members', 'roleLabels', 'selectedId', 'pending'], setup: (p, { attrs }) => { seen.people = { ...p, ...attrs }; return () => h('div', p.pending ? 'Loading people' : p.members.map(row => row.name).join(',')) } })
  app.component('UAlert', { props: ['title', 'description'], setup: (p, { slots }) => () => h('div', [p.title, p.description, slots.actions?.()]) })
  app.component('MoleculesCopyError', { props: ['message'], setup: p => () => h('button', p.message) })
  return { html: await renderToString(app), seen, selections, labels }
}

test('shared Team editor owns people selection, role labels and empty/loading/error presentation', async () => {
  const ready = await render({ members: [{ id: 'a', name: 'Alex' }] })
  assert.match(ready.html, /Alex/)
  assert.match(ready.html, /Domain action/)
  assert.equal(ready.seen.people.selectedId, 'a')
  assert.equal(ready.seen.people.roleLabels, ready.labels)
  ready.seen.people.onSelect('b')
  assert.deepEqual(ready.selections, ['b'])
  assert.match((await render()).html, /No team members yet/)
  const loading = await render({ status: 'loading' })
  assert.match(loading.html, /Loading people/)
  assert.doesNotMatch(loading.html, /No team members yet/)
  const failed = await render({ status: 'error' })
  assert.match(failed.html, /Connection failed/)
  assert.equal(failed.seen.people, undefined)
  assert.doesNotMatch(failed.html, /No team members yet/)
})

test('domain collection slots still override defaults and single-record routes retain their actions', async () => {
  const custom = await render({ custom: true })
  assert.match(custom.html, /Domain collection/)
  assert.equal(custom.seen.people, undefined)
  const single = await render({ memberId: 'b' })
  assert.equal(single.seen.single.selectedMemberId, 'b')
  assert.equal(single.seen.single.editing, true)
  assert.equal(single.seen.people, undefined)
  assert.match(single.html, /Domain action/)
})
