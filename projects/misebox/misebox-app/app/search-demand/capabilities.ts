import { kitchenReconciliation } from './reconciliation'
import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'
import { workspaceProposal } from './capabilities-workspace'
import { capabilityAssessments } from './capability-assessments'

const capabilityDecisions: AppSearchDemand['capabilities']['capabilities'] = [
  {
    id: 'food-safety',
    definition: {
      purpose:
        'Keep the checks and evidence needed to operate a Kitchen safely.',
      manages: [
        'Safety checks, logs and corrective actions',
        'Cleaning, temperature and allergen-control evidence',
      ],
      uses: [
        'Ingredients and supplier specifications',
        'Receiving, equipment and preparation records',
      ],
      tools: [
        'Record a safety check',
        'Review missing evidence',
        'Record a corrective action',
        'Review allergen documentation',
      ],
      boundaries: [
        'A checklist is not automatic legal compliance or a safety certification.',
        'Ingredient facts, receipt transactions and equipment ownership remain with their domains.',
      ],
      service_example:
        'Goods receipt can combine delivery checks with temperature evidence and a required corrective action.',
    },
    title: 'Food Safety',
    decision: 'establish-now',
    source_cluster_ids: [
      'food-safety-haccp',
      'allergens-nutrition',
      'cleaning-checklists',
    ],
    source_tool_ids: ['allergen-documentation'],
    rationale:
      'These jobs share safety evidence, recurring controls and inspection consequences. Deeper research must determine whether HACCP, temperatures, cleaning, allergens and traceability remain one capability or several closely connected capabilities.',
    research_route: '/workspace/kitchen/food-safety/search-demand',
  },
  {
    id: 'inventory',
    definition: {
      purpose:
        'Know what stock is held, where it is stored and how counts differ from expected quantities.',
      manages: [
        'Stock locations, counts and stock movement records',
        'Lot, expiry and variance information where supported',
      ],
      uses: [
        'Ingredients and products',
        'Receiving, production and waste evidence',
      ],
      tools: [
        'Record a stocktake',
        'Review stock levels',
        'Record an adjustment',
        'Review expiry and variance',
      ],
      boundaries: [
        'Purchasing decides what to buy; Receiving checks what arrived.',
        'Expected stock must come from recorded movements, not invented deductions from menu sales.',
      ],
      service_example:
        'Replenishment can combine stock position, recipe demand and purchasing decisions.',
    },
    title: 'Inventory',
    decision: 'establish-now',
    source_cluster_ids: ['inventory-stocktake'],
    source_tool_ids: ['inventory-invoice-automation'],
    rationale:
      'Counts, stock levels, storage, expiry and variance form a recognisable Kitchen capability with its own recurring operator work.',
    research_route: '/workspace/kitchen/stock/inventory/search-demand',
  },
  {
    id: 'purchasing',
    definition: {
      purpose:
        'Decide what to buy, from whom, in what quantity and on which terms.',
      manages: [
        'Purchase proposals and approved purchase orders',
        'Agreed quantities, prices and approval evidence',
      ],
      uses: [
        'Supplier offers and buying relationships',
        'Stock position and preparation demand',
      ],
      tools: [
        'Prepare a purchase order',
        'Compare supported offers',
        'Approve or revise quantities',
        'Send an approved supplier request',
      ],
      boundaries: [
        'A purchase order does not prove delivery, receipt or payment.',
        'Supplier-side order acceptance belongs to the Supplier.',
      ],
      service_example:
        'Replenishment can turn approved demand into a supplier request and later reconcile receipt.',
    },
    title: 'Purchasing',
    decision: 'establish-now',
    source_cluster_ids: ['purchasing-receiving-suppliers'],
    source_tool_ids: ['inventory-invoice-automation'],
    rationale:
      'Choosing what to buy, from whom, at which price and with which approval is distinct from counting or receiving stock.',
    research_route: '/workspace/kitchen/stock/purchasing/search-demand',
  },
  {
    id: 'receiving',
    definition: {
      purpose:
        'Check delivered goods against the expected purchase and record discrepancies.',
      manages: [
        'Receipt quantities and condition',
        'Delivery references, checks and discrepancies',
      ],
      uses: [
        'Purchase orders and supplier delivery details',
        'Ingredient specifications and safety requirements',
      ],
      tools: [
        'Record delivered quantities',
        'Check condition and temperature',
        'Record a shortage or rejection',
        'Confirm accepted receipt',
      ],
      boundaries: [
        'Receipt is distinct from ordering and invoicing.',
        'Accepted stock updates must preserve Inventory’s movement contract.',
      ],
      service_example:
        'Goods receipt can coordinate purchase matching, safety checks, stock movements and a discrepancy claim.',
    },
    title: 'Receiving',
    decision: 'establish-now',
    source_cluster_ids: ['purchasing-receiving-suppliers', 'food-safety-haccp'],
    source_tool_ids: ['inventory-invoice-automation'],
    rationale:
      'Verifying quantities, condition, traceability and temperature is a distinct Kitchen operation joining supply, stock and food-safety evidence.',
    research_route: '/workspace/kitchen/stock/receiving/search-demand',
  },
  {
    id: 'waste',
    definition: {
      purpose: 'Record discarded food and the operational reasons for it.',
      manages: [
        'Waste quantities, reasons, timing and recorded valuation inputs',
      ],
      uses: [
        'Ingredients, batches and stock movements',
        'Cost inputs with their source and date',
      ],
      tools: [
        'Record waste',
        'Classify a reason',
        'Review waste by period',
        'Correct an erroneous entry',
      ],
      boundaries: [
        'Waste recording produces evidence; reporting summarises it.',
        'Stock changes and monetary values require their own supported inputs and commands.',
      ],
      service_example:
        'Batch close-out can reconcile produced, used, remaining and wasted quantities.',
    },
    title: 'Waste',
    decision: 'establish-now',
    source_cluster_ids: ['waste', 'inventory-stocktake'],
    source_tool_ids: [],
    rationale:
      'Recording what was wasted, why and at what operational cost is a distinct recurring job and evidence source.',
    research_route: '/workspace/kitchen/stock/waste/search-demand',
  },
  {
    id: 'recipes-costing',
    definition: {
      purpose:
        'Describe repeatable preparation and derive quantities and costs from explicit inputs.',
      manages: [
        'Recipe ingredients, method, yield and portions',
        'Recipe-specific scaling and cost calculations',
      ],
      uses: [
        'Ingredient units and specifications',
        'Authoritative purchase prices and cost assumptions',
      ],
      tools: [
        'Create or edit a recipe',
        'Scale a recipe',
        'Review portion cost',
        'Connect a recipe to a dish',
      ],
      boundaries: [
        'A calculated cost is only as reliable as its prices, units and yield inputs.',
        'Purchase transactions, production actuals and selling prices are separate responsibilities.',
      ],
      service_example:
        'Production planning can combine recipe quantities with stock availability and planned batches.',
    },
    title: 'Recipes and Costing',
    decision: 'establish-now',
    source_cluster_ids: ['recipes-costing'],
    source_tool_ids: ['recipe-book-scaling', 'recipe-portion-costing'],
    rationale:
      'Recipe knowledge, yields, scaling and cost calculations are strongly connected, but cost claims require authoritative purchase prices and quantities.',
    research_route: '/workspace/kitchen/food/recipes/search-demand',
  },
  {
    id: 'orders-service',
    definition: {
      purpose:
        'Track an accepted customer order through Kitchen preparation and fulfilment.',
      manages: [
        'Order lines and Kitchen progress',
        'Routing, timing and fulfilment state',
        'Named offering configuration: eligible menus, serving hours, order timing and required customer details',
      ],
      uses: [
        'Published menu offers',
        'Kitchen Fulfilment payment choices and delivery zones; Kitchen Integrations website settings',
        'Stations and ordering configuration',
        'Sale and payment evidence from their owners',
      ],
      tools: [
        'Configure a named offering and ordering interaction',
        'Review incoming orders',
        'Confirm or reject an order',
        'Advance preparation',
        'Mark ready and complete',
      ],
      boundaries: [
        'This is order fulfilment; it is not a generic service-layer container.',
        'Payment settlement, table operations and guest relationship management are separate responsibilities.',
      ],
      service_example:
        'Customer ordering can coordinate offer validation, order creation, fulfilment and the appropriate payment workflow.',
    },
    title: 'Orders and fulfilment',
    decision: 'establish-now',
    source_cluster_ids: ['orders-service'],
    source_tool_ids: [],
    rationale:
      'Kitchen order intake, routing, station progress, expo and timing need deeper research while Tables, payment and guest service remain Front-of-House boundaries.',
    research_route: '/workspace/kitchen/orders/search-demand',
  },
  {
    id: 'menus',
    definition: {
      purpose:
        'Organise what a Kitchen offers, how it is presented and when a reviewed menu is published.',
      manages: [
        'Menu identity and sections',
        'Menu placements, selling prices and publication state',
      ],
      uses: [
        'Dish and Drink specifications',
        'Ingredient and Recipe information for supported disclosures',
      ],
      tools: [
        'Create a menu',
        'Arrange sections and items',
        'Review prices and availability',
        'Publish or withdraw a menu',
      ],
      boundaries: [
        'Menu placement does not own the canonical Dish or Recipe.',
        'Ordering configuration, Orders and payment evidence have separate owners.',
      ],
      service_example:
        'Website-ordering setup can use a reviewed Menu alongside ordering configuration and order fulfilment.',
    },
    title: 'Menus',
    decision: 'establish-now',
    source_cluster_ids: ['menus'],
    source_tool_ids: [
      'menu-import-publish',
      'recipe-portion-costing',
      'allergen-documentation',
    ],
    rationale:
      'Menus connect dishes, prices, availability and publication. Deeper research must distinguish menu management, publishing and menu engineering rather than treating them as one generic page.',
    research_route: '/workspace/kitchen/menus/search-demand',
  },
  {
    id: 'ingredients',
    definition: {
      purpose:
        'Maintain the ingredient knowledge needed by recipes, food safety and stock work.',
      manages: [
        'Kitchen ingredient descriptions and specifications',
        'Kitchen-specific units and recorded allergen information',
      ],
      uses: [
        'Canonical Ingredient identity',
        'Supplier products and supporting specifications',
      ],
      tools: [
        'Add or connect an ingredient',
        'Review units and specifications',
        'Record verified allergen information',
      ],
      boundaries: [
        'An Ingredient reference is not a stock balance or supplier price.',
        'Recorded allergen data does not itself prove a safe preparation process.',
      ],
      service_example:
        'Menu review can use ingredient evidence and recipe composition to check supported disclosures.',
    },
    title: 'Ingredients',
    decision: 'establish-now',
    source_cluster_ids: [
      'allergens-nutrition',
      'recipes-costing',
      'inventory-stocktake',
    ],
    source_tool_ids: [
      'recipe-book-scaling',
      'recipe-portion-costing',
      'allergen-documentation',
      'inventory-invoice-automation',
    ],
    rationale:
      'Ingredients connect allergen knowledge, recipes, purchase prices and stock. The connected Kitchen graph requires this operator-facing capability even though searches often name its downstream jobs.',
    research_route: '/workspace/kitchen/food/ingredients/search-demand',
  },
  {
    id: 'dishes',
    definition: {
      purpose:
        'Define a sellable food item and the preparation specification behind it.',
      manages: [
        'Dish specification, portions and composition',
        'Dish-specific preparation links and supported cost assumptions',
      ],
      uses: [
        'Recipes, prep items and ingredients',
        'Menu placements and stations',
      ],
      tools: [
        'Create or edit a dish',
        'Connect recipes and prep items',
        'Review preparation specification',
      ],
      boundaries: [
        'Menu sections and publication belong to Menus.',
        'Recipes retain their own yield and method; a Dish is not an Order.',
      ],
      service_example:
        'Menu setup can compose reviewed Dishes into an offer without copying their recipe ownership.',
    },
    title: 'Dishes',
    decision: 'establish-now',
    source_cluster_ids: ['recipes-costing', 'menus'],
    source_tool_ids: [
      'menu-import-publish',
      'recipe-book-scaling',
      'recipe-portion-costing',
      'allergen-documentation',
    ],
    rationale:
      'Dishes are the sellable Kitchen composition connecting recipes, menu placement, availability and operational evidence.',
    research_route: '/workspace/kitchen/food/dishes/search-demand',
  },
  {
    id: 'drinks',
    definition: {
      purpose:
        'Define sellable drinks using shared item mechanics and drink-specific preparation information.',
      manages: [
        'Drink specification, serving measures and composition',
        'Drink preparation links',
      ],
      uses: [
        'Shared Dish record mechanics distinguished by item kind',
        'Ingredients, Recipes and Menu placements',
      ],
      tools: [
        'Create or edit a drink',
        'Set serving specifications',
        'Connect preparation information',
      ],
      boundaries: [
        'Shared mechanics do not justify a duplicate Drink storage owner.',
        'Menu publication and order fulfilment are separate responsibilities.',
      ],
      service_example:
        'Menu setup can include reviewed drinks alongside food items.',
    },
    title: 'Drinks',
    decision: 'establish-now',
    source_cluster_ids: ['recipes-costing', 'menus'],
    source_tool_ids: [
      'menu-import-publish',
      'recipe-book-scaling',
      'recipe-portion-costing',
      'allergen-documentation',
    ],
    rationale:
      'Drinks share menu and costing concerns while retaining their own preparation, ingredient and service conventions.',
    research_route: '/workspace/kitchen/food/drinks/search-demand',
  },
  {
    id: 'stations',
    definition: {
      purpose:
        'Describe where Kitchen preparation and order work is carried out.',
      manages: [
        'Station definitions and responsibilities',
        'Station-specific work context',
      ],
      uses: ['Dish preparation requirements', 'Preparation tasks and Orders'],
      tools: [
        'Define a station',
        'Review station responsibilities',
        'Assign supported work',
      ],
      boundaries: [
        'A station is not a separate Workspace or permission grant.',
        'Preparation and order lifecycle records retain their owners.',
      ],
      service_example:
        'Order routing can use station responsibility when dispatching preparation work.',
    },
    title: 'Stations',
    decision: 'establish-now',
    source_cluster_ids: ['mise-production', 'orders-service', 'team-training'],
    source_tool_ids: ['mise-from-recipes'],
    rationale:
      'Stations route preparation, live orders and Kitchen responsibility without becoming a generic workforce structure.',
    research_route: '/workspace/kitchen/stations/search-demand',
  },
  {
    id: 'suppliers',
    definition: {
      purpose:
        'Maintain the Kitchen’s buying relationships and practical supplier information.',
      manages: [
        'Kitchen supplier links and contact context',
        'Recorded terms, lead times and purchasing notes',
      ],
      uses: ['Supplier-owned identity and commercial offers'],
      tools: [
        'Connect a supplier',
        'Review buying terms',
        'Update Kitchen contact notes',
      ],
      boundaries: [
        'The Kitchen does not own the Supplier’s canonical catalogue or account.',
        'Purchase orders, deliveries and stock balances belong to other capabilities.',
      ],
      service_example:
        'Purchasing can use an approved supplier relationship when preparing a supplier order.',
    },
    title: 'Suppliers',
    decision: 'establish-now',
    source_cluster_ids: ['purchasing-receiving-suppliers'],
    source_tool_ids: ['inventory-invoice-automation'],
    rationale:
      'Supplier identity and terms support purchasing and receiving while remaining distinct from those operations.',
    research_route: '/workspace/kitchen/stock/suppliers/search-demand',
  },
  {
    id: 'team-training',
    definition: {
      purpose:
        'Maintain Kitchen working responsibilities and evidence of relevant training.',
      manages: [
        'Kitchen Team relationships and recorded responsibilities',
        'Training and handover evidence',
      ],
      uses: [
        'App membership and Kitchen access policy',
        'Capability-specific tasks and safety procedures',
      ],
      tools: [
        'Invite or manage a teammate',
        'Record training evidence',
        'Review a handover',
      ],
      boundaries: [
        'Team labels are not implemented permission restrictions.',
        'Payroll, generic HR and App subscription entitlement are separate concerns.',
      ],
      service_example:
        'Operator onboarding can combine membership, Kitchen access and required training checks.',
    },
    title: 'Kitchen Team and Training',
    decision: 'establish-later',
    source_cluster_ids: ['team-training'],
    source_tool_ids: [],
    rationale:
      'Roles, station competence, handovers and operational training belong to the Kitchen, while payroll and generic HR do not. Current evidence needs a broader dedicated pass.',
    research_route: '/workspace/kitchen/team/search-demand',
  },
  {
    id: 'equipment-maintenance',
    definition: {
      purpose:
        'Keep equipment condition and maintenance work visible to Kitchen operators.',
      manages: [
        'Equipment register and maintenance needs',
        'Inspection, repair and completion evidence',
      ],
      uses: ['Safety requirements and supplier or repair contacts'],
      tools: [
        'Record equipment',
        'Report a fault',
        'Schedule maintenance',
        'Record completion',
      ],
      boundaries: [
        'This is a proposed boundary requiring operator validation.',
        'Asset accounting and generic facilities management are separate concerns.',
      ],
      service_example:
        'A fault-to-repair journey can coordinate equipment evidence, safety decisions and assigned repair work.',
    },
    title: 'Equipment and Maintenance',
    decision: 'establish-later',
    source_cluster_ids: ['equipment-maintenance'],
    source_tool_ids: [],
    rationale:
      'Equipment availability and maintenance matter operationally, but the current query evidence is too thin to justify a capability boundary.',
  },
  {
    id: 'formats-scale',
    title: 'Kitchen Formats and Scale',
    decision: 'context',
    source_cluster_ids: ['formats-scale'],
    source_tool_ids: ['broad-restaurant-erp'],
    rationale:
      'Restaurant, bakery, catering, cloud, commissary and institutional Kitchens are contexts in which the selected jobs vary. Apply them as a validation lens to every deeper pass rather than creating format-shaped navigation.',
  },
  {
    id: 'reports',
    definition: {
      purpose:
        'Summarise operational records into explainable Kitchen measures.',
      manages: ['Report definitions, periods and derived views'],
      uses: ['Recorded sales, waste, stock and cost inputs'],
      tools: [
        'Choose a reporting period',
        'Inspect supporting records',
        'Compare supported measures',
      ],
      boundaries: [
        'Reports do not invent missing producers or own underlying transactions.',
        'Gross sales is not profit, settled cash or authoritative cost.',
      ],
      service_example:
        'An operational review can combine supported sales and waste views while retaining their source evidence.',
    },
    title: 'Kitchen Reports',
    decision: 'derived',
    source_cluster_ids: ['reports-analysis'],
    source_tool_ids: ['recipe-portion-costing', 'inventory-invoice-automation'],
    rationale:
      'Research reports by their real names, but expose them only after Sales, Food Safety, Stock, Waste, Costing or Service produces authoritative operational evidence.',
  },
  {
    id: 'front-of-house',
    title: 'Front of House',
    decision: 'boundary',
    source_cluster_ids: [],
    source_tool_ids: ['broad-restaurant-erp'],
    rationale:
      'Tables, guest service and payment are adjacent hospitality domains. Kitchen capabilities may receive orders or publish availability across that boundary without making Front of House Kitchen-owned.',
  },
  {
    id: 'business-administration',
    title: 'Payroll, Tax and General Accounting',
    decision: 'boundary',
    source_cluster_ids: [],
    source_tool_ids: ['broad-restaurant-erp'],
    rationale:
      'Misebox must not turn bounded Kitchen sales or recipe-cost estimates into unsupported payroll, tax, cashflow, profit or accounting promises.',
  },
]

