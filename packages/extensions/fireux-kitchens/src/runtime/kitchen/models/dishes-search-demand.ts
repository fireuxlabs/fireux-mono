export type KitchenDishesToolHypothesis = { id: `kitchen.dishes.${string}`; label: string; layer: 'human' | 'ai-assisted' | 'compound'; purpose: string; inputs: readonly string[]; outputs: readonly string[]; evidence: readonly string[]; authority: string; approval: string; status: 'requested' | 'available' }

export const kitchenDishesSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do when they search for restaurant Dish management?',
  method: 'Current search results establish operator language. Product, educational and research literature validates the jobs. Search claims do not define the canonical Dish or prove a Tool exists.',
  seeds: [
    { seed: 'restaurant Dish management', queries: ['restaurant dish management software', 'menu item management restaurant', 'restaurant dish specification', 'standard dish specification restaurant'] },
    { seed: 'Dish and plate costing', queries: ['food cost per dish calculator', 'restaurant dish costing software', 'plate cost calculator restaurant', 'cost per portion restaurant'] },
    { seed: 'Dish profitability', queries: ['menu item profitability analysis', 'most profitable restaurant dishes', 'dish contribution margin calculator', 'restaurant food cost percentage per dish'] },
    { seed: 'Dish popularity', queries: ['restaurant dish popularity analysis', 'best selling menu items report', 'menu item sales mix', 'menu engineering popularity index'] },
  ],
  clusters: [
    { id: 'specify', title: 'Maintain a consistent Dish specification', operatorJob: 'Define what the Kitchen sells as one Dish, including portion, components, assembly and production Station.', evidenceQueries: ['restaurant dish specification', 'standard dish specification restaurant'], interpretation: 'Dish owns the sellable food-item specification. Recipe owns production method and yield; Menu owns placement and displayed offer.' },
    { id: 'cost', title: 'Know the evidenced cost per Dish', operatorJob: 'Roll Recipe and Ingredient costs through yields, portions and units to calculate the direct food cost of one Dish.', evidenceQueries: ['food cost per dish calculator', 'cost per portion restaurant'], interpretation: 'A calculated cost is derived evidence with source prices, units and effective time. Missing or incompatible inputs remain unknown.' },
    { id: 'popularity', title: 'Understand what actually sells', operatorJob: 'Compare Dish quantities across a bounded period, Menu or service context.', evidenceQueries: ['best selling menu items report', 'menu item sales mix'], interpretation: 'Popularity derives from authoritative KitchenSale lines. Views, guesses and cross-Kitchen totals are not equivalent evidence.' },
    { id: 'profitability', title: 'Compare price, cost and sales contribution', operatorJob: 'Review contribution margin alongside popularity to support an accountable Dish or Menu decision.', evidenceQueries: ['menu item profitability analysis', 'dish contribution margin calculator'], interpretation: 'Price alone does not prove profit. The analysis must name the price, evidenced direct cost, sales period and excluded overheads.' },
  ],
  validationSources: [
    { label: 'Food Profit Tools recipe cost calculator', url: 'https://foodprofittools.com/recipe-cost-calculator/', note: 'Validates demand for ingredient, yield, batch and per-serving evidence when calculating the cost of a Dish.' },
    { label: 'Tableview Menu engineering guide', url: 'https://www.tableview.com/blog/menu-engineering/', note: 'Validates contribution margin and bounded item popularity as separate evidence axes.' },
    { label: 'Bayesian prediction of food and beverage sales', url: 'https://arxiv.org/abs/2005.12647', note: 'Validates the operational relevance of menu-item sales evidence to purchasing, waste and profitability decisions without making predictions authoritative facts.' },
  ],
  records: [
  {
    id: 'kitchen.dishes.dish',
    label: 'Dish',
    kind: 'owned',
    status: 'available',
    owner: 'Dishes',
    authority: 'Dish owns the Kitchen-local sellable food identity and specification fields currently supported by its model and mutations.',
    facts: [ 'stable Dish identity', 'food item kind', 'name, description and image', 'lifecycle and audit stamps' ],
    readBy: [
      'kitchen.dishes.update-dish',
      'kitchen.dishes.delete-dish',
      'kitchen.dishes.calculate-cost',
      'kitchen.dishes.analyze-profitability',
      'kitchen.dishes.compare-popularity'
    ],
    writtenBy: [ 'kitchen.dishes.create-dish', 'kitchen.dishes.update-dish', 'kitchen.dishes.delete-dish' ]
  },
  {
    id: 'kitchen.dishes.commercial-evidence',
    label: 'Dish commercial evidence',
    kind: 'reference',
    status: 'partial',
    owner: 'Recipes, Ingredients, Menus and Sales',
    authority: 'Dishes may compose these records but never copies their cost, price or Sale authority.',
    facts: [ 'Recipe and Ingredient specification', 'Menu placement and captured price', 'KitchenSale quantity and value' ],
    readBy: [ 'kitchen.dishes.calculate-cost', 'kitchen.dishes.analyze-profitability', 'kitchen.dishes.compare-popularity' ],
    writtenBy: []
  }
],
  recordQuestions: ['Which Kitchen owns the Dish and what is its stable identity?', 'Is it food rather than a Drink, and which lifecycle state is current?', 'Which Recipe or Recipes produce its components and portions?', 'What portion, yield conversion, assembly and Station define the specification?', 'Which dietary or allergen facts resolve from authoritative Ingredient and Recipe evidence?', 'Which Ingredient prices, units, yields and effective dates support its calculated direct cost?', 'Which Menu placements and displayed prices reference the Dish without becoming Dish-owned facts?', 'Which bounded KitchenSale lines support popularity and contribution analysis?', 'Which costs or sales are missing, stale or incompatible?', 'Which proposed specification change requires explicit operator approval?'],
  toolHypotheses: [
    { id: 'kitchen.dishes.create-dish', label: 'Create Dish', layer: 'human', purpose: 'Create one Kitchen-owned sellable food item.', inputs: ['name', 'optional description and image'], outputs: ['actor-stamped Dish'], evidence: ['current Kitchen and actor'], authority: 'The guarded Dish create mutation writes Dish-owned fields and Firestore rules authorize the selected Kitchen path.', approval: 'The operator explicitly submits the Dish.', status: 'available' },
    { id: 'kitchen.dishes.update-dish', label: 'Update Dish', layer: 'human', purpose: 'Update the current Dish image, name, description or flagship selection.', inputs: ['current Dish', 'operator-confirmed named changes'], outputs: ['actor-stamped Dish changes'], evidence: ['canonical Dish and current Kitchen authority'], authority: 'Guarded Dish field and media mutations write only their bounded Dish fields; Firestore rules and the flagship server command enforce their respective authority.', approval: 'The operator explicitly submits each change.', status: 'available' },
    { id: 'kitchen.dishes.delete-dish', label: 'Delete Dish', layer: 'human', purpose: 'Permanently remove one Dish after reviewing the selected record.', inputs: ['current Dish identity'], outputs: ['confirmed deletion'], evidence: ['canonical Dish and current Kitchen authority'], authority: 'The guarded Dish delete mutation targets only the selected Dish and Firestore rules authorize the Kitchen path.', approval: 'The destructive action requires explicit operator confirmation.', status: 'available' },
    { id: 'kitchen.dishes.calculate-cost', label: 'Dish Cost Calculator', layer: 'ai-assisted', purpose: 'Calculate direct food cost per Dish from its Recipe, Ingredient prices, yields and portion evidence.', inputs: ['Dish specification', 'Recipe yields and quantities', 'effective Ingredient prices and units'], outputs: ['source-linked Dish cost with effective time and unknowns'], evidence: ['canonical Dish, Recipe and Ingredient records'], authority: 'The Tool does not invent prices, unit conversions, yield or overhead and does not store a guess as authoritative cost.', approval: 'Calculation is read-only; accepting a changed specification or price is separate.', status: 'requested' },
    { id: 'kitchen.dishes.analyze-profitability', label: 'Menu Item Profit Calculator', layer: 'ai-assisted', purpose: 'Compare selling price, evidenced direct cost and bounded sales contribution for a Dish.', inputs: ['Dish', 'Menu price context', 'calculated Dish cost', 'KitchenSale period'], outputs: ['source-linked contribution view with exclusions and uncertainty'], evidence: ['approved cost calculation and authoritative KitchenSale lines'], authority: 'The Tool reports contribution, not unsupported net profit, and leaves missing evidence visible.', approval: 'Analysis is read-only; any pricing or specification action remains explicit.', status: 'requested' },
    { id: 'kitchen.dishes.compare-popularity', label: 'Dish Popularity Analysis', layer: 'ai-assisted', purpose: 'Compare Dish sales quantities for a selected Kitchen, period and relevant Menu context.', inputs: ['Dish set', 'bounded KitchenSale lines', 'period and comparison scope'], outputs: ['traceable popularity measures and comparison'], evidence: ['authoritative KitchenSale item quantities'], authority: 'The Tool cannot substitute page views, inferred demand or cross-scope totals for sales.', approval: 'Read-only analysis needs no mutation approval.', status: 'requested' },
  ] satisfies KitchenDishesToolHypothesis[],
  aiContract: {
    dishesAI: ['Own Dish specification interpretation, derived cost and bounded performance deductions.', 'Resolve Recipe, Ingredient, Menu, Station and KitchenSale evidence from their owning capabilities.', 'Keep canonical Dish facts, derived calculations, proposals and accepted changes distinct.', 'Never invent a cost, sale, allergen, yield, price or profitability claim.', 'Expose Create Dish, Update Dish and Delete Dish as available and preserve the requested status of unimplemented Tools.'],
    kitchenAI: ['Recognise Dish intent and delegate it to DishesAI.', 'Pass selected Kitchen and authorized context without copying Dish expertise.', 'Coordinate explicit handoffs to Recipes, Ingredients, Menus, Stations and Finance.', 'Discover real Tool availability through DishesAI registration and preserve approvals.'],
    activation: ['Canonical Dish specification and lifecycle records are confirmed.', 'Trusted Recipe, Ingredient, Menu, Station and KitchenSale readers exist.', 'Unit, yield, effective-price and sales-period rules are explicit.', 'Commands preserve ownership, authorization, stamps and named changes.', 'Tool registration, approvals, UI and verification are complete.'],
  },
  conclusion: 'Dishes owns the sellable food-item specification. Cost, popularity and contribution are derived only from authoritative Recipe, Ingredient, Menu-price and KitchenSale evidence; a missing input remains visible rather than becoming an invented commercial promise.',
} as const
