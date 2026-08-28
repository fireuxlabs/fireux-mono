import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const demandTools: AppSearchDemand['tools'] = {
    summary:
      'Qualitative priorities combine observed demand, purchase intent, current Misebox readiness, strategic fit and bounded implementation cost. They do not contain search volume, CPC, conversion or market-size claims.',
    tools: [
      {
        id: 'menu-import-publish',
        title: 'Menu Import and Publishing',
        source_cluster_ids: ['menus'],
        operator_job:
          'Turn an existing document, image or URL into a reviewed Menu and make the approved result available through supported Menu surfaces.',
        outcome:
          'A source-linked draft becomes an operator-confirmed Menu; publication remains a separate reviewed action.',
        status: 'test-now',
      },
      {
        id: 'recipe-book-scaling',
        title: 'Recipe Book and Scaling',
        source_cluster_ids: ['recipes-costing', 'mise-production'],
        operator_job:
          'Maintain one production specification and calculate quantities for a required batch or portion count.',
        outcome:
          'An approved Recipe can produce a traceable scaled projection without overwriting its base version.',
        status: 'research-next',
      },
      {
        id: 'recipe-portion-costing',
        title: 'Recipe and Portion Costing',
        source_cluster_ids: ['recipes-costing', 'menus', 'reports-analysis'],
        operator_job:
          'Understand batch, portion and Menu-item cost from current Ingredient and purchase evidence.',
        outcome:
          'Operators see source-linked costs and explicit unknowns rather than guessed prices, conversions, yields or profit.',
        status: 'research-next',
      },
      {
        id: 'allergen-documentation',
        title: 'Allergen Documentation',
        source_cluster_ids: [
          'allergens-nutrition',
          'food-safety-haccp',
          'menus',
        ],
        operator_job:
          'Keep written allergen information current as Ingredients, Recipes, Dishes and Menus change.',
        outcome:
          'Jurisdiction-labelled documentation traces disclosed allergens to current Kitchen evidence without making medical or legal guarantees.',
        status: 'research-next',
      },
      {
        id: 'mise-from-recipes',
        title: 'Mise from Recipes',
        source_cluster_ids: ['mise-production', 'recipes-costing'],
        operator_job:
          'Turn required Recipe output into reviewable preparation work by Station, assignee and due time.',
        outcome:
          'Approved Recipe and service evidence proposes explicit Mise tasks; an operator remains responsible for creating and changing work.',
        status: 'later',
      },
      {
        id: 'inventory-invoice-automation',
        title: 'Inventory and Invoice Automation',
        source_cluster_ids: [
          'inventory-stocktake',
          'purchasing-receiving-suppliers',
          'recipes-costing',
        ],
        operator_job:
          'Capture purchases and price changes, count stock and connect effective Ingredient cost to Recipes.',
        outcome:
          'Trusted supplier and stock evidence can support cost and replenishment decisions without duplicate entry.',
        status: 'later',
      },
      {
        id: 'broad-restaurant-erp',
        title: 'Broad Restaurant ERP',
        source_cluster_ids: ['formats-scale', 'reports-analysis'],
        operator_job:
          'Replace POS, accounting, payroll, workforce, ordering and Kitchen systems with one suite.',
        outcome:
          'This remains outside the proved Kitchen product boundary; Misebox composes named Kitchen capabilities and integrations instead of promising an unproved all-in-one replacement.',
        status: 'boundary',
      },
    ],
    next_step:
      'Run the Menu import and publishing acquisition test now; use qualified interest in Recipe scaling, costing and allergen documentation to choose the next authoritative record and Tool slice.',
  }

