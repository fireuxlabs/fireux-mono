import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'

const extensions = new URL('../../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, extensions), 'utf8')
const template = (source) =>
  source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
const summarySource = read(
  '../core/fireux-core/src/runtime/components/Workspace/Overview/Summary.vue'
)
const Summary = {
  props: [
    'title',
    'icon',
    'to',
    'value',
    'description',
    'pending',
    'error',
    'placeholder',
  ],
  render: Vue.compile(template(summarySource)),
}
function appFor(source, setup) {
  const app = Vue.createSSRApp({ setup, render: Vue.compile(template(source)) })
  app.component('Summary', Summary)
  for (const name of [
    'UCard',
    'UIcon',
    'UButton',
    'USkeleton',
    'MoleculesCopyError',
    'UTooltip',
    'UAvatar',
    'UProgress',
  ]) {
    app.component(name, {
      props: ['message'],
      setup:
        (props, { slots }) =>
        () =>
          Vue.h('div', { 'data-ui': name }, [props.message, slots.default?.()]),
    })
  }
  return app
}
const reservationsSource = read(
  'fireux-reservations/src/runtime/property/components/Workspace/Overview/Reservations.vue'
)
function setupReservations(state) {
  const script = reservationsSource
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(script)}; return { reservations, settled, description, calendarDescription }`,
    ['computed', 'usePropertyReservations']
  )(Vue.computed, () => state)
}
function reservationState(outcome, truncated = false) {
  return {
    outcome: Vue.ref(outcome),
    truncated: Vue.ref(truncated),
    summary: Vue.ref({
      total: outcome === 'empty' ? 0 : 713,
      occupiedNights: outcome === 'empty' ? 0 : 919,
      statuses: { confirmed: outcome === 'empty' ? 0 : 7 },
    }),
  }
}
for (const outcome of ['pending', 'error', 'idle', 'empty', 'ready']) {
  test(`Reservation and Calendar Overview preserve ${outcome} as a distinct outcome`, async () => {
    const html = await renderToString(
      appFor(reservationsSource, () =>
        setupReservations(reservationState(outcome))
      )
    )
    assert.match(html, /Calendar/)
    assert.match(html, /Reservations/)
    if (outcome === 'ready') {
      assert.match(html, />713</)
      assert.match(html, />919</)
      assert.match(html, /Recorded nights/)
      assert.match(html, /not an availability check/)
    } else if (outcome === 'empty') {
      assert.equal((html.match(/>0</g) || []).length, 2)
      assert.match(html, /not an availability check/)
      assert.match(html, /0 confirmed/)
      assert.doesNotMatch(html, /7 confirmed/)
    } else {
      assert.doesNotMatch(html, />713<|>919<|>0<|Recorded nights/)
      if (outcome === 'pending')
        assert.equal((html.match(/data-ui="USkeleton"/g) || []).length, 2)
      if (outcome === 'error') {
        assert.match(html, /Calendar could not be loaded/)
        assert.match(html, /Reservations could not be loaded/)
      }
      if (outcome === 'idle') assert.equal((html.match(/>—</g) || []).length, 2)
    }
  })
}
test('Truncated Calendar counts describe only loaded reservation nights', async () => {
  const html = await renderToString(
    appFor(reservationsSource, () =>
      setupReservations(reservationState('ready', true))
    )
  )
  assert.match(html, /limited set of reservations/)
  assert.match(html, /not an availability check/)
})
test('Failing Team and pending Notifications do not hide a ready Identity or expose stale child data', async () => {
  const source = read(
    'fireux-properties/src/runtime/property/components/Workspace/Overview/Capabilities.vue'
  )
  const html = await renderToString(
    appFor(source, () => ({
      team: {
        members: Vue.ref([{ name: 'Stale team member', memberId: 'one' }]),
        pending: Vue.ref(false),
        error: Vue.ref(Error('Denied')),
      },
      identity: { status: Vue.ref('ready') },
      completion: Vue.ref(100),
      filled: Vue.ref(2),
      fields: Vue.ref(['name', 'image']),
      index: { collection: Vue.ref([]), outcome: Vue.ref('empty') },
      notifications: {
        unreadCount: Vue.ref(919),
        pending: Vue.ref(true),
        error: Vue.ref(null),
      },
      notificationPanel: { open() {} },
    }))
  )
  assert.match(html, /Team could not be loaded/)
  assert.match(html, /100%/)
  assert.match(html, /data-ui="USkeleton"/)
  assert.doesNotMatch(html, /Stale team member|>919<|property availability/)
})

function setupScript(source, dependencies, names) {
  const script = source
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(script)}; return { ${names.join(', ')} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const readOutcomeSource = read(
  '../core/fireux-core/src/runtime/composables/fireux/firestore/operations/read-outcome.ts'
)
const resolveReadOutcome = compileFunction(
  `${stripTypeScriptTypes(readOutcomeSource.replace(/^export /gm, ''))}; return resolveReadOutcome`
)()
function collectionState(outcome) {
  return {
    outcome: Vue.ref(outcome),
    error: Vue.ref(outcome === 'error' ? Error('Denied') : null),
    count: Vue.ref(outcome === 'empty' ? 0 : 3),
    collection: Vue.ref(
      outcome === 'empty'
        ? []
        : [{ status: 'open' }, { status: 'in_progress' }, { status: 'done' }]
    ),
    overdueCount: Vue.ref(outcome === 'empty' ? 0 : 1),
  }
}
const portfolioSummaries = [
  {
    name: 'Documents',
    path: 'fireux-documents/src/runtime/portfolio/components/Workspace/Overview/Documents.vue',
    setup(outcome) {
      const documents = collectionState(outcome),
        links = collectionState(outcome)
      return setupScript(
        read(this.path),
        {
          computed: Vue.computed,
          resolveReadOutcome,
          useActivePortfolio: () => ({
            targetOutcome: Vue.ref(outcome === 'idle' ? 'idle' : 'ready'),
            canRead: Vue.ref(outcome !== 'idle'),
          }),
          usePortfolioDocuments: () => documents,
          usePortfolioDocumentLinks: () => links,
        },
        ['documents', 'links', 'outcome', 'settled']
      )
    },
  },
  {
    name: 'Tasks',
    path: 'fireux-tasks/src/runtime/portfolio/components/Workspace/Overview/Tasks.vue',
    setup(outcome) {
      return setupScript(
        read(this.path),
        {
          computed: Vue.computed,
          usePortfolioTaskCollection: () => collectionState(outcome),
        },
        ['tasks', 'settled', 'openCount']
      )
    },
  },
  {
    name: 'Compliance records',
    path: 'fireux-compliance/src/runtime/portfolio/components/Workspace/Overview/Compliance.vue',
    setup(outcome) {
      return setupScript(
        read(this.path),
        {
          computed: Vue.computed,
          usePortfolioComplianceRecordCollection: () =>
            collectionState(outcome),
        },
        ['compliance', 'settled']
      )
    },
  },
]
for (const summary of portfolioSummaries) {
  for (const outcome of ['pending', 'error', 'idle', 'empty', 'ready']) {
    test(`${summary.name} Overview preserves ${outcome} without retained counts`, async () => {
      const html = await renderToString(
        appFor(read(summary.path), () => summary.setup(outcome))
      )
      if (outcome === 'empty') assert.match(html, />0</)
      else if (outcome === 'ready')
        assert.match(html, summary.name === 'Tasks' ? />2</ : />3</)
      else {
        assert.doesNotMatch(
          html,
          />0<|>2<|>3<|3 tasks|3 document links|1 past their/
        )
        if (outcome === 'pending') assert.match(html, /data-ui="USkeleton"/)
        if (outcome === 'error') assert.match(html, /could not be loaded/)
        if (outcome === 'idle') assert.match(html, />—</)
      }
    })
  }
}
test('An empty Document vault keeps its independent links in the Overview', async () => {
  const source = read(portfolioSummaries[0].path)
  const state = setupScript(
    source,
    {
      computed: Vue.computed,
      resolveReadOutcome,
      useActivePortfolio: () => ({
        targetOutcome: Vue.ref('ready'),
        canRead: Vue.ref(true),
      }),
      usePortfolioDocuments: () => collectionState('empty'),
      usePortfolioDocumentLinks: () => collectionState('ready'),
    },
    ['documents', 'links', 'outcome', 'settled']
  )
  const html = await renderToString(appFor(source, () => state))
  assert.match(html, />0</)
  assert.match(html, /3 document links/)
})
