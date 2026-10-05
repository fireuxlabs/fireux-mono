import type { ResearchCapabilityAssessment } from 'fireux-core/config/app/search-demand'

export const capabilityAssessments: Record<
  string,
  ResearchCapabilityAssessment
> = {
  'food-safety': {
    market: {
      confidence: 'strong',
      rationale:
        'Safety is a consequential operator responsibility. This does not establish demand for a separate compliance application.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: ['swiss-self-control', 'swiss-allergens'],
    },
    implementation: {
      status: 'not-connected',
      assessed_at: '2026-10-05',
      scope:
        'Safety check, record, corrective-action and procedure pages explicitly report unconnected sources. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/FoodSafety/Index.vue',
      ],
    },
  },
  menus: {
    market: {
      confidence: 'strong',
      rationale:
        'Menu planning and customer offer management are established jobs; acquisition benefit from Misebox remains unmeasured.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: [
        'swiss-demand-2026',
        'swiss-chef-work',
        'swiss-allergens',
      ],
    },
    implementation: {
      status: 'connected',
      assessed_at: '2026-10-05',
      scope:
        'Menu editing and publication have source-connected UI and commands. Complete operator/customer acceptance and food-information handling remain separate proofs. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menus/Index.vue',
        'packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/publish.ts',
      ],
    },
  },
  'orders-service': {
    market: {
      confidence: 'moderate',
      rationale:
        'Accessible ordering and reliable fulfilment fit the initial product direction; existing POS/channel fit remains unvalidated.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: [
        'swiss-demand-2026',
        'independent-operators-2026',
      ],
    },
    implementation: {
      status: 'connected',
      assessed_at: '2026-10-05',
      scope:
        'Both setup entrances reuse configuration. Order lifecycle and Sale creation exist; actual Stock/Production integration and live operational acceptance remain unproved. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Ordering/Setup.vue',
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/services/configure.ts',
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/orders/actions.ts',
      ],
    },
  },
  inventory: {
    market: {
      confidence: 'strong',
      rationale:
        'Physical holdings and counting are established work. Sustainable data-entry effort and paid adoption remain unknown.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: ['swiss-chef-work', 'inventory-workflows'],
    },
    implementation: {
      status: 'not-connected',
      assessed_at: '2026-10-05',
      scope:
        'Stock explicitly reports no connected balances or movements. Ingredient identity is not a stock holding. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/inventory/index.vue',
      ],
    },
  },
  'recipes-costing': {
    market: {
      confidence: 'moderate',
      rationale:
        'Cost pressure and recipe work support investigation; vendor pricing is not demonstrated willingness to pay.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: [
        'independent-operators-2026',
        'swiss-chef-work',
        'inventory-workflows',
      ],
    },
    implementation: {
      status: 'partial',
      assessed_at: '2026-10-05',
      scope:
        'Recipe definitions exist; actual batches, purchase-price inputs and authoritative cost reporting are unconnected. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/recipe.model.ts',
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Prep/Index.vue',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/costs/index.vue',
      ],
    },
  },
  purchasing: {
    market: {
      confidence: 'moderate',
      rationale:
        'Purchasing is established work; supplier integration and replacement of current ordering methods need operator validation.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: ['swiss-chef-work', 'purchasing-workflows'],
    },
    implementation: {
      status: 'not-connected',
      assessed_at: '2026-10-05',
      scope:
        'Purchase-order creation, approval and supplier transmission are explicitly unconnected. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/purchasing/index.vue',
      ],
    },
  },
  receiving: {
    market: {
      confidence: 'strong',
      rationale:
        'Receiving and checking goods are established jobs; the appropriate software depth varies by operation.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: ['swiss-chef-work', 'purchasing-workflows'],
    },
    implementation: {
      status: 'not-connected',
      assessed_at: '2026-10-05',
      scope:
        'Incoming-goods checks and stock updates are explicitly unconnected. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/stock/receiving/index.vue',
      ],
    },
  },
  suppliers: {
    market: {
      confidence: 'moderate',
      rationale:
        'Supplier relationships and commercial terms support purchasing, but catalogue coverage and operator adoption need validation.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: ['swiss-chef-work', 'purchasing-workflows'],
    },
    implementation: {
      status: 'partial',
      assessed_at: '2026-10-05',
      scope:
        'Supplier relationships and catalogue entrances exist. Ingredient-to-supplier purchasing options remain unconnected. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Suppliers/SupplyOptions.vue',
      ],
    },
  },
  waste: {
    market: {
      confidence: 'moderate',
      rationale:
        'Waste measurement supports operational improvement. The large-venue case does not establish savings for the initial audience.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: ['waste-measurement-case', 'swiss-chef-work'],
    },
    implementation: {
      status: 'partial',
      assessed_at: '2026-10-05',
      scope:
        'A form and trusted command record observations. Reporting, costing and stock effects remain unconnected. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Waste/Create.vue',
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/waste/record.ts',
        'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/reports/waste-report/index.vue',
      ],
    },
  },
  reports: {
    market: {
      confidence: 'moderate',
      rationale:
        'Financial control matters, but the required measures and their maintainable inputs need operator validation.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay validation for this Misebox capability.',
      source_observation_ids: ['independent-operators-2026'],
    },
    implementation: {
      status: 'partial',
      assessed_at: '2026-10-05',
      scope:
        'Completed-order gross sales are connected. Costs, margin, cash balances, budgets and forecasts are not. This is source inspection, not fresh live acceptance testing.',
      source_paths: [
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Finance/Overview.vue',
      ],
    },
  },
}
