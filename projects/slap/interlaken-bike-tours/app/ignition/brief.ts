import type {
  IgnitionBrief,
  IgnitionAssembly,
} from 'fireux-ignite/runtime/models/ignition'
import type { FireuxAppConfig } from 'fireux-core/config/app/types'

import { searchPlan } from './search'

// Configured FireUX identity, consumed by nuxt.config.ts.
export const identity = {
  id: 'interlaken-bike-tours',
  ecosystem: 'slap',
  ecosystemId: 'slap',
  projectId: 'slap',
  name: 'Interlaken Bike Tours',
  shortName: 'Bike Tours',
  role: 'tenant',
  context:
    'A customer-facing prototype replacing the existing Interlaken Bike Tours website. Visitors compare private guided rides, read practical information and prepare an enquiry to Ben through WhatsApp or email. Source: www.interlakenbiketours.com, inspected 2026-10-21. No live availability, payments, booking persistence or operator Workspace is implemented. Tour facts require operator review before release.',
} satisfies FireuxAppConfig

export const brief = {
  id: 'interlaken-bike-tours-prototype',
  industry: 'Private guided cycling tours',
  outcome:
    'Help a visitor choose a suitable ride and prepare a direct enquiry to the guide.',
  actors: ['Visitor', 'Local guide'],
  search: searchPlan,
  requirements: [
    {
      id: 'search',
      need: 'Present useful ride information through consistent search metadata without indexing the prototype.',
      acceptance:
        'Rendered pages use the reviewed prototype origin, route-specific metadata and noindex policy; sitemaps exclude preview pages.',
    },
    {
      id: 'compare',
      need: 'Compare the three advertised rides.',
      acceptance:
        'Each ride exposes published duration, starting price and a detail link.',
    },
    {
      id: 'details',
      need: 'Understand ride suitability.',
      acceptance:
        'Detail pages show sourced facts; unverified route metrics remain absent.',
    },
    {
      id: 'enquire',
      need: 'Discuss a ride, rental or bespoke trip.',
      acceptance:
        'Visitor choices produce an encoded WhatsApp or email draft without sending or storing it.',
    },
  ],
} satisfies IgnitionBrief

export const assembly = {
  id: brief.id,
  elements: [
    {
      id: 'search',
      role: 'capability',
      owner: 'interlaken-bike-tours → fireux-core',
      requirements: ['search'],
      uses: [],
      sourcePaths: [
        'app/ignition/search.ts',
        'nuxt.config.ts',
        'tests/seo.test.mjs',
      ],
    },
    {
      id: 'rides',
      role: 'surface',
      owner: 'interlaken-bike-tours',
      requirements: ['compare'],
      uses: [],
      sourcePaths: ['app/components/Landing/Rides.vue', 'app/content/tours.ts'],
    },
    {
      id: 'detail',
      role: 'surface',
      owner: 'interlaken-bike-tours',
      requirements: ['details'],
      uses: ['rides'],
      sourcePaths: ['app/pages/tours/[slug].vue'],
    },
    {
      id: 'enquiry',
      role: 'tool',
      owner: 'interlaken-bike-tours',
      requirements: ['enquire'],
      uses: ['rides'],
      sourcePaths: ['app/components/Landing/Enquiry.vue'],
    },
  ],
  evidence: [
    {
      requirement: 'search',
      level: 'checks-passed',
      observation:
        'Production output and the deployed prototype pass rendered canonical, route metadata, noindex, sitemap exclusion, missing-route and manifest checks. Search indexation and performance remain unverified.',
      references: [
        'tests/seo.test.mjs',
        'https://interlaken-bike-tours-prototype.web.app',
      ],
    },
  ],
  learnings: [
    {
      decision:
        'Compose the branded prototype on the native FireUX Core, Slap and Blogs layers.',
      reason:
        'Core owns shared runtime, Firebase integration, configured App initialization and the PWA manifest. App-owned tour content and enquiry drafts add no booking storage or authority.',
      owner: 'interlaken-bike-tours',
      references: ['nuxt.config.ts', 'app/ignition/brief.ts'],
    },
    {
      decision: 'Keep tour-specific presentation in this App.',
      reason:
        'Yellow Velo is a composition reference, not a shared tour-booking domain. No second proven tour consumer supports extracting a library.',
      owner: 'interlaken-bike-tours',
      references: ['app/components/Landing/Rides.vue'],
    },
  ],
} satisfies IgnitionAssembly
