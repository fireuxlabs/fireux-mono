// Current source references identify the rebuilt ordering boundary; provider payment and dispatch remain separate.
import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const kitchenReconciliation = {
  first_journey: {
    title: 'Reviewed Menu to one fulfilled order',
    purpose:
      'Let a Kitchen operator publish an accurate offer and receive, confirm and fulfil an order from the same Kitchen.',
    capability_ids: ['menus', 'orders-service'],
    configuration: [
      {
        label: 'Kitchen and venue identity',
        owner: 'Kitchen Identity, using Place-owned venue information',
        settings: ['Kitchen currency', 'Venue address and timezone'],
        tool: 'Review and edit Kitchen identity',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Identity/Index.vue',
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/identity/useKitchenWorkspacePlace.ts',
        ],
      },
      {
        label: 'Menu offer',
        owner: 'Menus, preserving Menu and KitchenMenu identity',
        settings: [
          'Items, sections and selling prices',
          'Reviewed publication state',
        ],
        tool: 'Edit and publish a Menu',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus/Index.vue',
          'packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/publish.ts',
        ],
      },
      {
        label: 'Offerings and order policy',
        owner:
          'Kitchen Orders configuration; named offerings are not service-layer workflows',
        settings: [
          'Eligible Menu IDs and explicit serving hours',
          'Collection, delivery or pre-order availability',
          'Preparation time, scheduling, required customer details and handoff instructions',
        ],
        tool: 'Configure a named offering and its ordering interaction',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/offering.model.ts',
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/ordering.model.ts',
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/offerings/configure.ts',
        ],
      },
      {
        label: 'Delivery and payment choices',
        owner: 'Kitchen Fulfilment',
        settings: [
          'Delivery zones, fees and minimum order values',
          'Payment methods permitted for each order type',
        ],
        tool: 'Edit delivery zones and payment methods',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/fulfilment.model.ts',
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/core/fulfilment-update.ts',
        ],
      },
      {
        label: 'Website installation',
        owner: 'Kitchen Integrations',
        settings: [
          'Allowed website origins',
          'Ordering button and customer entrance derived from current Kitchen context',
        ],
        tool: 'Allow a website and copy its ordering button',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/integrations/website-ordering.ts',
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Integrations/WebsiteOrdering.vue',
        ],
      },
    ],
    pages: [
      {
        label: 'Menus',
        path: '/workspace/kitchen/menus',
        availability: 'enabled',
      },
      {
        label: 'Ordering setup',
        path: '/services/ordering/setup',
        availability: 'enabled',
      },
      {
        label: 'Incoming orders',
        path: '/workspace/kitchen/orders/board',
        availability: 'enabled',
      },
    ],
    tools: [
      {
        label: 'Edit and publish Menu',
        status: 'connected',
        owner: 'Kitchen / Menu',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus/Publish.vue',
        ],
      },
      {
        label: 'Configure ordering from either entrance',
        status: 'connected',
        owner: 'Kitchen',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Orders/Channels.vue',
        ],
      },
      {
        label: 'Confirm and fulfil an order',
        status: 'connected',
        owner: 'Kitchen',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/submission.ts',
        ],
      },
    ],
    services: [
      {
        label: 'Validate Menu and publish its public doorway atomically',
        status: 'connected',
        owner: 'Menu',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/publish.ts',
        ],
      },
      {
        label: 'Create one scoped order with retry protection',
        status: 'connected',
        owner: 'Menu / Kitchen',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/submission.ts',
        ],
      },
      {
        label: 'Apply order lifecycle and return customer responses',
        status: 'connected',
        owner: 'Kitchen',
        source_paths: [
          'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/submission.ts',
        ],
      },
    ],
    acceptance: [
      'Both setup entrances retain the chosen Kitchen, Menu and configuration after reload; no duplicate configuration is created.',
      'A customer order arrives once with canonical items, total and supplied fulfilment context.',
      'The operator confirms, prepares, marks ready and completes the same order; the customer response and board agree. Sale creation and payment execution remain separate.',
      'Account, Kitchen or Menu changes prevent stale pending publication from dispatching or showing success on a different record.',
    ],
    gaps: [
      'Controlled source checks cover submission, retries and responses; published provider readiness remains separate from local browser verification.',
      'Daily-menu public browsing, publication scheduling and multiple publication destinations are not delivered.',
      'Payment choice is not payment receipt, and simulated printing is not physical-printer proof.',
      'No copied service-setup configuration or completion flags are needed. Existing capability settings remain authoritative; live delivery is still unproved.',
    ],
    checks: [
      'packages/extensions/fireux-kitchens/src/test/menu-publication.test.mjs',
      'packages/extensions/fireux-kitchens/src/test/menu-publication-client.test.mjs',
      'packages/extensions/fireux-kitchens/src/test/kitchen/ordering-setup.test.mjs',
      'packages/extensions/fireux-kitchens/src/test/kitchen/order-submission.test.mjs',
    ],
  },
  workspace: 'Kitchen',
  reviewed_at: '2026-10-14',
  summary:
    'Keep the Ingredient–Recipe–Menu and ordering chain. Validate unconnected stock, preparation and safety workflows instead of assuming every navigation page is a product. Hotel Bären ordering is the current client delivery priority, distinct from general industry validation.',
  foundations: [
    'Home and selection, Overview, Identity and Team are shared responsibilities with domain-owned access.',
    'Calendar and AI availability need their own connected sources; a page is not proof of a workflow.',
    'Test is a development surface. Industry research does not change operator access.',
  ],
  entries: [
    {
      id: 'menus',
      title: 'Menus',
      action: 'improve',
      status: 'connected',
      rationale:
        'Keep editing and publication; prove the operator-to-customer ordering handoff and accurate food information.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus/Index.vue',
        'packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/publish.ts',
      ],
      source_capability_ids: ['menus'],
      source_observation_ids: ['swiss-chef-work', 'swiss-allergens'],
    },
    {
      id: 'dishes',
      title: 'Dishes',
      action: 'keep',
      status: 'connected',
      rationale:
        'Keep menu-ready food records; do not equate a Dish with a costed Recipe.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Dishes/Index.vue',
      ],
      source_capability_ids: ['dishes'],
      source_observation_ids: ['swiss-chef-work'],
    },
    {
      id: 'drinks',
      title: 'Drinks',
      action: 'keep',
      status: 'connected',
      rationale:
        'Keep the owned drinks presentation and commands while sharing supported Dish mechanics.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/food/drinks/index.vue',
      ],
      source_capability_ids: ['drinks'],
      source_observation_ids: ['swiss-chef-work'],
    },
    {
      id: 'ingredients',
      title: 'Ingredients',
      action: 'improve',
      status: 'partial',
      rationale:
        'Keep Ingredient records; authoritative quantities, units, packs and prices are separate proofs needed for costing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/food/ingredients/index.vue',
      ],
      source_capability_ids: ['ingredients', 'recipes-costing'],
      source_observation_ids: ['swiss-chef-work', 'swiss-allergens'],
    },
    {
      id: 'recipes',
      title: 'Recipes and costing',
      action: 'improve',
      status: 'partial',
      rationale:
        'Keep recipe editing and scaling; prove units, yields and purchase-price inputs before claiming authoritative cost or margin.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Recipes/Index.vue',
      ],
      source_capability_ids: ['recipes-costing'],
      source_observation_ids: ['swiss-chef-work'],
    },
    {
      id: 'orders',
      title: 'Orders and service sessions',
      action: 'improve',
      status: 'connected',
      rationale:
        'Prove one client order through operator confirmation, fulfilment and saved sales evidence; a service session is not the architectural service layer.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/index.vue',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/channels/index.vue',
      ],
      source_capability_ids: ['orders-service'],
      source_observation_ids: ['independent-operators-2026'],
    },
    {
      id: 'prep',
      title: 'Prep and batches',
      action: 'validate',
      status: 'not-connected',
      rationale:
        'Prep creation primitives do not establish connected planning or batch execution. Validate daily preparation work before joining them.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Index.vue',
      ],
      source_capability_ids: ['mise-production'],
      source_observation_ids: ['swiss-chef-work'],
    },
    {
      id: 'stations',
      title: 'Stations',
      action: 'keep',
      status: 'partial',
      rationale:
        'Keep named work stations as supporting Kitchen configuration; prove the effect on order routing before promising a production board.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stations/index.vue',
      ],
      source_capability_ids: ['stations', 'orders-service'],
      source_observation_ids: ['swiss-chef-work'],
    },
    {
      id: 'suppliers',
      title: 'Supplier relationships',
      action: 'improve',
      status: 'partial',
      rationale:
        'Keep buyer relationships; supplier commercial offers, order acceptance and delivery remain Supplier-side responsibilities.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Suppliers/SupplyOptions.vue',
      ],
      source_capability_ids: ['suppliers'],
      source_observation_ids: ['purchasing-workflows'],
    },
    {
      id: 'waste',
      title: 'Waste recording',
      action: 'improve',
      status: 'partial',
      rationale:
        'Keep observed waste records; add measurable usage and cost evidence before claiming stock adjustments or savings.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Waste/Create.vue',
      ],
      source_capability_ids: ['waste'],
      source_observation_ids: ['waste-measurement-case'],
    },
    {
      id: 'food-safety',
      title: 'Food Safety',
      action: 'validate',
      status: 'not-connected',
      rationale:
        'The current pages are unconnected. Validate checks, corrective actions, records and procedures; product references are not an approved safety plan.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/FoodSafety/Index.vue',
      ],
      source_capability_ids: ['food-safety'],
      source_observation_ids: ['swiss-self-control', 'swiss-allergens'],
    },
    {
      id: 'inventory',
      title: 'Stock balances',
      action: 'validate',
      status: 'not-connected',
      rationale:
        'Observe stock counts and movements; do not manufacture balances from catalogue records.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/inventory/index.vue',
      ],
      source_capability_ids: ['inventory'],
      source_observation_ids: ['inventory-workflows'],
    },
    {
      id: 'purchasing',
      title: 'Purchasing',
      action: 'validate',
      status: 'not-connected',
      rationale:
        'Observe buyer approvals and current supplier ordering before building transmission.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/purchasing/index.vue',
      ],
      source_capability_ids: ['purchasing'],
      source_observation_ids: ['purchasing-workflows'],
    },
    {
      id: 'receiving',
      title: 'Receiving',
      action: 'validate',
      status: 'not-connected',
      rationale:
        'Validate receipt checks and their effects on stock and supplier discrepancies.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/receiving/index.vue',
      ],
      source_capability_ids: ['receiving'],
      source_observation_ids: ['purchasing-workflows', 'swiss-self-control'],
    },
    {
      id: 'reports',
      title: 'Sales and operational reports',
      action: 'improve',
      status: 'partial',
      rationale:
        'Keep completed-sales summaries. Cost, waste and performance reports must wait for their authoritative producers.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Finance/Overview.vue',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/costs/index.vue',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/performance/index.vue',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/waste-report/index.vue',
      ],
      source_capability_ids: ['reports'],
      source_observation_ids: ['independent-operators-2026'],
    },
    {
      id: 'tables',
      title: 'Tables and open tabs',
      action: 'defer',
      status: 'not-connected',
      rationale:
        'Retain the explicit boundary. Full front-of-house is not established by Kitchen ordering.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Tables/Write.vue',
      ],
      source_capability_ids: ['front-of-house'],
      source_observation_ids: ['swiss-chef-work'],
    },
    {
      id: 'settings',
      title: 'Offer and operating configuration',
      action: 'keep',
      status: 'partial',
      rationale:
        'Appearance, hours, channels, fulfilment choices and integrations support named use cases; do not turn each setting into an invented business capability.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/settings/index.vue',
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/offering-options.ts',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/settings/integrations.vue',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/identity/payments.vue',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/channels/index.vue',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/qr.vue',
      ],
      source_capability_ids: ['menus', 'orders-service'],
      source_observation_ids: ['swiss-chef-work'],
    },
  ],
} satisfies NonNullable<AppSearchDemand['reconciliation']>
