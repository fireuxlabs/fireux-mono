// packages/core/fireux-core/src/runtime/models/core/module.model.ts
// Temporary registry model until Firestore-backed registry APIs ship.

export type FireuxModuleStatus = 'active' | 'design' | 'spec'
export type FireuxModuleScope = 'platform' | 'extension' | 'ops'

export interface FireuxModuleRecord {
  id: string
  title: string
  description: string
  status: FireuxModuleStatus
  scope: FireuxModuleScope
  owner: string
  capabilities: string[]
  installs: string[]
}

export interface FireuxModuleRoadmapEntry {
  id: string
  title: string
  summary: string
  owner: string
  status: FireuxModuleStatus
  next: string
}

export type FireuxEcosystemStage = 'active' | 'pilot'

export interface FireuxEcosystemRecord {
  id: string
  name: string
  slug: string
  stage: FireuxEcosystemStage
  owner: string
  modules: string[]
  notes: string
}

export const fireuxModules: FireuxModuleRecord[] = [
  {
    id: 'fireux-core',
    title: 'FireUX Core',
    description:
      'Nuxt + Firebase baseline, auth wiring, env-check endpoints, and shared layout primitives.',
    status: 'active',
    scope: 'platform',
    owner: 'Platform',
    capabilities: ['auth', 'env', 'ui'],
    installs: ['fireux-app', 'cleanbox', 'misebox'],
  },
  {
    id: 'fireux-places',
    title: 'FireUX Places',
    description:
      'Places autocomplete + detail proxy with caching and API key discovery.',
    status: 'active',
    scope: 'extension',
    owner: 'Ecosystem',
    capabilities: ['places', 'maps'],
    installs: ['cleanbox'],
  },
  {
    id: 'fireux-jobs',
    title: 'FireUX Jobs',
    description:
      'Scheduled Nitro jobs, queue helpers, and guard automation presets.',
    status: 'active',
    scope: 'ops',
    owner: 'Automation',
    capabilities: ['jobs', 'cron'],
    installs: ['cleanbox', 'misebox'],
  },
]

export const fireuxModuleRoadmap: FireuxModuleRoadmapEntry[] = [
  {
    id: 'fireux-blog',
    title: 'FireUX Blog',
    summary: 'Content collections, blog listing page, `/api/blog/*` endpoints.',
    owner: 'Platform',
    status: 'design',
    next: 'Scaffold module + registry entry',
  },
  {
    id: 'fireux-products',
    title: 'FireUX Products',
    summary:
      'Catalog components, product inventory sync, Stripe price helpers.',
    owner: 'Commerce',
    status: 'spec',
    next: 'Define product schema + CLI hooks',
  },
]

export const fireuxEcosystems: FireuxEcosystemRecord[] = [
  {
    id: 'cleanbox',
    name: 'Cleanbox',
    slug: 'ops',
    stage: 'active',
    owner: 'Ops Studio',
    modules: [
      'fireux-core',
      'fireux-jobs',
      'fireux-places',
      'fireux-blog',
      'fireux-products',
    ],
    notes: 'Full suite install. Requires Stripe + Places keys.',
  },
  {
    id: 'misebox',
    name: 'Misebox',
    slug: 'kitchen',
    stage: 'active',
    owner: 'Kitchen Studio',
    modules: ['fireux-core', 'fireux-jobs'],
    notes: 'Inventory features only; prefers lightweight surfaces.',
  },
  {
    id: 'richie',
    name: 'Richies',
    slug: 'retail',
    stage: 'pilot',
    owner: 'Retail Studio',
    modules: ['fireux-core', 'fireux-places'],
    notes: 'No blog/products. Watching Places performance.',
  },
]
