import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createJiti } from 'jiti'
import { createSSRApp, h, ref } from 'vue'
import { transpileModule, ModuleKind } from 'typescript'

const root = new URL('../../../../../', import.meta.url)
const require = createRequire(import.meta.url)
const vueRequire = createRequire(require.resolve('vue'))
const { parse, compileScript } = vueRequire('@vue/compiler-sfc')
const { renderToString } = vueRequire('@vue/server-renderer')
const load = createJiti(import.meta.url, {
  alias: {
    'fireux-core': fileURLToPath(
      new URL('packages/core/fireux-core/src', root)
    ),
  },
  moduleCache: false,
})
const { defineAppSearchDemand } = load(
  fileURLToPath(
    new URL('packages/core/fireux-core/src/config/app/search-demand.ts', root)
  )
)
const { searchDemand: misebox } = load(
  fileURLToPath(
    new URL('projects/misebox/misebox-app/app/search-demand.ts', root)
  )
)
const { searchDemand: fireux } = load(
  fileURLToPath(
    new URL('projects/fireux/fireux-app/app/search-demand.ts', root)
  )
)

const additionalIndustries = [
  'buenohost/buenohost-app',
  'granite/granite-app',
].map(
  (app) =>
    load(fileURLToPath(new URL(`projects/${app}/app/search-demand.ts`, root)))
      .searchDemand
)

async function renderPage(name, demand) {
  const path = new URL(
    `packages/core/fireux-core/src/runtime/pages/search-demand/${name}.vue`,
    root
  )
  const { descriptor } = parse(readFileSync(path, 'utf8'), {
    filename: path.pathname,
  })
  const script = compileScript(descriptor, {
    id: `research-${name}`,
    inlineTemplate: true,
  })
  const code = transpileModule(script.content, {
    compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
  }).outputText
  const mod = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports', 'definePageMeta'])(
    (id) =>
      id === '#imports'
        ? {
            useAsyncData: async () => ({
              data: ref({ ok: true, demand }),
              pending: ref(false),
              error: ref(null),
            }),
          }
        : require(id),
    mod,
    mod.exports,
    () => {}
  )
  const app = createSSRApp(mod.exports.default)
  const shell = {
    setup:
      (_, { slots }) =>
      () =>
        h('div', slots.default?.()),
  }
  for (const component of [
    'UPage',
    'UPageBody',
    'UPageHeader',
    'UAlert',
    'UBadge',
    'UButton',
    'AppSearchDemandStageNav',
    'MoleculesStateCard',
    'DevDebugPanel',
    'UNavigationMenu',
    'UIcon',
  ])
    app.component(component, shell)
  app.component('ULink', {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        h('a', { href: props.to }, slots.default?.()),
  })
  return renderToString(app)
}

function fixture() {
  return {
    domain: 'Property maintenance',
    operator: 'Property operators',
    description: 'A second domain with independent evidence and readiness.',
    observations: [
      {
        id: 'maintenance-interview',
        source: 'operator-interview',
        query: 'How are repairs assigned?',
        geography: 'Switzerland',
        language: 'English',
        observed_at: '2026-10-05',
        source_url: 'https://example.com/interview',
        finding: 'An operator describes recurring repair coordination.',
        limitations: 'One interview; no paid adoption validation.',
      },
    ],
    summary: {
      conclusion: 'Test repair coordination.',
      findings: [],
      next_step: 'Validate.',
    },
    analysis: {
      summary: 'Repair work.',
      clusters: [
        {
          id: 'repairs',
          title: 'Repairs',
          operator_job: 'Coordinate repairs',
          intents: ['perform'],
          evidence_queries: [],
          source_observation_ids: ['maintenance-interview'],
          confidence: 'early',
          interpretation: 'A candidate job.',
        },
      ],
      next_step: 'Validate.',
    },
    tools: { summary: 'Candidate tools.', tools: [], next_step: 'Validate.' },
    capabilities: {
      summary: 'Candidate capability.',
      capabilities: [
        {
          id: 'repairs',
          title: 'Repairs',
          decision: 'establish-now',
          source_cluster_ids: ['repairs'],
          source_tool_ids: [],
          rationale: 'A recurring responsibility.',
          assessment: {
            market: {
              confidence: 'strong',
              rationale: 'An established operator job, not paid adoption.',
              validation_gap: 'Paid adoption unknown.',
              source_observation_ids: ['maintenance-interview'],
            },
            implementation: {
              status: 'not-connected',
              assessed_at: '2026-10-05',
              scope: 'No repair workflow is implemented.',
              source_paths: [],
            },
          },
        },
      ],
      next_step: 'Validate.',
    },
  }
}

