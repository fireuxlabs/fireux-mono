import type {
  IgnitionBrief,
  IgnitionAssembly,
} from 'fireux-ignite/runtime/models/ignition'
import type { FireuxAppConfig } from 'fireux-app/config'

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
  modules: ['fireux-businesses', ['fireux-bookings', { businessWorkspace: true }]],
  context:
    'A customer-facing prototype for premium private guided rides. Visitors can check the configured departure against working days, closed dates and Ben’s Google Calendar and confirm one private tour per day at the catalog price per person; the App stores a booking record and the shared FireUX Bookings package owns confirmation orchestration and Calendar transport. The Business Workspace provides profile/contact details, linked locations, a Team roster, availability settings and private booking records. Public bookings require a server-configured Business id and Calendar credentials. No payment, outbound confirmation email or cancellation flow is implemented. Prices and operating capacity require operator review before release.',
} satisfies FireuxAppConfig

export const brief = {
  id: 'interlaken-bike-tours-prototype',
  industry: 'Private guided cycling tours',
  outcome:
    'Help a visitor choose a private ride, see its price and availability, and confirm a booking directly.',
  actors: ['Visitor', 'Local guide'],
  search: searchPlan,
  requirements: [
    { id: 'manage-bookings', need: 'Manage Business availability and review customer bookings.', acceptance: 'Current Business access protects working days, closed dates, departure time and paged booking records. Public booking checks the saved policy and rejects changed checkout availability.' },
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
    {
      id: 'book',
      need: 'Choose an advertised private tour and confirm an available date at its fixed catalog price.',
      acceptance:
        'The App checks its daily booking lock and Ben’s Google Calendar, writes one confirmed booking, inserts the Calendar event, and returns an immediate on-screen confirmation. Conflicts do not create a second confirmed booking.',
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
    {
      id: 'booking',
      role: 'capability',
      owner: 'interlaken-bike-tours → fireux-bookings',
      requirements: ['book', 'manage-bookings'],
      uses: ['rides'],
      sourcePaths: [
        'app/pages/book.vue',
        'server/api/bookings/',
        'server/utils/tour-booking.ts',
        'server/utils/tour-booking-store.ts',
      ],
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
        'Compose the branded prototype with fireux-app and Slap. The App bundle includes Core, Blogs and Products.',
      reason:
        'The fireux-app bundle supplies Blogs and Products. Tour catalogue and enquiry framing stay App-owned; Business booking storage and management are composed from fireux-bookings.',
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
    {
      decision:
        'Use FireUX Bookings for server-side Google Calendar transport.',
      reason:
        'The App owns tour slots, pricing, booking records, confirmation and recovery; FireUX Bookings owns server-side Google Calendar transport and OAuth token refresh only.',
      owner: 'interlaken-bike-tours → fireux-bookings',
      references: [
        'server/utils/tour-calendar.ts',
        'packages/extensions/fireux-bookings/src/runtime/server/google-calendar.ts',
      ],
    },
  ],
} satisfies IgnitionAssembly
