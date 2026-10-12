import {
  sharedArchitectureContracts,
  type ComparisonObservation,
  type IgnitionIndustryCase,
  type IgnitionIndustryComparison,
} from 'fireux-ignite/runtime/models/industry-comparison'
const core = 'packages/core/fireux-core/src/runtime/'
const kitchens = 'packages/extensions/fireux-kitchens/src/runtime/'
const properties = 'packages/extensions/fireux-properties/src/runtime/'
const reservations = 'packages/extensions/fireux-reservations/src/runtime/'
const project = 'packages/ecosystem/fireux-fireux/src/runtime/project/'
function coverage(
  level: ComparisonObservation['level'],
  references: readonly string[],
  note: string
): IgnitionIndustryCase['contracts'] {
  return Object.fromEntries(
    Object.keys(sharedArchitectureContracts).map((key) => [
      key,
      { level, references, note },
    ])
  )
}
export const miseboxIndustry: IgnitionIndustryCase = {
  id: 'misebox',
  name: 'Misebox',
  kind: 'reference',
  contracts: {
    ...coverage(
      'source-reviewed',
      [
        'projects/misebox/misebox-app/nuxt.config.ts',
        core + 'layouts/workspace.vue',
        kitchens + 'kitchen/models/kitchen.model.ts',
      ],
      'Architecture mapped from the current App and domain source; this is not complete journey acceptance.'
    ),
    ecosystem: {
      level: 'source-reviewed',
      references: [
        'projects/misebox/misebox-app/nuxt.config.ts',
        'projects/misebox/baeren-ringgenberg/nuxt.config.ts',
      ],
      note: 'Main and branded tenant Apps declare the same ecosystem and consume shared domain packages.',
    },
    services: {
      level: 'partial',
      references: [
        kitchens + 'menu/server/ordering/create.ts',
        kitchens + 'kitchen/components/Ordering/Setup.vue',
      ],
      note: 'Ordering orchestration exists; configurable product services are not yet a generic assembled-service library.',
    },
  },
  domain: {
    workspaceEntity: 'Kitchen',
    managedInformation: 'Menus, food definitions and offering policies',
    operationalRecord: 'Order',
    serviceOutcome: 'Collection ordering',
  },
}
const grooming: IgnitionIndustryCase = {
  id: 'dog-grooming',
  name: 'Dog grooming',
  kind: 'proposal',
  contracts: coverage(
    'proposed',
    [],
    'Mapped from the user-supplied dog-grooming brief. No grooming App or generated implementation exists yet.'
  ),
  domain: {
    workspaceEntity: 'Salon',
    managedInformation: 'Pets, treatments, staff skills and resource policies',
    operationalRecord: 'Appointment',
    serviceOutcome: 'Book and fulfil a grooming appointment',
  },
}
const granite: IgnitionIndustryCase = {
  id: 'granite',
  name: 'Granite',
  kind: 'reference',
  contracts: {
    ...coverage(
      'source-reviewed',
      [
        'projects/granite/granite-app/nuxt.config.ts',
        properties + 'portfolio/models/portfolio.model.ts',
        properties + 'portfolio/models/capabilities.ts',
      ],
      'Portfolio Workspace and package composition are present; this review does not prove every capability is complete.'
    ),
    ecosystem: {
      level: 'partial',
      references: ['projects/granite/granite-app/nuxt.config.ts'],
      note: 'Main App exists. The current projects inventory contains no branded Granite tenant App; shared App roles alone do not prove one has shipped.',
    },
    services: {
      level: 'partial',
      references: [properties + 'portfolio/models/capabilities.ts'],
      note: 'Domain capabilities exist; a complete assembled Portfolio service is not established by this source map.',
    },
  },
  domain: {
    workspaceEntity: 'Portfolio',
    managedInformation: 'Properties, clients, compliance, documents and tasks',
    operationalRecord: 'Task or compliance record',
    serviceOutcome: 'Manage a property portfolio',
  },
}
const buenohost: IgnitionIndustryCase = {
  id: 'buenohost',
  name: 'BuenoHost',
  kind: 'reference',
  contracts: {
    ...coverage(
      'source-reviewed',
      [
        'projects/buenohost/buenohost-app/nuxt.config.ts',
        properties + 'property/models/property.model.ts',
        reservations + 'property/models/reservation.model.ts',
      ],
      'Property Workspace and reservation behaviour are present; no end-to-end booking acceptance is claimed here.'
    ),
    ecosystem: {
      level: 'source-reviewed',
      references: [
        'projects/buenohost/buenohost-app/nuxt.config.ts',
        'projects/buenohost/ausfinn-apartments/nuxt.config.ts',
      ],
      note: 'Main and branded tenant Apps consume the same Property and Reservation owners.',
    },
    services: {
      level: 'partial',
      references: [reservations + 'property/server/reservations/command.ts'],
      note: 'Reservation commands allocate Property nights. This is not a general multiple-resource appointment scheduler.',
    },
  },
  domain: {
    workspaceEntity: 'Property',
    managedInformation:
      'Property identity, guest information and booking policies',
    operationalRecord: 'Reservation',
    serviceOutcome: 'Reserve and manage a stay',
  },
}
const fireux: IgnitionIndustryCase = {
  id: 'fireux',
  name: 'FireUX',
  kind: 'reference',
  contracts: {
    ...coverage(
      'source-reviewed',
      [
        'projects/fireux/fireux-app/nuxt.config.ts',
        project + 'components/Workspace/Identity/Read.vue',
        project + 'server/authority.ts',
      ],
      'Project Workspace and explicit domain authority exist. App intake and structural reconciliation do not prove app generation.'
    ),
    ecosystem: {
      level: 'source-reviewed',
      references: [
        'projects/fireux/fireux-app/nuxt.config.ts',
        'projects/fireux/tenant/nuxt.config.ts',
      ],
      note: 'Main and tenant roles exist. FireUX Main is the accepted Workspace-first entrance exception.',
    },
    services: {
      level: 'partial',
      references: [
        'packages/extensions/fireux-ignite/src/runtime/utils/reconcile-ignition.ts',
      ],
      note: 'The reusable Ignition foundation exists; an independent generated sibling has not been accepted.',
    },
  },
  domain: {
    workspaceEntity: 'Project',
    managedInformation: 'Apps, ecosystem relationships and project team',
    operationalRecord: 'App ignition request or delivery record',
    serviceOutcome: 'Ignite and organise a SaaS ecosystem',
  },
}
export const industryComparisons: readonly IgnitionIndustryComparison[] = [
  {
    id: 'misebox-dog-grooming',
    baseline: miseboxIndustry,
    candidate: grooming,
    deltas: [
      {
        id: 'brand',
        kind: 'configuration',
        title: 'Industry and brand presentation',
        baseline: 'Food-service Main App and Kitchen brands',
        candidate: 'Grooming Main App and Salon brands',
        reason:
          'The existing App/Ecosystem configuration and brand seams already express this substitution.',
        reuse: 'existing-source',
        references: [
          'projects/misebox/misebox-app/nuxt.config.ts',
          'projects/misebox/baeren-ringgenberg/nuxt.config.ts',
        ],
        acceptance:
          'Two Salon brands consume the same domain implementation with distinct presentation and bounded access.',
      },
      {
        id: 'composition',
        kind: 'composition',
        title: 'Assemble a different operator journey',
        baseline: 'Identity → Menu → Offering → Order → pickup',
        candidate:
          'Identity → Pet → Treatment → Appointment → grooming → pickup',
        reason:
          'The structural responsibilities match, while the business objects and service composition differ. New grooming components must be supplied where no current owner exists.',
        reuse: 'partial-source',
        references: [
          core + 'layouts/workspace.vue',
          kitchens + 'kitchen/components/Workspace/GroupIndex.vue',
          properties + 'property/models/property.model.ts',
        ],
        acceptance:
          'The Salon Workspace and customer surface compose their owning capabilities without duplicating storage or authority.',
      },
      {
        id: 'resources',
        kind: 'new-behaviour',
        title: 'Reserve staff and physical resources together',
        baseline:
          'Ordering windows and Kitchen Stations; Property-night allocation exists elsewhere in the repo',
        candidate:
          'A timed appointment reserves an eligible groomer and tub together',
        reason:
          'Misebox Stations do not allocate timed capacity. BuenoHost atomically reserves one Property per night; grooming adds simultaneous resources, duration, staff skills and expiring holds.',
        reuse: 'partial-source',
        references: [
          kitchens + 'menu/server/ordering/schedule.ts',
          kitchens + 'kitchen/models/station.model.ts',
          reservations + 'property/server/reservations/command.ts',
        ],
        acceptance:
          'Concurrent bookings cannot claim the same groomer or tub; expired holds and cancellations release every allocation consistently.',
      },
      {
        id: 'pets',
        kind: 'new-behaviour',
        title: 'Portable customer-owned Pet information',
        baseline:
          'User identity, App membership and domain-scoped customer/order information',
        candidate:
          'A Pet profile and authorised grooming history usable across Salon Apps',
        reason:
          'A shared login is reusable; a Pet model, customer ownership and cross-Salon disclosure policy are not established by shared authentication.',
        reuse: 'needs-implementation',
        references: ['docs/ai/account-connections-context.md'],
        acceptance:
          'The owner can reuse a Pet profile, while a Salon only reads or writes information authorised for its work.',
      },
      {
        id: 'pricing',
        kind: 'new-behaviour',
        title: 'Treatment eligibility, duration and price rules',
        baseline: 'Menu item pricing and server-validated order totals',
        candidate:
          'Treatment rules depend on breed, weight and reviewed grooming adjustments',
        reason:
          'Server-calculated totals and policy snapshots are reusable principles; the current menu calculation does not implement breed/weight pricing or treatment-duration rules.',
        reuse: 'partial-source',
        references: [
          kitchens + 'menu/server/ordering/create.ts',
          kitchens + 'menu/server/ordering/commit-guard.ts',
        ],
        acceptance:
          'The server produces a reproducible quote and duration; a later adjustment is recorded and presented explicitly rather than silently changing the agreed price.',
      },
      {
        id: 'sms',
        kind: 'new-behaviour',
        title: 'Appointment reminders and pickup notifications',
        baseline: 'Kitchen order notifications and WhatsApp integration',
        candidate: 'Appointment lifecycle notifications through SMS',
        reason:
          'Existing notification work informs the boundary, but an SMS adapter, recipient policy and appointment triggers still need implementation.',
        reuse: 'partial-source',
        references: [kitchens + 'kitchen/server/ordering/whatsapp.ts'],
        acceptance:
          'Notifications reach the authorised recipient once for the intended appointment event, with retry/failure state visible.',
      },
    ],
  },
  {
    id: 'misebox-granite',
    baseline: miseboxIndustry,
    candidate: granite,
    deltas: [
      {
        id: 'portfolio',
        kind: 'composition',
        title: 'Compose a Portfolio from separately owned records',
        baseline: 'Kitchen with menus, food records and orders',
        candidate:
          'Portfolio linked to Property, compliance, document and task capabilities',
        reason:
          'The library already contains these domain owners. Reuse their composition instead of renaming Kitchen records into portfolio records.',
        reuse: 'existing-source',
        references: [
          'projects/granite/granite-app/nuxt.config.ts',
          properties + 'portfolio/models/capabilities.ts',
          properties + 'property/models/property.model.ts',
        ],
        acceptance:
          'Portfolio navigation coordinates the selected records while Property retains its identity and authority.',
      },
      {
        id: 'granite-tenants',
        kind: 'configuration',
        title: 'App pattern versus delivered instances',
        baseline: 'Main and branded tenant Apps are present',
        candidate:
          'Main App is present; branded Granite tenant App is not in the current inventory',
        reason:
          'Matching the ecosystem contract must not hide an implementation/adoption gap.',
        reuse: 'partial-source',
        references: ['projects/granite/granite-app/nuxt.config.ts'],
        acceptance:
          'A concrete Granite tenant configuration and scoped user journey are verified before tenant delivery is claimed.',
      },
    ],
  },
  {
    id: 'misebox-buenohost',
    baseline: miseboxIndustry,
    candidate: buenohost,
    deltas: [
      {
        id: 'stay',
        kind: 'composition',
        title: 'Compose reservations rather than food orders',
        baseline: 'Menu ordering and Kitchen operational records',
        candidate: 'Property-scoped Reservations and occupied nights',
        reason:
          'The existing reservation package supplies a materially different operation with the same ownership and Workspace principles.',
        reuse: 'existing-source',
        references: [
          reservations + 'property/models/reservation.model.ts',
          reservations + 'property/server/reservations/command.ts',
        ],
        acceptance:
          'A reservation claims its Property nights atomically, and cancellation releases the appropriate allocations.',
      },
    ],
  },
  {
    id: 'misebox-fireux',
    baseline: miseboxIndustry,
    candidate: fireux,
    deltas: [
      {
        id: 'entrance',
        kind: 'configuration',
        title: 'Workspace-first Main App entrance',
        baseline:
          'Directory entrance and dedicated operator Workspace entrance',
        candidate: 'Project Workspace first, with secondary exploration',
        reason:
          'The surface contract remains shared; FireUX explicitly chooses a different primary arrival purpose.',
        reuse: 'existing-source',
        references: [
          'projects/misebox/misebox-app/nuxt.config.ts',
          'projects/fireux/fireux-app/app/pages/index.vue',
        ],
        acceptance:
          'Creators reach their working area directly; secondary discovery remains available without a second identity or role mode.',
      },
      {
        id: 'project',
        kind: 'composition',
        title: 'Project management rather than food operations',
        baseline: 'Kitchen capabilities and ordering workflow',
        candidate: 'Project-owned App, ecosystem and Team composition',
        reason:
          'Project is another Workspace Entity with domain-owned actions, not a renamed Kitchen or a universal CRUD bag.',
        reuse: 'existing-source',
        references: [
          project + 'server/authority.ts',
          project + 'components/Workspace/Identity/Read.vue',
        ],
        acceptance:
          'Project actions retain explicit domain authority and do not grant cross-ecosystem editing through a directory read.',
      },
      {
        id: 'generation',
        kind: 'new-behaviour',
        title: 'Executable Ignition builder',
        baseline: 'Misebox was built by the FireUX developers',
        candidate:
          'An independent brief produces a working sibling through Ignition',
        reason:
          'Intake, declared assembly comparisons and source review are present; automated implementation and independent acceptance remain missing.',
        reuse: 'needs-implementation',
        references: [
          'packages/extensions/fireux-ignite/src/runtime/utils/reconcile-ignition.ts',
        ],
        acceptance:
          'A sibling is assembled and its complete user journey verified without relying on Misebox-specific names or hidden developer corrections.',
      },
    ],
  },
]
