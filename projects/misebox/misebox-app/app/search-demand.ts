import { defineAppSearchDemand } from 'fireux-core/config/app/search-demand'
import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

const observedAt = '2026-08-22'

type DemandFamily = {
  id: string
  title: string
  operatorJob: string
  confidence: 'early' | 'moderate' | 'strong'
  intents: AppSearchDemand['analysis']['clusters'][number]['intents']
  interpretation: string
  boundary?: string
  gap?: string
  seeds: Array<{ seed: string, suggestions: string[] }>
}

const families: DemandFamily[] = [
  {
    id: 'food-safety-haccp', title: 'Food safety and HACCP', confidence: 'strong', intents: ['learn', 'choose', 'perform', 'troubleshoot'],
    operatorJob: 'Run, evidence and review the controls that keep food safe.',
    interpretation: 'Operators seek plans, templates, logs, checklists, inspection evidence and corrective-action records—not merely a compliance report.',
    boundary: 'Requirements vary by jurisdiction. Generic guidance must not be presented as local legal advice.',
    gap: 'Research cooling, cooking, holding, receiving, calibration, cleaning and corrective actions independently by geography.',
    seeds: [
      { seed: 'restaurant haccp', suggestions: ['restaurant haccp plan', 'restaurant haccp plan template', 'restaurant haccp plan pdf', 'restaurant haccp plan example', 'haccp restaurant meaning'] },
      { seed: 'restaurant food safety', suggestions: ['restaurant food safety guidelines', 'restaurant food safety violations', 'restaurant food safety certification', 'restaurant food safety report', 'restaurant food safety fridge storage'] },
      { seed: 'restaurant temperature log', suggestions: ['restaurant temperature log template', 'restaurant temperature log sheet', 'restaurant temperature log app', 'restaurant fridge temperature log template', 'restaurant food temperature log'] },
    ],
  },
  {
    id: 'allergens-nutrition', title: 'Allergens and nutrition', confidence: 'strong', intents: ['learn', 'perform', 'troubleshoot'],
    operatorJob: 'Maintain reliable allergen and nutrition information as ingredients, recipes and menus change.',
    interpretation: 'Suggested searches concentrate on allergen sheets, menus, lists, charts and nutrition calculators.',
    boundary: 'Guest disclosure can be published from Kitchen evidence; medical guarantees remain out of scope.',
    gap: 'Research jurisdiction-specific allergen matrices, labels, cross-contact controls and nutrition calculation.',
    seeds: [
      { seed: 'restaurant allergen', suggestions: ['restaurant allergen sheet', 'restaurant allergen menu', 'restaurant allergen list template', 'restaurant allergen information', 'restaurant allergen chart'] },
      { seed: 'restaurant nutrition calculator', suggestions: ['restaurant nutrition calculator', 'restaurant food nutrition calculator', 'free restaurant nutrition calculator'] },
    ],
  },
  {
    id: 'cleaning-checklists', title: 'Cleaning, hygiene and daily checklists', confidence: 'strong', intents: ['learn', 'choose', 'perform'],
    operatorJob: 'Make recurring opening, closing, cleaning and inspection work visible and accountable.',
    interpretation: 'Template, printable, PDF, spreadsheet and app language exposes a recurring paper-to-digital workflow.',
    gap: 'Separate Kitchen hygiene from Front-of-House and general premises checklists.',
    seeds: [
      { seed: 'restaurant cleaning checklist', suggestions: ['restaurant cleaning checklist pdf free download', 'restaurant cleaning checklist excel', 'restaurant cleaning checklist template', 'restaurant cleaning checklist printable'] },
      { seed: 'restaurant kitchen checklist', suggestions: ['restaurant kitchen cleaning checklist', 'restaurant kitchen closing checklist', 'restaurant kitchen opening checklist', 'restaurant kitchen inspection checklist', 'restaurant kitchen daily checklist'] },
      { seed: 'restaurant opening closing checklist', suggestions: ['restaurant opening and closing checklist pdf', 'restaurant opening and closing checklist excel', 'restaurant opening and closing checklist template'] },
    ],
  },
  {
    id: 'inventory-stocktake', title: 'Inventory and stocktake', confidence: 'strong', intents: ['learn', 'compare', 'choose', 'perform'],
    operatorJob: 'Know what is on hand, count it efficiently and act before the Kitchen runs short.',
    interpretation: 'Software, system, app, spreadsheet, template and free-tool modifiers show both product-selection and immediate task demand.',
    gap: 'Research par levels, storage, transfers, expiry, variance, alerts and theoretical-versus-actual usage.',
    seeds: [
      { seed: 'restaurant inventory management', suggestions: ['restaurant inventory management software', 'restaurant inventory management system', 'restaurant inventory management app', 'restaurant inventory management excel template', 'restaurant inventory management free'] },
      { seed: 'restaurant stocktake', suggestions: ['restaurant stocktake template', 'restaurant stocktake app'] },
    ],
  },
  {
    id: 'purchasing-receiving-suppliers', title: 'Purchasing, receiving and suppliers', confidence: 'moderate', intents: ['compare', 'choose', 'perform'],
    operatorJob: 'Choose suppliers, place orders and verify that the right goods arrive in acceptable condition.',
    interpretation: 'The exact operational categories are suggested, but this sample has less breadth than inventory or HACCP.',
    boundary: 'Supplier identity is not purchasing activity; receiving also feeds stock and food-safety evidence.',
    gap: 'Research purchase orders, approvals, prices, invoices, discrepancies, lot traceability and receiving temperatures.',
    seeds: [
      { seed: 'restaurant purchasing software', suggestions: ['restaurant purchasing software'] },
      { seed: 'restaurant receiving checklist', suggestions: ['restaurant receiving checklist'] },
      { seed: 'restaurant supplier management', suggestions: ['restaurant supplier management'] },
    ],
  },
  {
    id: 'waste', title: 'Food waste', confidence: 'strong', intents: ['learn', 'choose', 'perform'],
    operatorJob: 'Record what was wasted, why it was wasted and what it cost.',
    interpretation: 'Suggested searches span software, management, logs, templates, measurement, recycling and regulation.',
    gap: 'Separate spoilage, prep loss, overproduction, returned dishes and disposal while keeping one coherent waste record.',
    seeds: [{ seed: 'restaurant food waste', suggestions: ['restaurant food waste app', 'restaurant food waste management', 'restaurant food waste log template', 'restaurant food waste log', 'restaurant food waste percentage', 'restaurant food waste disposal regulations'] }],
  },
  {
    id: 'recipes-costing', title: 'Recipes, yields and costing', confidence: 'strong', intents: ['learn', 'compare', 'choose', 'perform'],
    operatorJob: 'Standardise recipes, scale production and understand ingredient and dish cost.',
    interpretation: 'Observed language joins recipe-costing software and templates with food-cost formula, percentage, calculator and spreadsheet demand.',
    boundary: 'A recipe-cost estimate is not accounting profit; it depends on authoritative quantities, yields and purchase prices.',
    gap: 'Research sub-recipes, versioning, conversions, yield loss, portions, batch scaling and price-change impact.',
    seeds: [
      { seed: 'restaurant recipe costing', suggestions: ['restaurant recipe costing template', 'restaurant recipe costing software'] },
      { seed: 'restaurant food cost', suggestions: ['restaurant food cost formula', 'restaurant food cost percentage', 'restaurant food cost calculator', 'restaurant food cost spreadsheet free', 'restaurant food costing & inventory management'] },
    ],
  },
  {
    id: 'mise-production', title: 'Mise and production', confidence: 'strong', intents: ['learn', 'choose', 'perform'],
    operatorJob: 'Work out what must be prepared, by whom, at which station and by when.',
    interpretation: 'Prep-list demand repeatedly uses template, app, example and Kitchen-specific language.',
    gap: 'Research pars, forecasting, batch production, carry-over, readiness, station assignment and planned-versus-produced quantities.',
    seeds: [{ seed: 'restaurant prep list', suggestions: ['restaurant prep list template', 'restaurant prep list app', 'restaurant prep list example', 'restaurant kitchen prep list', 'restaurant food prep list'] }],
  },
  {
    id: 'orders-service', title: 'Orders and Kitchen service', confidence: 'strong', intents: ['compare', 'choose', 'perform', 'troubleshoot'],
    operatorJob: 'Receive, route, prepare and complete live orders without losing timing or context.',
    interpretation: 'KDS searches include app, free, open-source, price and restaurant modifiers; order searches include system and template language.',
    boundary: 'Tables, guest service and payment remain Front-of-House concerns even when their orders feed the Kitchen.',
    gap: 'Research ticket time, station routing, expo, coursing, aggregation, throttling and 86 communication.',
    seeds: [
      { seed: 'kitchen display system', suggestions: ['kitchen display system app', 'kitchen display system app free', 'kitchen display system open source', 'kitchen display system price', 'kitchen display system for restaurant'] },
      { seed: 'restaurant order management system', suggestions: ['restaurant order management system', 'restaurant order management system free', 'restaurant order management system design', 'restaurant order management system template'] },
    ],
  },
  {
    id: 'menus', title: 'Menus and menu engineering', confidence: 'strong', intents: ['learn', 'compare', 'choose', 'perform'],
    operatorJob: 'Build, publish and evaluate menus connected to dishes, prices and service.',
    interpretation: 'Observed searches cover menu-management systems and software plus menu-engineering matrices, examples and PDFs.',
    boundary: 'Menu engineering needs product-mix evidence and defensible cost inputs; popularity alone is not profitability.',
    gap: 'Research publishing, QR access, translations, availability, modifiers, pricing and channel-specific menus.',
    seeds: [
      { seed: 'restaurant menu management', suggestions: ['restaurant menu management system', 'restaurant menu management software', 'restaurant menu management ui'] },
      { seed: 'restaurant menu engineering', suggestions: ['restaurant menu engineering matrix', 'restaurant menu engineering examples', 'restaurant menu engineering pdf'] },
    ],
  },
  {
    id: 'team-training', title: 'Kitchen team and training', confidence: 'moderate', intents: ['learn', 'choose', 'perform'],
    operatorJob: 'Give Kitchen staff clear responsibilities, current knowledge and consistent ways of working.',
    interpretation: 'Training searches appear, but this sample does not yet separate Kitchen operations from wider workforce software.',
    boundary: 'Payroll and generic HR are not Kitchen capabilities; roles, station competence and operational training can be.',
    gap: 'Research station training, recipe execution, skills matrices, shift handover, communication and scheduling separately.',
    seeds: [
      { seed: 'restaurant employee training checklist', suggestions: ['restaurant employee training checklist'] },
      { seed: 'restaurant shift handover', suggestions: ['restaurant shift handover checklist', 'restaurant shift handover template'] },
    ],
  },
  {
    id: 'equipment-maintenance', title: 'Equipment and maintenance', confidence: 'early', intents: ['learn', 'choose', 'perform', 'troubleshoot'],
    operatorJob: 'Keep Kitchen equipment safe, available and serviced.',
    interpretation: 'Live results establish maintenance logs and specialist software vocabulary, but the tested autocomplete seed produced no expansions.',
    gap: 'Research asset registers, planned maintenance, faults, service history, calibration, warranties and cleaning certification.',
    seeds: [],
  },
  {
    id: 'reports-analysis', title: 'Kitchen reports and analysis', confidence: 'moderate', intents: ['learn', 'perform', 'troubleshoot'],
    operatorJob: 'Understand sales, product mix, service speed, food safety, stock, waste and cost from operational evidence.',
    interpretation: 'Demand uses specific report names more reliably than the vague phrase “Kitchen reports”.',
    boundary: 'Do not promise profit, labour, tax or accounting reports without authoritative producers.',
    gap: 'Research each report by its real name: sales, product mix, ticket time, HACCP, stock variance, waste and food cost.',
    seeds: [],
  },
  {
    id: 'formats-scale', title: 'Kitchen formats and scale', confidence: 'strong', intents: ['learn', 'compare', 'choose'],
    operatorJob: 'Operate the same core Kitchen jobs across a specialist format, production model or group of locations.',
    interpretation: 'Search language distinguishes bakery, catering, cloud, ghost, commissary, commercial and institutional Kitchens. These are market segments with capability variants, not automatically separate capabilities.',
    boundary: 'The Level-one Kitchen map records these operator contexts without allowing one format to define the whole domain.',
    gap: 'Research hotels, healthcare, education, contract catering, central production and multi-location control independently.',
    seeds: [
      { seed: 'bakery management software', suggestions: ['bakery order management software', 'bakery inventory management software', 'best bakery management software', 'bakery production management software'] },
      { seed: 'cloud kitchen management', suggestions: ['cloud kitchen management software', 'cloud kitchen management system', 'cloud kitchen management app', 'cloud kitchen order management system'] },
      { seed: 'ghost kitchen software', suggestions: ['ghost kitchen management software'] },
      { seed: 'catering management software', suggestions: ['catering event management software', 'catering business management software', 'catering order management software'] },
      { seed: 'commissary kitchen software', suggestions: ['commissary kitchen software', 'commissary kitchen management software'] },
      { seed: 'commercial kitchen management', suggestions: ['commercial kitchen management software', 'commercial kitchen waste management'] },
      { seed: 'institutional food service management', suggestions: ['institutional food service management', 'institutional food service management pdf'] },
    ],
  },
]

