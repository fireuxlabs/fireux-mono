export type KitchenCostsToolHypothesis = { id: `kitchen.costs.${string}`; label: string; layer: 'human' | 'ai-assisted' | 'compound'; purpose: string; inputs: readonly string[]; outputs: readonly string[]; evidence: readonly string[]; authority: string; approval: string; status: 'requested' }

export const kitchenCostsSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do when they search for restaurant Cost reporting?',
  method: 'Current search results establish operator language. Product and educational literature validates distinct cost jobs. FireUX capability claims remain bounded by current operational producers and must not turn estimates into accounting truth.',
  seeds: [
    { seed: 'restaurant food Cost', queries: ['restaurant food cost report', 'restaurant food cost percentage', 'restaurant cost analysis', 'food cost dashboard restaurant'] },
    { seed: 'theoretical and actual Cost', queries: ['actual vs theoretical food cost', 'ideal food cost restaurant', 'restaurant food cost variance', 'theoretical cost report restaurant'] },
    { seed: 'Recipe and Ingredient Cost', queries: ['recipe cost report', 'ingredient cost report', 'restaurant ingredient price history', 'cost per portion report'] },
    { seed: 'item contribution', queries: ['restaurant contribution margin calculator', 'menu item cost and margin', 'restaurant item contribution report', 'food cost percentage by dish'] },
  ],
  clusters: [
    { id: 'theoretical', title: 'Know evidenced theoretical direct food cost', operatorJob: 'Roll Recipe quantities, yields, portions and effective Ingredient acquisition prices into a cost per Recipe, Dish or Drink.', evidenceQueries: ['recipe cost report', 'cost per portion report'], interpretation: 'Theoretical direct food cost assumes the approved specification. It is not actual usage, an expense, COGS or accounting cost.' },
    { id: 'actual', title: 'Distinguish actual usage from ideal usage', operatorJob: 'Compare beginning stock, receipts or purchases, ending stock and recorded Waste with Recipe-derived expected usage.', evidenceQueries: ['actual vs theoretical food cost', 'restaurant food cost variance'], interpretation: 'FireUX cannot currently produce this report: it lacks the complete authoritative period inventory and acquisition-cost chain. The demand is recorded, not promised.' },
    { id: 'contribution', title: 'Understand item contribution', operatorJob: 'Subtract evidenced direct item cost from the captured selling price and relate it to bounded sold quantity.', evidenceQueries: ['restaurant contribution margin calculator', 'menu item cost and margin'], interpretation: 'Contribution before excluded costs is not net profit. Labour, packaging, channel fees, overhead, VAT, Waste and other costs remain explicit exclusions unless produced.' },
    { id: 'trace', title: 'Trace every cost to its source', operatorJob: 'Inspect which Recipe version, quantities, yields, units and effective prices produced a number and which inputs are missing.', evidenceQueries: ['ingredient cost report', 'restaurant ingredient price history'], interpretation: 'Supplier catalogue offers may support a labelled planning estimate but are not purchases, receipts, invoices, Inventory consumption or expenses.' },
  ],
  validationSources: [
    { label: 'Crunchtime actual versus theoretical food Cost', url: 'https://www.crunchtime.com/inventory-management/food-cost-management', note: 'Validates the distinct evidence required for theoretical cost, actual cost and variance: prices, Recipes, Sales, Inventory counts and Waste.' },
    { label: 'RestaurantMargin food Cost formulas', url: 'https://restaurantmargin.com/food-cost-formula', note: 'Validates that per-item food-cost percentage and contribution answer narrower questions and exclude labour, occupancy, fees, tax and other costs.' },
    { label: 'Basic Kitchen and Food Service Management', url: 'https://opentextbc.ca/basickitchenandfoodservicemanagement/open/download?type=pdf', note: 'Validates selling price, food cost, food-cost percentage and contribution margin as separately defined measures.' },
  ],
  records: [
  {
    id: 'kitchen.costs.operational-evidence',
    label: 'Operational cost evidence',
    kind: 'reference',
    status: 'partial',
    owner: 'Recipes, Ingredients, Purchasing, Receiving and Sales',
    authority: 'Costs reads owner-authoritative specifications, acquisition evidence and Sales; it stores no accounting substitute.',
    facts: [ 'Recipe quantities and yields', 'effective Ingredient acquisition evidence', 'KitchenSale prices and quantities' ],
    readBy: [ 'kitchen.costs.food-cost-report', 'kitchen.costs.calculate-margin' ],
    writtenBy: []
  },
  {
    id: 'kitchen.costs.calculation',
    label: 'Cost calculation',
    kind: 'projection',
    status: 'requested',
    owner: 'Costs',
    authority: 'A calculation is a traceable projection with coverage and exclusions, not a canonical expense, COGS or profit record.',
    facts: [ 'measure definition', 'source identities and effective dates', 'coverage, unknowns and exclusions' ],
    readBy: [],
    writtenBy: []
  }
],
  recordQuestions: ['What exact cost measure is requested: theoretical item cost, actual period usage, variance, contribution or accounting cost?', 'Which Kitchen, currency, item, Recipe version and effective period define the calculation?', 'Which Ingredient quantities, units, conversions, yields and portion counts are authoritative?', 'Which purchase, receipt or approved acquisition-price evidence supports each Ingredient cost?', 'Is a Supplier offer being used only as a clearly labelled planning estimate?', 'Which KitchenSale price and quantity evidence supports contribution?', 'Which labour, packaging, channel fees, Waste, tax, overhead or other costs are excluded?', 'Do currencies, units and effective dates reconcile?', 'Which missing inputs prevent a complete calculation?', 'Can every output be traced to its source without manufacturing an expense or FinancialFact?'],
  toolHypotheses: [
    { id: 'kitchen.costs.food-cost-report', label: 'Restaurant Food Cost Report', layer: 'compound', purpose: 'Compare supported theoretical direct food cost with bounded Sales while exposing coverage and exclusions.', inputs: ['selected Kitchen and period', 'approved Dish and Recipe specifications', 'effective Ingredient acquisition costs', 'KitchenSale lines'], outputs: ['currency-safe item and period food-cost measures, coverage and missing evidence'], evidence: ['canonical Recipe, Ingredient commercial evidence and KitchenSales'], authority: 'The Tool does not label offers as actual cost, fabricate missing prices, or claim actual usage, COGS, expenses, profit or accounting completeness.', approval: 'Read-only reporting needs no mutation approval; export or accepted source correction is separate.', status: 'requested' },
    { id: 'kitchen.costs.calculate-margin', label: 'Contribution Margin Calculator', layer: 'ai-assisted', purpose: 'Calculate captured selling price less evidenced direct item cost for an explicit item and scope.', inputs: ['Dish or Drink', 'captured Menu or Sale price', 'supported direct item cost', 'optional bounded sold quantity'], outputs: ['source-linked unit and total contribution with exclusions'], evidence: ['approved specification, effective Ingredient costs and bounded price or Sales'], authority: 'The Tool calls the result contribution before named exclusions—not net profit—and refuses incompatible currencies or incomplete cost presented as complete.', approval: 'Calculation is read-only; pricing, Recipe or purchasing changes remain explicit.', status: 'requested' },
  ] satisfies KitchenCostsToolHypothesis[],
  aiContract: {
    costsAI: ['Own cost-measure definitions, evidence coverage, exclusions and the Costs Tool catalogue.', 'Resolve Recipe, Ingredient, Purchasing, Receiving, Inventory, Waste and KitchenSale evidence from their owners.', 'Keep offer, acquisition evidence, theoretical cost, actual usage, contribution, expense and accounting fact distinct.', 'Never invent a price, conversion, yield, usage, expense, cost coverage, profit or causal explanation.', 'Expose both current Tools as requested until authoritative inputs and callable registration exist.'],
    kitchenAI: ['Recognise Cost intent and delegate it to CostsAI.', 'Ask which cost measure the operator means rather than collapsing distinct concepts.', 'Pass selected Kitchen and authorized evidence without copying Cost semantics.', 'Route missing operational evidence to its owning capability and preserve approvals.'],
    activation: ['Canonical Recipe, yield, portion and Ingredient-unit records are confirmed.', 'Authoritative effective acquisition-price evidence exists for the claimed scope.', 'KitchenSale inputs, currency rules, coverage and exclusions are explicit.', 'Trusted readers and calculators fail closed on missing or incompatible evidence.', 'Tool registration, authorization, export policy, UI and end-to-end verification are complete.'],
  },
  conclusion: 'Costs is an evidence-backed derived reporting capability, not accounting storage. The first safe scope is theoretical direct food cost and contribution with explicit coverage and exclusions; actual period food cost, variance, expenses and profit remain unavailable until their operational producers exist.',
} as const
