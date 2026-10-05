import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createJiti } from 'jiti'
import { createSSRApp, h, ref, reactive, computed } from 'vue'
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

function researchScope(
  route = reactive({ path: '/search-demand/capabilities', query: {} })
) {
  const path = new URL(
    'packages/core/fireux-core/src/runtime/app/composables/search-demand/useAppResearchScope.ts',
    root
  )
  const code = transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
  }).outputText
  const mod = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'])(
    (id) => (id === '#imports' ? { useRoute: () => route } : require(id)),
    mod,
    mod.exports
  )
  return mod.exports.useAppResearchScope
}

function reconciliationComponent(name = 'Reconciliation') {
  const path = new URL(
    `packages/core/fireux-core/src/runtime/app/components/SearchDemand/${name}.vue`,
    root
  )
  const { descriptor } = parse(readFileSync(path, 'utf8'), {
    filename: path.pathname,
  })
  const script = compileScript(descriptor, {
    id: 'research-reconciliation',
    inlineTemplate: true,
  })
  const code = transpileModule(script.content, {
    compilerOptions: { module: ModuleKind.CommonJS, target: 9 },
  }).outputText
  const mod = { exports: {} }
  compileFunction(code, ['require', 'module', 'exports'])(
    require,
    mod,
    mod.exports
  )
  return mod.exports.default
}

async function renderPage(name, demand, scope = '') {
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
        : id.includes('useAppResearchScope')
          ? {
              useAppResearchScope: researchScope(
                reactive({
                  path: '/search-demand/' + name,
                  query: scope ? { scope } : {},
                })
              ),
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
    'AppSearchDemandStageNav',
    'AppSearchDemandBriefNav',
    'MoleculesStateCard',
    'DevDebugPanel',
    'UNavigationMenu',
    'UIcon',
  ])
    app.component(component, shell)
  app.component(
    'AppSearchDemandCapabilitiesReview',
    reconciliationComponent('CapabilitiesReview')
  )
  app.component('AppSearchDemandReconciliation', reconciliationComponent())
  app.component(
    'AppSearchDemandDeliveryBrief',
    reconciliationComponent('DeliveryBrief')
  )
  app.component('UButton', {
    props: ['to'],
    setup:
      (props, { slots }) =>
      () =>
        h(props.to ? 'a' : 'button', { href: props.to }, slots.default?.()),
  })
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

