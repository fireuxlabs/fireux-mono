export const kitchenOverviewSearchDemand = {
  observedAt: '2026-08-23',
  geography: 'English-language web',
  language: 'English',
  question: 'What must a Kitchen operator understand before entering a specific capability?',
  method:
    'Current market language validates demand for one understandable view across connected Kitchen areas. The FireUX capability catalogue supplies the canonical groups and ownership boundaries; only proven child evidence may become a summary.',
  seeds: [
    {
      seed: 'Kitchen management overview',
      queries: ['kitchen management dashboard', 'restaurant operations dashboard', 'restaurant management overview'],
    },
    {
      seed: 'connected Kitchen system',
      queries: ['restaurant management system modules', 'all in one kitchen management software', 'restaurant operations software features'],
    },
    {
      seed: 'Kitchen setup and readiness',
      queries: ['restaurant setup checklist software', 'kitchen operations setup', 'restaurant management system onboarding'],
    },
  ],
  clusters: [
    {
      id: 'orient',
      title: 'Understand the selected Kitchen',
      operatorJob: 'Confirm which Kitchen is active and whether its essential identity and Place link are sufficiently configured.',
      owners: ['Kitchen', 'Place', 'Identity'],
      interpretation: 'Overview composes identifiers and readiness facts; Place-owned identity is not copied onto Kitchen.',
    },
    {
      id: 'discover',
      title: 'Discover what can be managed',
      operatorJob: 'Scan a stable, conventional map of Food & Drink, Operations, Kitchen Setup and Reports.',
      owners: ['Kitchen capability catalogue'],
      interpretation: 'The navigation tree is the product map. Search demand influences its doorways but does not flatten ownership.',
    },
    {
      id: 'enter',
      title: 'Enter the right capability',
      operatorJob: 'Start from a recognisable operator question and continue into the capability that owns the relevant records and Tools.',
      owners: ['Each child capability'],
      interpretation: 'Overview routes intent. It does not execute child Tools or duplicate their working interfaces.',
    },
    {
      id: 'understand',
      title: 'Understand proven coverage',
      operatorJob: 'See which capability evidence is available, missing or not yet connected without receiving invented scores or promises.',
      owners: ['Each child capability', 'Overview presentation'],
      interpretation: 'Availability and source-labelled summaries are valid; generic Kitchen health, quality, efficiency and profit are not.',
    },
  ],
  validationSources: [
    {
      label: 'FODIQ Foodservice capability overview',
      url: 'https://www.fodiq.com/foodservice/',
      note: 'Validates an operator-facing map spanning Recipes, Inventory, Orders, Suppliers, Waste, Food Safety, Sales and analysis.',
    },
    {
      label: 'Food Safe Pro dashboards',
      url: 'https://www.werfoodsafety.com/dashboards',
      note: 'Validates that overview dashboards depend on records produced by distinct checks, Inventory, production, Orders and Receiving.',
    },
    {
      label: 'OrderNow connected restaurant operations',
      url: 'https://ordernowqr.com/restaurant-management-system/',
      note: 'Validates connected navigation across Menus, Orders, Kitchen production, Inventory and reporting while retaining distinct workflows.',
    },
  ],
  recordQuestions: [
    'Which Kitchen is selected and which Place supplies its presentation identity?',
    'Which capability catalogue version determines the visible groups and routes?',
    'Which child capability owns every displayed fact or status?',
    'Is each summary live evidence, configuration state, missing evidence or explanatory literature?',
    'Can every question or summary route directly to its owning capability?',
    'Which capabilities have no authoritative producer yet and must remain explicitly unavailable?',
    'Does any displayed score imply quality, compliance, efficiency, cost or profit without a bounded source?',
  ],
  groups: [
    { title: 'Food & Drink', capabilities: ['Menus', 'Dishes', 'Drinks', 'Recipes', 'Ingredients'] },
    { title: 'Operations', capabilities: ['Mise', 'Orders & Service', 'Inventory', 'Purchasing', 'Receiving', 'Waste', 'Food Safety'] },
    { title: 'Kitchen Setup', capabilities: ['Stations', 'Suppliers'] },
    { title: 'Reports', capabilities: ['Sales', 'Costs', 'Waste Report', 'Performance'] },
  ],
  boundary: {
    owns: 'Kitchen orientation, capability grouping, doorway questions, source labels and routes.',
    doesNotOwn: 'Child records, mutations, Tools, an OverviewAI, operational task state or generic health scores.',
    today: 'Today is time-bound operational coordination. Overview is the stable map and configuration orientation.',
    kitchenAI: 'KitchenAI may use Overview to explain available capability routes, then delegates domain questions and actions to the owning specialist.',
  },
  conclusion:
    'Overview is the stable map of the selected Kitchen Workspace. It composes proven child capabilities and source-labelled readiness without becoming another operational authority or report.',
} as const
