import assert from 'node:assert/strict'
import test from 'node:test'
import { reviewSearchPlan } from '../runtime/utils/review-search-plan.ts'
import { reconcileIgnition } from '../runtime/utils/reconcile-ignition.ts'

const plan = {
  mode: 'public',
  origin: 'https://tours.example',
  owner: 'tours',
  geography: 'Interlaken',
  languages: ['en'],
  journeys: [
    {
      id: 'ride',
      audience: 'Visitors',
      intent: 'Choose a private ride',
      action: 'Enquire',
      references: ['operator-reviewed brief'],
    },
  ],
  pages: [
    {
      path: '/tours/lake',
      journey: 'ride',
      owner: 'tours',
      index: true,
      sitemap: true,
      title: 'Lake ride',
      description: 'Private guided ride',
    },
  ],
  measurement: {
    status: 'planned',
    owner: 'tours',
    measures: ['Organic clicks'],
  },
}
test('missing search strategy remains visible in ordinary reconciliation', () => {
  const assembly = { id: 'a', elements: [], evidence: [], learnings: [] }
  const brief = {
    id: 'b',
    requirements: [{ id: 'r', need: 'Ride', acceptance: 'Enquire' }],
  }
  assert.equal(
    reconcileIgnition(brief, null, assembly).search.status,
    'missing'
  )
})
test('public policy cannot certify insecure, loopback or credential-bearing origins', () => {
  for (const origin of [
    'http://tours.example',
    'https://localhost',
    'https://127.0.0.1',
    'https://workspace.localhost',
    'https://[::1]',
    'https://user:secret@tours.example',
    'https://tours.example/path',
  ])
    assert.equal(
      reviewSearchPlan({ ...plan, origin }).status,
      'needs-review',
      origin
    )
})
test('preview policy preserves metadata but cannot request index or sitemap inclusion', () => {
  assert.equal(
    reviewSearchPlan({ ...plan, mode: 'preview' }).status,
    'needs-review'
  )
  assert.equal(
    reviewSearchPlan({
      ...plan,
      mode: 'preview',
      pages: plan.pages.map((page) => ({
        ...page,
        index: false,
        sitemap: false,
      })),
    }).status,
    'declared'
  )
})
test('duplicate routes, unknown journeys and sitemap/noindex contradictions need review', () => {
  assert.equal(
    reviewSearchPlan({ ...plan, pages: [...plan.pages, ...plan.pages] }).status,
    'needs-review'
  )
  for (const patch of [
    { journey: 'missing' },
    { path: '//other.example' },
    { path: '/tour?lang=de' },
    { index: false, sitemap: true },
  ])
    assert.equal(
      reviewSearchPlan({ ...plan, pages: [{ ...plan.pages[0], ...patch }] })
        .status,
      'needs-review'
    )
})
test('declared strategy is not live acceptance and measurement needs explicit ownership', () => {
  assert.equal(reviewSearchPlan(plan).status, 'declared')
  assert.equal(
    reviewSearchPlan({
      ...plan,
      measurement: { ...plan.measurement, owner: '' },
    }).status,
    'needs-review'
  )
  assert.equal(
    reviewSearchPlan({
      ...plan,
      journeys: [{ ...plan.journeys[0], references: [] }],
    }).status,
    'needs-review'
  )
})