const kitchenPriorities = [
  'menus',
  'recipes-costing',
  'orders-service',
  'ingredients',
  'food-safety',
  'waste',
  'suppliers',
  'mise-production',
  'inventory',
  'purchasing',
  'receiving',
  'dishes',
  'drinks',
  'stations',
  'reports',
  'team-training',
  'equipment-maintenance',
]
function kitchenAssessment(id: string) {
  const current = kitchenReconciliation.entries.find((e) =>
    e.source_capability_ids.includes(id)
  )
  return {
    market: {
      confidence: 'early' as const,
      rationale:
        'The operator job is supported by the cited evidence; this particular product boundary and its adoption require validation.',
      validation_gap:
        'No original operator interviews, measured conversion or willingness-to-pay proof.',
      source_observation_ids: current?.source_observation_ids ?? [
        'swiss-chef-work',
      ],
    },
    implementation: {
      status: current?.status ?? ('not-assessed' as const),
      assessed_at: '2026-10-05',
      scope:
        current?.rationale ??
        'No complete customer-owned execution path was established by this research pass.',
      source_paths: current?.source_paths ?? [],
    },
  }
}

capabilityDecisions.push({
  id: 'mise-production',
  definition: {
    purpose: 'Plan preparation work and record what a batch actually produced.',
    manages: [
      'Preparation tasks, responsibility and due times',
      'Batch quantities, yields and completion evidence',
    ],
    uses: [
      'Approved recipes and required quantities',
      'Available stock and stations',
    ],
    tools: [
      'Plan preparation',
      'Assign a batch',
      'Record actual yield',
      'Complete a preparation task',
    ],
    boundaries: [
      'Planning is not a stock reservation or evidence that production happened.',
      'Recipe authoring and order fulfilment retain their own responsibilities.',
    ],
    service_example:
      'A preparation run can combine recipe scaling, stock checks, batch work and waste recording.',
  },
  title: 'Preparation and Batches',
  decision: 'proposed',
  source_cluster_ids: ['mise-production'],
  source_tool_ids: ['mise-from-recipes', 'recipe-book-scaling'],
  rationale:
    'Translate approved recipe output into preparation work with responsibility and due time. Planning and actual batch execution need their own connected records and proof.',
})

export const capabilities: AppSearchDemand['capabilities'] = {
  summary:
    'The first Kitchen capability map connects food knowledge to safe preparation, stock, supply and live service while keeping reporting and adjacent hospitality work explicit.',
  workspace: workspaceProposal,
  capabilities: capabilityDecisions.map((capability) => ({
    ...capability,
    priority: kitchenPriorities.includes(capability.id)
      ? {
          rank: kitchenPriorities.indexOf(capability.id) + 1,
          rationale:
            'Industry validation sequence; Hotel Bären ordering is a separate current client priority. Safety duties apply throughout.',
        }
      : undefined,
    assessment:
      capabilityAssessments[capability.id] ?? kitchenAssessment(capability.id),
  })),
  next_step:
    'Use the existing capability research routes as the evidence boundary: test the already-proved reviewed Menu import flow first, and validate demand for requested Recipe scaling and costing before completing their authoritative records and Tools.',
}
