export type KitchenRecipesToolHypothesis = { id: `kitchen.recipes.${string}`; label: string; layer: 'human' | 'ai-assisted' | 'compound'; purpose: string; inputs: readonly string[]; outputs: readonly string[]; evidence: readonly string[]; authority: string; approval: string; status: 'requested' | 'available' }

export const kitchenRecipesSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do when they search for restaurant Recipe management?',
  method: 'Current search results establish operator language. Product and educational literature validates the jobs. Search claims do not define the canonical Recipe or prove a Tool exists.',
  seeds: [
    { seed: 'restaurant Recipe management', queries: ['restaurant recipe management software', 'commercial kitchen recipe software', 'standard recipe management restaurant', 'digital recipe cards kitchen'] },
    { seed: 'Recipe scaling', queries: ['recipe scaling calculator restaurant', 'scale recipe by portions', 'commercial recipe conversion calculator', 'batch recipe calculator kitchen'] },
    { seed: 'Recipe costing', queries: ['restaurant recipe cost calculator', 'recipe costing software restaurant', 'cost per portion recipe', 'ingredient cost recipe calculator'] },
    { seed: 'Recipe yield', queries: ['recipe yield calculator', 'recipe yield management restaurant', 'edible yield recipe costing', 'portion and yield control kitchen'] },
  ],
  clusters: [
    { id: 'standardise', title: 'Maintain one production specification', operatorJob: 'Record Ingredients, quantities, units, ordered method, equipment, timing and expected output.', evidenceQueries: ['restaurant recipe management software', 'standard recipe management restaurant'], interpretation: 'Recipe is a versioned production specification. Dish and Drink reference it; training views and cards are projections.' },
    { id: 'scale', title: 'Scale safely for required output', operatorJob: 'Recalculate Ingredient quantities for a target batch, portion count or yield while preserving ratios and units.', evidenceQueries: ['recipe scaling calculator restaurant', 'batch recipe calculator kitchen'], interpretation: 'A scaled Recipe is a run-specific calculation. It does not overwrite the approved base Recipe unless an operator deliberately revises it.' },
    { id: 'yield', title: 'Measure usable output and portion conversion', operatorJob: 'Record expected and observed batch yield, preparation loss, portion size and resulting portion count.', evidenceQueries: ['recipe yield management restaurant', 'portion and yield control kitchen'], interpretation: 'Observed yield is evidence. A default or AI estimate must remain labelled and cannot silently drive authoritative cost or Inventory.' },
    { id: 'cost', title: 'Calculate batch and portion cost', operatorJob: 'Roll effective Ingredient prices, usable yields, quantities and sub-Recipes into batch and per-portion cost.', evidenceQueries: ['restaurant recipe cost calculator', 'cost per portion recipe'], interpretation: 'Cost is derived with traceable sources, units and effective time. Missing prices, conversions or yields remain unknown.' },
  ],
  validationSources: [
    { label: 'Basic Kitchen and Food Service Management', url: 'https://opentextbc.ca/basickitchenandfoodservicemanagement/open/download?type=print_pdf', note: 'Validates standard Recipes, consistent output, yield tests, portion control and cost-per-portion relationships.' },
    { label: 'Meez Recipe management and costing', url: 'https://www.getmeez.com/costing', note: 'Validates current demand language around Recipe cost, scaling, unit conversion, yield, preparation loss and sub-Recipe roll-up.' },
    { label: 'Tako Recipe creator', url: 'https://takosolutions.com/recipe-creator/', note: 'Validates Ingredient-linked Recipe construction and batch-to-portion cost as operator jobs.' },
  ],
  records: [
  {
    id: 'kitchen.recipes.recipe',
    label: 'Recipe',
    kind: 'owned',
    status: 'partial',
    owner: 'Recipes',
    authority: 'Recipe identity works today; the complete versioned components, method and yield specification remains incomplete.',
    facts: [
      'Recipe identity and lifecycle',
      'Ingredient and sub-Recipe quantities',
      'ordered method and controls',
      'expected yield and portions',
      'version and approval'
    ],
    readBy: [
      'kitchen.recipes.update-recipe',
      'kitchen.recipes.delete-recipe',
      'kitchen.recipes.scale-recipe',
      'kitchen.recipes.calculate-cost',
      'kitchen.recipes.manage-yield'
    ],
    writtenBy: [
      'kitchen.recipes.create-recipe',
      'kitchen.recipes.update-recipe',
      'kitchen.recipes.delete-recipe',
      'kitchen.recipes.manage-yield'
    ]
  },
  {
    id: 'kitchen.recipes.ingredient-evidence',
    label: 'Recipe Ingredient evidence',
    kind: 'reference',
    status: 'partial',
    owner: 'Ingredients',
    authority: 'Recipe calculations depend on compatible Ingredient identity, units, yields and effective acquisition evidence.',
    facts: [ 'Ingredient identity', 'unit and conversion evidence', 'yield evidence', 'effective acquisition evidence' ],
    readBy: [ 'kitchen.recipes.scale-recipe', 'kitchen.recipes.calculate-cost' ],
    writtenBy: []
  }
],
  recordQuestions: ['Which Kitchen owns the Recipe and which version is draft, approved or retired?', 'Which Ingredients or sub-Recipes are used, in what quantities and units?', 'What ordered method, equipment, timing and control points define production?', 'What expected batch yield, yield unit, portion size and portion count are approved?', 'What observed yield was measured, when, by whom and under which Recipe version?', 'Which conversions are explicit and which require density, preparation-loss or edible-yield evidence?', 'Which effective Ingredient prices support the batch and portion cost?', 'Which Dishes, Drinks or other Recipes depend on this Recipe?', 'Which scaled output is needed for a Mise or production run without changing the base Recipe?', 'Which missing evidence or proposed revision needs operator review?'],
  toolHypotheses: [
    { id: 'kitchen.recipes.create-recipe', label: 'Create Recipe', layer: 'human', purpose: 'Create the Recipe identity that later production details can build upon.', inputs: ['name', 'optional description'], outputs: ['actor-stamped Recipe'], evidence: ['current Kitchen and actor'], authority: 'The trusted Recipe create command validates identity fields and current App membership plus Kitchen access in its transaction.', approval: 'The operator explicitly submits the Recipe.', status: 'available' },
    { id: 'kitchen.recipes.update-recipe', label: 'Update Recipe', layer: 'human', purpose: 'Update the current Recipe name and description.', inputs: ['current Recipe', 'operator-confirmed name or description changes'], outputs: ['actor-stamped Recipe changes'], evidence: ['canonical Recipe and current Kitchen authority'], authority: 'The trusted Recipe update command validates editable fields, merges the edited language and rechecks current App/Kitchen authority in its transaction.', approval: 'The operator explicitly submits the named changes.', status: 'available' },
    { id: 'kitchen.recipes.delete-recipe', label: 'Delete Recipe', layer: 'human', purpose: 'Permanently remove one Recipe after reviewing its current dependencies.', inputs: ['current Recipe identity'], outputs: ['confirmed deletion'], evidence: ['canonical Recipe, current Kitchen authority and visible Dish usage'], authority: 'The trusted Recipe delete command rechecks current App membership and Kitchen access and deletes only the selected Recipe without a cascade.', approval: 'The destructive action requires explicit operator confirmation.', status: 'available' },
    { id: 'kitchen.recipes.scale-recipe', label: 'Recipe Scaling Calculator', layer: 'ai-assisted', purpose: 'Recalculate an approved Recipe for a required batch yield or portion count.', inputs: ['approved Recipe version', 'target output', 'validated conversions'], outputs: ['source-linked scaled quantities and unresolved conversions'], evidence: ['base Recipe quantities, yield and units'], authority: 'The Tool preserves ratios and never overwrites the approved Recipe or guesses an unsafe conversion.', approval: 'Read-only scaling needs no mutation approval; saving a revised base Recipe is separate.', status: 'requested' },
    { id: 'kitchen.recipes.calculate-cost', label: 'Recipe Cost Calculator', layer: 'ai-assisted', purpose: 'Calculate batch and portion cost from effective Ingredient and sub-Recipe evidence.', inputs: ['Recipe version', 'effective Ingredient prices', 'units, yields and conversions'], outputs: ['source-linked batch and portion cost with unknowns'], evidence: ['canonical Recipe and Ingredient records'], authority: 'The Tool does not invent prices, yields, conversions, labour, overhead or profit.', approval: 'Calculation is read-only; accepting a commercial change is separate.', status: 'requested' },
    { id: 'kitchen.recipes.manage-yield', label: 'Recipe Yield Management', layer: 'human', purpose: 'Record expected or observed batch yield and its portion conversion for a Recipe version.', inputs: ['Recipe version', 'yield quantity and unit', 'portion size or count', 'observation context'], outputs: ['actor-stamped yield evidence or approved specification change'], evidence: ['actual measurement or explicit operator expectation'], authority: 'Observed and expected yield remain distinct; AI estimates cannot masquerade as measurements.', approval: 'An authorized operator submits the observation or approves the specification change.', status: 'requested' },
  ] satisfies KitchenRecipesToolHypothesis[],
  aiContract: {
    recipesAI: ['Own Recipe interpretation, scaling, yield evidence and derived cost.', 'Resolve Ingredient price and identity evidence from Ingredients and expose dependencies to Dish, Drink and Mise.', 'Keep approved Recipe, observed production evidence, scaled projection, calculation and proposal distinct.', 'Never invent an Ingredient, measure, conversion, yield, cost or completed production event.', 'Expose Create Recipe, Update Recipe and Delete Recipe as available and preserve the requested status of unimplemented Tools.'],
    kitchenAI: ['Recognise Recipe intent and delegate it to RecipesAI.', 'Pass selected Kitchen and authorized context without copying Recipe expertise.', 'Coordinate explicit handoffs to IngredientsAI, DishesAI, DrinksAI and MiseAI.', 'Discover real Tool availability through RecipesAI registration and preserve approvals.'],
    activation: ['Canonical Recipe version, component, method and yield records are confirmed.', 'Trusted Ingredient, price and sub-Recipe readers exist.', 'Unit, density, preparation-loss, edible-yield and portion rules are explicit.', 'Commands preserve ownership, authorization, stamps and version history.', 'Tool registration, approvals, UI and end-to-end verification are complete.'],
  },
  conclusion: 'Recipes owns the Kitchen production specification: components, quantities, method and yield. Scaling and costing are traceable projections over an approved version; observed yield remains separate evidence, and missing conversions or prices stay unknown.',
} as const