test('rejects duplicate evidence identities and unresolved cluster or assessment references', () => {
  const duplicate = fixture()
  duplicate.observations.push({ ...duplicate.observations[0] })
  assert.throws(
    () => defineAppSearchDemand(duplicate),
    /Duplicate research observation/
  )
  const cluster = fixture()
  cluster.analysis.clusters[0].source_observation_ids = ['missing']
  assert.throws(
    () => defineAppSearchDemand(cluster),
    /Unknown research observation missing referenced by repairs/
  )
  const capability = fixture()
  capability.capabilities.capabilities[0].assessment.market.source_observation_ids =
    ['missing']
  assert.throws(
    () => defineAppSearchDemand(capability),
    /Unknown research observation missing referenced by repairs/
  )
})

test('existing FireUX and Misebox research remain consumable and serializable', () => {
  for (const demand of [fireux, misebox, ...additionalIndustries]) {
    assert.equal(defineAppSearchDemand(demand), demand)
    assert.equal(JSON.parse(JSON.stringify(demand)).domain, demand.domain)
  }
  assert.ok(
    misebox.observations.some((o) => o.source === 'google-autocomplete')
  )
  assert.ok(misebox.observations.some((o) => o.source === 'operator-survey'))
  for (const capability of misebox.capabilities.capabilities) {
    for (const path of capability.assessment?.implementation.source_paths ?? [])
      assert.ok(existsSync(new URL(path, root)), `${capability.id}: ${path}`)
  }
})

test('domain page retains each source, finding and limitation, including mixed evidence in one group', async () => {
  const demand = fixture()
  demand.observations.push({
    query: 'repair management software',
    source: 'google-autocomplete',
    geography: 'Germany',
    language: 'German',
    observed_at: '2026-08-22',
    note: 'Query wording, not measured volume.',
  })
  const html = await renderPage('index', defineAppSearchDemand(demand))
  for (const text of [
    'Operator interview',
    'Google Autocomplete',
    'Switzerland',
    'Germany',
    '2026-08-22',
    '2026-10-05',
    'One interview; no paid adoption validation.',
    'Query wording, not measured volume.',
    'https://example.com/interview',
  ])
    assert.ok(html.includes(text), text)
})

test('capability decision and strong need evidence cannot imply implementation availability', async () => {
  const html = await renderPage(
    'capabilities',
    defineAppSearchDemand(fixture())
  )
  for (const text of [
    'Need confidence:',
    'strong',
    'Market validation gap:',
    'Paid adoption unknown.',
    'Implementation:',
    'not-connected',
    'No repair workflow is implemented.',
    'https://example.com/interview',
  ])
    assert.ok(html.includes(text), text)
  const demand = fixture()
  delete demand.capabilities.capabilities[0].assessment
  assert.ok(
    (await renderPage('capabilities', demand)).includes(
      'Not assessed by this research.'
    )
  )
})

test('operator-job analysis links direct evidence without requiring a search query cluster', async () => {
  const html = await renderPage('analysis', defineAppSearchDemand(fixture()))
  assert.ok(html.includes('https://example.com/interview'))
  assert.ok(html.includes('How are repairs assigned?'))
})

test('BuenoHost and Granite proposals render ranked needs without converting them into available workflows', async () => {
  for (const demand of additionalIndustries) {
    const ids = new Set(
      demand.observations.map((observation) => observation.id)
    )
    assert.equal(demand.capabilities.capabilities.length, 7)
    assert.equal(
      new Set(
        demand.capabilities.capabilities.map(
          (capability) => capability.priority.rank
        )
      ).size,
      7
    )
    for (const capability of demand.capabilities.capabilities) {
      assert.equal(capability.decision, 'proposed')
      for (const id of capability.assessment.market.source_observation_ids)
        assert.ok(ids.has(id))
      for (const path of capability.assessment.implementation.source_paths)
        assert.ok(existsSync(new URL(path, root)), path)
    }
    const html = await renderPage('capabilities', demand)
    assert.ok(html.includes('Proposed for validation'))
    assert.ok(html.includes('Validation priority 1'))
    assert.ok(html.includes(demand.capabilities.capabilities[0].title))
    const evidence = await renderPage('index', demand)
    assert.ok(evidence.includes('Official statistics'))
    assert.ok(evidence.includes(demand.research_scope.audience))
  }
})
