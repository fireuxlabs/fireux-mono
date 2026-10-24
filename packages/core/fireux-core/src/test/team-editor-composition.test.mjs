import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { compile, computed, createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useCollectionSearch } from '../runtime/composables/shared/useCollectionSearch.ts'

function load(file, names, dependencies) {
  const source = readFileSync(
    new URL('../runtime/workspace/components/' + file, import.meta.url),
    'utf8'
  )
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const script = source
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const setup = compileFunction(
    `${stripTypeScriptTypes(script)}; return { ${names} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return { setup, render: compile(template) }
}

async function render({ status = 'ready', members = [], memberId } = {}) {
  const selections = [],
    seen = {},
    labels = { a: ['Host'], b: ['Cook'] }
  const props = {
    title: 'Example Team',
    roleLabels: labels,
    memberId,
    singlePath: '/team/a',
    error: 'Connection failed',
    team: {
      workspaceId: ref('x-a'),
      state: ref({ team: { members, selectedTeamMemberId: 'a' } }),
      derived: ref({
        status,
        capability: {
          availableActions: [],
          primitives: { create: { available: status === 'ready' } },
        },
      }),
      primitives: { create() {}, update() {}, delete() {} },
      natives: { select: (id) => selections.push(id) },
    },
  }
  const editor = load(
    'Team/Editor.vue',
    'workspaceId, state, derived, primitives, collection, crud',
    { ref, defineProps: () => props, defineExpose() {} }
  )
  const Editor = {
    setup: () => ({ ...props, ...editor.setup }),
    render: editor.render,
  }
  const app = createSSRApp({
    render: () => h(Editor, {}, { single: () => h('p', 'Domain action') }),
  })
  app.component('WorkspaceCapability', {
    setup:
      (_, { slots }) =>
      () =>
        h('main', [slots['collection-panel']?.(), slots['single-panel']?.()]),
  })
  app.component('WorkspaceTeamCollection', {
    props: ['title', 'error', 'roleLabels', 'team'],
    setup: (p) => {
      const collection = load(
        'Team/Collection.vue',
        'state, derived, primitives, members, outcome, query, visibleItems, available, createOpen, createName, openCreate',
        {
          computed,
          ref,
          useCollectionSearch,
          defineProps: () => p,
          defineExpose() {},
        }
      )
      seen.collection = collection.setup
      return { ...p, ...collection.setup }
    },
    render: compile(
      readFileSync(
        new URL(
          '../runtime/workspace/components/Team/Collection.vue',
          import.meta.url
        ),
        'utf8'
      )
        .split('<template>')[1]
        .split('</template>\n<script')[0]
    ),
  })
  app.component('WorkspaceEntityCollection', {
    props: ['outcome', 'errorDescription', 'emptyTitle'],
    setup:
      (p, { slots }) =>
      () =>
        h('section', [
          slots.actions?.(),
          p.outcome === 'pending'
            ? 'Loading team members'
            : p.outcome === 'error'
              ? p.errorDescription
              : p.outcome === 'empty'
                ? p.emptyTitle
                : slots.default?.(),
        ]),
  })
  app.component('WorkspaceTeamSingle', {
    props: { selectedMemberId: String, editing: Boolean },
    setup: (p, { slots }) => {
      seen.single = p
      return () => h('aside', slots.default?.())
    },
  })
  app.component('WorkspaceSelectionRow', {
    props: ['selected'],
    setup: (_, { slots, attrs }) => {
      ;(seen.rows ||= []).push(attrs)
      return () => h('button', slots.default?.())
    },
  })
  for (const name of [
    'UInput',
    'UButton',
    'UAvatar',
    'WorkspaceTeamCrudCreate',
  ])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          h('span', slots.default?.()),
    })
  return { html: await renderToString(app), seen, selections }
}

test('Team uses the shared collection search for member names and role labels', async () => {
  const ready = await render({
    members: [
      { id: 'a', name: 'Alex', userId: '', avatar: '' },
      { id: 'b', name: 'Ben', userId: '', avatar: '' },
    ],
  })
  assert.match(ready.html, /Alex/)
  assert.match(ready.html, /Domain action/)
  ready.seen.rows[0].onSelect()
  assert.deepEqual(ready.selections, ['a'])
  ready.seen.collection.query.value = 'cook'
  assert.deepEqual(
    ready.seen.collection.visibleItems.value.map((row) => row.id),
    ['b']
  )
  ready.seen.collection.query.value = 'alex'
  assert.deepEqual(
    ready.seen.collection.visibleItems.value.map((row) => row.id),
    ['a']
  )
})

test('Team collection distinguishes empty, loading and failed reads', async () => {
  assert.match((await render()).html, /No team members yet/)
  assert.match(
    (await render({ status: 'loading' })).html,
    /Loading team members/
  )
  assert.match((await render({ status: 'error' })).html, /Connection failed/)
})

test('single-record Team routes retain domain-specific actions', async () => {
  const single = await render({ memberId: 'b' })
  assert.equal(single.seen.single.selectedMemberId, 'b')
  assert.equal(single.seen.single.editing, true)
  assert.equal(single.seen.collection, undefined)
  assert.match(single.html, /Domain action/)
})