test('domain page retains each source, finding and limitation, across evidence source groups', async () => {
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
    'Evidence of need',
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

const fiveBriefs = [
  fireux,
  misebox,
  misebox.related_research.supplier,
  ...additionalIndustries,
]
test('all five entity briefs have ranked assessments and valid current-source reconciliation', async () => {
  assert.deepEqual(
    new Set(fiveBriefs.map((d) => d.reconciliation.workspace)),
    new Set(['Project', 'Kitchen', 'Supplier', 'Portfolio', 'Property'])
  )
  for (const demand of fiveBriefs) {
    assert.equal(defineAppSearchDemand(demand), demand)
    assert.equal(demand.research_scope.reviewed_at, '2026-10-05')
    const ranked = demand.capabilities.capabilities.filter((c) => c.priority)
    assert.ok(ranked.length > 0)
    assert.equal(
      new Set(ranked.map((c) => c.priority.rank)).size,
      ranked.length
    )
    assert.ok(
      ranked.every((c) => c.assessment && c.assessment.market.validation_gap)
    )
    for (const entry of demand.reconciliation.entries) {
      assert.ok(['keep', 'improve', 'validate', 'defer'].includes(entry.action))
      assert.ok(
        entry.source_paths.length && entry.source_observation_ids.length
      )
      for (const path of entry.source_paths)
        assert.ok(existsSync(new URL(path, root)), `${demand.domain}: ${path}`)
    }
    const html = await renderPage('capabilities', demand)
    assert.ok(html.includes('Current capabilities: what to keep and change'))
    assert.ok(html.includes(demand.reconciliation.summary))
    assert.ok(
      html.includes('It does not mean live operator acceptance has passed.')
    )
  }
})
test('related Supplier research is independently selected and stage links retain its scope', async () => {
  const route = reactive({ path: '/search-demand/capabilities', query: {} })
  const rootDemand = ref(misebox)
  const state = researchScope(route)(rootDemand)
  assert.equal(state.demand.value.domain, misebox.domain)
  route.query.scope = 'supplier'
  assert.equal(
    state.demand.value.domain,
    misebox.related_research.supplier.domain
  )
  assert.deepEqual(state.researchRoute('/search-demand/tools'), {
    path: '/search-demand/tools',
    query: { scope: 'supplier' },
  })
  assert.equal(state.briefs.value.filter((b) => b.active).length, 1)
  assert.equal(state.briefs.value.find((b) => b.active).label, 'Supplier')
  route.query.scope = '__proto__'
  assert.equal(state.demand.value, null)
  route.query.scope = ['supplier', 'unknown']
  assert.equal(state.demand.value, null)
  route.query = {}
  assert.equal(state.demand.value.domain, misebox.domain)
  for (const name of ['index', 'analysis', 'tools', 'capabilities']) {
    const html = await renderPage(name, misebox, 'supplier')
    assert.ok(html.includes('supplier') || html.includes('Supplier'), name)
    assert.ok(!html.includes(misebox.summary.conclusion), name)
  }
})
test('nested evidence and current-capability references cannot silently drift', () => {
  const rootDemand = fixture()
  rootDemand.related_research = { secondary: fixture() }
  rootDemand.related_research.secondary.analysis.clusters[0].source_observation_ids =
    ['missing']
  assert.throws(
    () => defineAppSearchDemand(rootDemand),
    /Unknown research observation/
  )
  const invalid = fixture()
  invalid.reconciliation = {
    workspace: 'Property',
    reviewed_at: '2026-10-05',
    summary: '',
    foundations: [],
    entries: [
      {
        id: 'current',
        title: 'Current',
        action: 'keep',
        status: 'partial',
        rationale: '',
        source_paths: [],
        source_capability_ids: ['unknown'],
        source_observation_ids: ['maintenance-interview'],
      },
    ],
  }
  assert.throws(
    () => defineAppSearchDemand(invalid),
    /Unknown research capability unknown/
  )
})

test('five delivery briefs expose available tools and pending proof without activating proposed routes', async () => {
  for (const demand of fiveBriefs) {
    const brief = demand.reconciliation.first_journey
    assert.ok(
      brief.acceptance.length &&
        brief.gaps.length &&
        brief.tools.length &&
        brief.services.length
    )
    const html = await renderPage('capabilities', demand)
    for (const text of [
      brief.title,
      brief.purpose,
      'Live proof pending',
      'What proves this journey',
      'Still to prove or build',
    ])
      assert.ok(html.includes(text), text)
    for (const entry of [...brief.tools, ...brief.services])
      for (const path of entry.source_paths)
        assert.ok(existsSync(new URL(path, root)), path)
    for (const path of brief.checks)
      assert.ok(existsSync(new URL(path, root)), path)
    for (const page of brief.pages)
      assert.equal(
        html.includes(`href="${page.path}"`),
        page.availability === 'enabled',
        page.path
      )
  }
  const supplier = await renderPage('capabilities', misebox, 'supplier')
  assert.ok(supplier.includes('Supplier offer to one buyer request'))
  assert.ok(supplier.includes('Not enabled in this App'))
  assert.ok(!supplier.includes('href="/workspace/supplier/catalogue"'))
})

test('delivery briefs reject unknown capability identities and unsafe page destinations', () => {
  for (const path of [
    'https://example.com',
    '//example.com',
    '/workspace?redirect=https://example.com',
    '/workspace#tab',
    '/workspace\\unsafe',
  ]) {
    const demand = structuredClone(fireux)
    demand.reconciliation.first_journey.pages[0].path = path
    assert.throws(
      () => defineAppSearchDemand(demand),
      /Delivery page must be an internal route/
    )
  }
  const demand = structuredClone(fireux)
  demand.reconciliation.first_journey.capability_ids.push('invented')
  assert.throws(
    () => defineAppSearchDemand(demand),
    /Unknown delivery capability invented/
  )
})

test('ranked capability definitions separate target responsibilities from implementation and service journeys', async () => {
  for (const demand of fiveBriefs) {
    const ranked = demand.capabilities.capabilities.filter((c) => c.priority)
    for (const capability of ranked) {
      const design = capability.definition
      assert.ok(design?.purpose, `${demand.domain}: ${capability.id}`)
      for (const field of ['manages', 'uses', 'tools', 'boundaries'])
        assert.ok(
          design[field].length && design[field].every((value) => value.trim()),
          field
        )
      assert.ok(design.service_example)
      assert.ok(capability.assessment.implementation.scope)
    }
    const html = await renderPage('capabilities', demand)
    assert.ok(html.includes('What this capability does'))
    assert.ok(html.includes('Tool availability is assessed separately'))
    assert.ok(html.includes('not a released service'))
    assert.ok(html.includes(ranked[0].definition.purpose))
    assert.ok(html.includes('Live proof pending'))
  }
  const menu = misebox.capabilities.capabilities.find((c) => c.id === 'menus')
  assert.ok(menu.definition.tools.includes('Publish or withdraw a menu'))
  assert.match(menu.definition.boundaries.join(' '), /canonical Dish or Recipe/)
  assert.match(menu.definition.service_example, /ordering configuration/)
  assert.equal(
    misebox.capabilities.capabilities.find((c) => c.id === 'orders-service')
      .title,
    'Orders and fulfilment'
  )
})

test('website ordering maps reused configuration to existing capability owners without claiming acceptance', async () => {
  const configuration = misebox.reconciliation.first_journey.configuration
  assert.equal(configuration.length, 5)
  assert.deepEqual(
    configuration.map((c) => c.label),
    [
      'Kitchen and venue identity',
      'Menu offer',
      'Offerings and order policy',
      'Delivery and payment choices',
      'Website installation',
    ]
  )
  for (const entry of configuration) {
    assert.ok(entry.owner && entry.tool && entry.settings.length)
    for (const path of entry.source_paths)
      assert.ok(existsSync(new URL(path, root)), path)
  }
  const html = await renderPage('capabilities', misebox)
  assert.ok(html.includes('Configuration and its owners'))
  assert.ok(html.includes('Kitchen Fulfilment'))
  assert.ok(
    html.includes(
      'Saving configuration does not prove checkout or order delivery.'
    )
  )
  assert.ok(html.includes('Live proof pending'))
})