const observations = families.flatMap(family => family.seeds.flatMap(({ seed, suggestions }) =>
  suggestions.map(query => ({
    query,
    source: 'google-autocomplete' as const,
    geography: 'Switzerland',
    language: 'English',
    observed_at: observedAt,
    metrics: [{ label: 'Seed', value: seed }],
    note: 'Suggested by Google Autocomplete for the named seed. This establishes current query language, not absolute search volume.',
    source_url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  }))))

export const searchDemand = defineAppSearchDemand({
  domain: 'Kitchen operations',
  operator: 'Kitchen operators',
  description: 'The domain covers people operating professional food-service Kitchens across restaurant, hotel, catering, bakery, cloud, commissary, institutional and multi-site settings. It investigates what they need to understand, create, record, coordinate, monitor or improve. Front-of-House guest service, tables, payments, payroll and general accounting remain adjacent unless Kitchen work directly crosses their boundary.',
  summary: {
    conclusion: 'Kitchen demand spans food safety, food knowledge, stock, supply, production, service, people, equipment and evidence—not a single “Kitchen management software” category.',
    findings: [
      'HACCP, food-safety plans and temperature records are a first-class Kitchen demand family and must inform the Workspace architecture.',
      'Template, spreadsheet, PDF, free and app modifiers reveal immediate jobs currently handled with paper or general-purpose tools.',
      'The connected Kitchen graph remains valuable, but every capability must answer a named operator job rather than merely mirror stored entities.',
      'Google Autocomplete establishes query language and breadth; it does not establish absolute volume, commercial value or final build priority.',
    ],
    next_step: 'Group the observed queries into operator jobs and intent patterns in the Demand map.',
  },
  analysis: {
    summary: 'This coverage-validation pass contains fourteen Kitchen demand families and tests both operator jobs and Kitchen formats. It prevents one software category, compliance concern or restaurant format from defining the domain while retaining explicit gaps where evidence depth remains limited.',
    clusters: families.map(family => ({
      id: family.id,
      title: family.title,
      operator_job: family.operatorJob,
      intents: family.intents,
      evidence_queries: family.seeds.flatMap(seed => seed.suggestions),
      confidence: family.confidence,
      interpretation: family.interpretation,
      boundary: family.boundary,
      research_gap: family.gap,
    })),
    next_step: 'Turn the demand families into a first-pass capability map, preserving contexts, derived surfaces and adjacent boundaries.',
  },
  capabilities: {
    summary: 'The first Kitchen capability map connects food knowledge to safe preparation, stock, supply and live service while keeping reporting and adjacent hospitality work explicit.',
    workspace: {
      summary: 'The operator-facing menu used by the current Kitchen Workspace.',
      groups: [
        {
          label: 'Workspace',
          items: [
            { label: 'Today', icon: 'i-lucide-calendar-check', brief: 'Open the selected Kitchen with the work, risks and decisions that need attention today.' },
            { label: 'Overview', icon: 'i-lucide-layout-dashboard', brief: 'Understand the selected Kitchen and route into its operational capabilities.' },
            { label: 'Identity', icon: 'i-lucide-id-card', brief: 'Maintain the Kitchen identity and its joined Place presentation.' },
            { label: 'Team', icon: 'i-lucide-users', capability_id: 'team-training' },
          ],
        },
        {
          label: 'Food & Drink',
          items: [
            { label: 'Menus', icon: 'i-lucide-book-open', capability_id: 'menus' },
            { label: 'Dishes', icon: 'i-lucide-utensils', capability_id: 'dishes' },
            { label: 'Drinks', icon: 'i-lucide-glass-water', capability_id: 'drinks' },
            { label: 'Recipes', icon: 'i-lucide-notebook-tabs', capability_id: 'recipes-costing' },
            { label: 'Ingredients', icon: 'i-lucide-carrot', capability_id: 'ingredients' },
          ],
        },
        {
          label: 'Operations',
          items: [
            { label: 'Food Safety', icon: 'i-lucide-shield-check', capability_id: 'food-safety' },
            { label: 'Mise', icon: 'i-lucide-list-checks', capability_id: 'mise-production' },
            { label: 'Orders & Service', icon: 'i-lucide-receipt-text', capability_id: 'orders-service' },
            { label: 'Inventory', icon: 'i-lucide-boxes', capability_id: 'inventory' },
            { label: 'Purchasing', icon: 'i-lucide-shopping-cart', capability_id: 'purchasing' },
            { label: 'Receiving', icon: 'i-lucide-package-check', capability_id: 'receiving' },
            { label: 'Waste', icon: 'i-lucide-trash-2', capability_id: 'waste' },
          ],
        },
        {
          label: 'Kitchen Setup',
          items: [
            { label: 'Stations', icon: 'i-lucide-layout-grid', capability_id: 'stations' },
            { label: 'Suppliers', icon: 'i-lucide-truck', capability_id: 'suppliers' },
          ],
        },
        {
          label: 'Reports',
          items: [
            { label: 'Sales', icon: 'i-lucide-chart-column', capability_id: 'reports', brief: 'Review bounded sales measures produced by completed Kitchen sales.' },
            { label: 'Costs', icon: 'i-lucide-calculator', capability_id: 'reports', brief: 'Aggregate cost evidence only when Recipes, Ingredients and purchase prices are authoritative.' },
            { label: 'Waste', icon: 'i-lucide-recycle', capability_id: 'reports', brief: 'Summarise recorded waste without replacing the operational Waste capability.' },
            { label: 'Performance', icon: 'i-lucide-gauge', capability_id: 'reports', brief: 'Compare supported service and production measures without inventing profit or labour evidence.' },
          ],
        },
      ],
    },
    capabilities: [
      {
        id: 'food-safety', title: 'Food Safety', decision: 'establish-now',
        source_cluster_ids: ['food-safety-haccp', 'allergens-nutrition', 'cleaning-checklists'],
        rationale: 'These jobs share safety evidence, recurring controls and inspection consequences. Deeper research must determine whether HACCP, temperatures, cleaning, allergens and traceability remain one capability or several closely connected capabilities.',
        research_route: '/workspace/kitchen/food-safety/search-demand',
      },
      {
        id: 'inventory', title: 'Inventory', decision: 'establish-now',
        source_cluster_ids: ['inventory-stocktake'],
        rationale: 'Counts, stock levels, storage, expiry and variance form a recognisable Kitchen capability with its own recurring operator work.',
        research_route: '/workspace/kitchen/inventory/search-demand',
      },
      {
        id: 'purchasing', title: 'Purchasing', decision: 'establish-now',
        source_cluster_ids: ['purchasing-receiving-suppliers'],
        rationale: 'Choosing what to buy, from whom, at which price and with which approval is distinct from counting or receiving stock.',
        research_route: '/workspace/kitchen/purchasing/search-demand',
      },
      {
        id: 'receiving', title: 'Receiving', decision: 'establish-now',
        source_cluster_ids: ['purchasing-receiving-suppliers', 'food-safety-haccp'],
        rationale: 'Verifying quantities, condition, traceability and temperature is a distinct Kitchen operation joining supply, stock and food-safety evidence.',
        research_route: '/workspace/kitchen/receiving/search-demand',
      },
      {
        id: 'waste', title: 'Waste', decision: 'establish-now',
        source_cluster_ids: ['waste', 'inventory-stocktake'],
        rationale: 'Recording what was wasted, why and at what operational cost is a distinct recurring job and evidence source.',
        research_route: '/workspace/kitchen/waste/search-demand',
      },
      {
        id: 'recipes-costing', title: 'Recipes and Costing', decision: 'establish-now',
        source_cluster_ids: ['recipes-costing'],
        rationale: 'Recipe knowledge, yields, scaling and cost calculations are strongly connected, but cost claims require authoritative purchase prices and quantities.',
        research_route: '/workspace/kitchen/recipes/search-demand',
      },
      {
        id: 'mise-production', title: 'Mise and Production', decision: 'establish-now',
        source_cluster_ids: ['mise-production'],
        rationale: 'Preparation is a frequent Kitchen job with its own planning, assignment, readiness and production evidence. Mise remains the deliberate Misebox term; the underlying research stays clinical.',
        research_route: '/workspace/kitchen/mise/search-demand',
      },
      {
        id: 'orders-service', title: 'Orders and Service', decision: 'establish-now',
        source_cluster_ids: ['orders-service'],
        rationale: 'Kitchen order intake, routing, station progress, expo and timing need deeper research while Tables, payment and guest service remain Front-of-House boundaries.',
        research_route: '/workspace/kitchen/orders/search-demand',
      },
      {
        id: 'menus', title: 'Menus', decision: 'establish-now',
        source_cluster_ids: ['menus'],
        rationale: 'Menus connect dishes, prices, availability and publication. Deeper research must distinguish menu management, publishing and menu engineering rather than treating them as one generic page.',
        research_route: '/workspace/kitchen/menus/search-demand',
      },
      {
        id: 'ingredients', title: 'Ingredients', decision: 'establish-now',
        source_cluster_ids: ['allergens-nutrition', 'recipes-costing', 'inventory-stocktake'],
        rationale: 'Ingredients connect allergen knowledge, recipes, purchase prices and stock. The connected Kitchen graph requires this operator-facing capability even though searches often name its downstream jobs.',
        research_route: '/workspace/kitchen/ingredients/search-demand',
      },
      {
        id: 'dishes', title: 'Dishes', decision: 'establish-now',
        source_cluster_ids: ['recipes-costing', 'menus'],
        rationale: 'Dishes are the sellable Kitchen composition connecting recipes, menu placement, availability and operational evidence.',
        research_route: '/workspace/kitchen/dishes/search-demand',
      },
      {
        id: 'drinks', title: 'Drinks', decision: 'establish-now',
        source_cluster_ids: ['recipes-costing', 'menus'],
        rationale: 'Drinks share menu and costing concerns while retaining their own preparation, ingredient and service conventions.',
        research_route: '/workspace/kitchen/drinks/search-demand',
      },
      {
        id: 'stations', title: 'Stations', decision: 'establish-now',
        source_cluster_ids: ['mise-production', 'orders-service', 'team-training'],
        rationale: 'Stations route preparation, live orders and Kitchen responsibility without becoming a generic workforce structure.',
        research_route: '/workspace/kitchen/stations/search-demand',
      },
      {
        id: 'suppliers', title: 'Suppliers', decision: 'establish-now',
        source_cluster_ids: ['purchasing-receiving-suppliers'],
        rationale: 'Supplier identity and terms support purchasing and receiving while remaining distinct from those operations.',
        research_route: '/workspace/kitchen/suppliers/search-demand',
      },
      {
        id: 'team-training', title: 'Kitchen Team and Training', decision: 'establish-later',
        source_cluster_ids: ['team-training'],
        rationale: 'Roles, station competence, handovers and operational training belong to the Kitchen, while payroll and generic HR do not. Current evidence needs a broader dedicated pass.',
        research_route: '/workspace/kitchen/team/search-demand',
      },
      {
        id: 'equipment-maintenance', title: 'Equipment and Maintenance', decision: 'establish-later',
        source_cluster_ids: ['equipment-maintenance'],
        rationale: 'Equipment availability and maintenance matter operationally, but the current query evidence is too thin to justify a capability boundary.',
        research_route: '/workspace/kitchen/equipment/search-demand',
      },
      {
        id: 'formats-scale', title: 'Kitchen Formats and Scale', decision: 'context',
        source_cluster_ids: ['formats-scale'],
        rationale: 'Restaurant, bakery, catering, cloud, commissary and institutional Kitchens are contexts in which the selected jobs vary. Apply them as a validation lens to every deeper pass rather than creating format-shaped navigation.',
      },
      {
        id: 'reports', title: 'Kitchen Reports', decision: 'derived',
        source_cluster_ids: ['reports-analysis'],
        rationale: 'Research reports by their real names, but expose them only after Sales, Food Safety, Stock, Waste, Costing or Service produces authoritative operational evidence.',
      },
      {
        id: 'front-of-house', title: 'Front of House', decision: 'boundary',
        source_cluster_ids: [],
        rationale: 'Tables, guest service and payment are adjacent hospitality domains. Kitchen capabilities may receive orders or publish availability across that boundary without making Front of House Kitchen-owned.',
      },
      {
        id: 'business-administration', title: 'Payroll, Tax and General Accounting', decision: 'boundary',
        source_cluster_ids: [],
        rationale: 'Misebox must not turn bounded Kitchen sales or recipe-cost estimates into unsupported payroll, tax, cashflow, profit or accounting promises.',
      },
    ],
    next_step: 'Organise these capability pages into the Kitchen Workspace, then deepen Food Safety first and derive its operator tools.',
  },
  observations,
})
