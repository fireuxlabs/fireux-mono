import { kitchenDrinksSearchDemand } from 'fireux-kitchens/runtime/kitchen/models/drinks-search-demand'
import type { Dish } from 'fireux-kitchens/runtime/kitchen/utils/dish'

type ToolSummary = {
  id: string
  label: string
  description: string
  status: string
  authority: string
  approval: string
}

export function buildDrinksAgentContext(
  drinks: readonly Dish[],
  toolCatalogue: readonly ToolSummary[]
): Record<string, unknown> {
  return {
    operation: 'Drinks',
    authority: 'advisory',
    drinks: drinks.map((drink) => ({
      id: drink.id,
      name: drink.name,
      description: drink.description,
      image: drink.image,
    })),
    evidence_readiness: {
      drink_identity: 'connected',
      recipe_and_measures: 'not-supplied',
      ingredient_links_and_prices: 'not-supplied',
      inventory_counts_and_levels: 'not-supplied',
      menu_placement_and_price: 'not-supplied',
      bounded_sales: 'not-supplied',
    },
    research: {
      question: kitchenDrinksSearchDemand.question,
      operator_jobs: kitchenDrinksSearchDemand.clusters.map((cluster) => ({
        id: cluster.id,
        title: cluster.title,
        job: cluster.operatorJob,
        interpretation: cluster.interpretation,
      })),
      conclusion: kitchenDrinksSearchDemand.conclusion,
    },
    tool_catalogue: toolCatalogue,
    instruction:
      'Inspect only the supplied canonical Drink records. An empty image is direct evidence that an image is missing. Explain both what DrinksAI can inspect now and which future beverage deductions are supported by the research contract, but distinguish them clearly. A poor-stock-holding or remove-from-menu recommendation requires a Drink linked through Recipe or packaged-beverage identity to Ingredients, compatible Inventory counts and levels, bounded usage or Sales, effective cost, and Menu placement. None of that operational evidence is supplied here, so do not make that recommendation for a real Drink. Use the Tool catalogue as capability language, preserve every status, and never present a requested Tool as executable. Do not infer Recipe, Ingredient, cost, price, sales, allergen, stock, profitability or causation facts that are not supplied.',
  }
}
