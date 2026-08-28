import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'

export const workspaceProposal: NonNullable<AppSearchDemand['capabilities']['workspace']> = {
      summary:
        'The operator-facing menu used by the current Kitchen Workspace.',
      groups: [
        {
          label: 'Workspace',
          items: [
            {
              label: 'Today',
              icon: 'i-lucide-calendar-check',
              brief:
                'Open the selected Kitchen with the work, risks and decisions that need attention today.',
            },
            {
              label: 'Overview',
              icon: 'i-lucide-layout-dashboard',
              brief:
                'Understand the selected Kitchen and route into its operational capabilities.',
            },
            {
              label: 'Identity',
              icon: 'i-lucide-id-card',
              brief:
                'Maintain the Kitchen identity and its joined Place presentation.',
            },
            {
              label: 'Team',
              icon: 'i-lucide-users',
              capability_id: 'team-training',
            },
          ],
        },
        {
          label: 'Food & Drink',
          items: [
            {
              label: 'Menus',
              icon: 'i-lucide-book-open',
              capability_id: 'menus',
            },
            {
              label: 'Dishes',
              icon: 'i-lucide-utensils',
              capability_id: 'dishes',
            },
            {
              label: 'Drinks',
              icon: 'i-lucide-glass-water',
              capability_id: 'drinks',
            },
            {
              label: 'Recipes',
              icon: 'i-lucide-notebook-tabs',
              capability_id: 'recipes-costing',
            },
            {
              label: 'Ingredients',
              icon: 'i-lucide-carrot',
              capability_id: 'ingredients',
            },
          ],
        },
        {
          label: 'Operations',
          items: [
            {
              label: 'Food Safety',
              icon: 'i-lucide-shield-check',
              capability_id: 'food-safety',
            },
            {
              label: 'Mise',
              icon: 'i-lucide-list-checks',
              capability_id: 'mise-production',
            },
            {
              label: 'Orders & Service',
              icon: 'i-lucide-receipt-text',
              capability_id: 'orders-service',
            },
            {
              label: 'Inventory',
              icon: 'i-lucide-boxes',
              capability_id: 'inventory',
            },
            {
              label: 'Purchasing',
              icon: 'i-lucide-shopping-cart',
              capability_id: 'purchasing',
            },
            {
              label: 'Receiving',
              icon: 'i-lucide-package-check',
              capability_id: 'receiving',
            },
            {
              label: 'Waste',
              icon: 'i-lucide-trash-2',
              capability_id: 'waste',
            },
          ],
        },
        {
          label: 'Kitchen Setup',
          items: [
            {
              label: 'Stations',
              icon: 'i-lucide-layout-grid',
              capability_id: 'stations',
            },
            {
              label: 'Suppliers',
              icon: 'i-lucide-truck',
              capability_id: 'suppliers',
            },
          ],
        },
        {
          label: 'Reports',
          items: [
            {
              label: 'Sales',
              icon: 'i-lucide-chart-column',
              capability_id: 'reports',
              brief:
                'Review bounded sales measures produced by completed Kitchen sales.',
            },
            {
              label: 'Costs',
              icon: 'i-lucide-calculator',
              capability_id: 'reports',
              brief:
                'Aggregate cost evidence only when Recipes, Ingredients and purchase prices are authoritative.',
            },
            {
              label: 'Waste',
              icon: 'i-lucide-recycle',
              capability_id: 'reports',
              brief:
                'Summarise recorded waste without replacing the operational Waste capability.',
            },
            {
              label: 'Performance',
              icon: 'i-lucide-gauge',
              capability_id: 'reports',
              brief:
                'Compare supported service and production measures without inventing profit or labour evidence.',
            },
          ],
        },
      ],
    }

