import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'
import { workspaceProposal } from './capabilities-workspace'

const capabilityDecisions: AppSearchDemand['capabilities']['capabilities'] = [
      {
        id: 'food-safety',
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
        title: 'Inventory',
        decision: 'establish-now',
        source_cluster_ids: ['inventory-stocktake'],
        source_tool_ids: ['inventory-invoice-automation'],
        rationale:
          'Counts, stock levels, storage, expiry and variance form a recognisable Kitchen capability with its own recurring operator work.',
        research_route: '/workspace/kitchen/inventory/search-demand',
      },
      {
        id: 'purchasing',
        title: 'Purchasing',
        decision: 'establish-now',
        source_cluster_ids: ['purchasing-receiving-suppliers'],
        source_tool_ids: ['inventory-invoice-automation'],
        rationale:
          'Choosing what to buy, from whom, at which price and with which approval is distinct from counting or receiving stock.',
        research_route: '/workspace/kitchen/purchasing/search-demand',
      },
      {
        id: 'receiving',
        title: 'Receiving',
        decision: 'establish-now',
        source_cluster_ids: [
          'purchasing-receiving-suppliers',
          'food-safety-haccp',
        ],
        source_tool_ids: ['inventory-invoice-automation'],
        rationale:
          'Verifying quantities, condition, traceability and temperature is a distinct Kitchen operation joining supply, stock and food-safety evidence.',
        research_route: '/workspace/kitchen/receiving/search-demand',
      },
      {
        id: 'waste',
        title: 'Waste',
        decision: 'establish-now',
        source_cluster_ids: ['waste', 'inventory-stocktake'],
        source_tool_ids: [],
        rationale:
          'Recording what was wasted, why and at what operational cost is a distinct recurring job and evidence source.',
        research_route: '/workspace/kitchen/waste/search-demand',
      },
      {
        id: 'recipes-costing',
        title: 'Recipes and Costing',
        decision: 'establish-now',
        source_cluster_ids: ['recipes-costing'],
        source_tool_ids: ['recipe-book-scaling', 'recipe-portion-costing'],
        rationale:
          'Recipe knowledge, yields, scaling and cost calculations are strongly connected, but cost claims require authoritative purchase prices and quantities.',
        research_route: '/workspace/kitchen/recipes/search-demand',
      },
      {
        id: 'mise-production',
        title: 'Mise and Production',
        decision: 'establish-now',
        source_cluster_ids: ['mise-production'],
        source_tool_ids: ['mise-from-recipes'],
        rationale:
          'Preparation is a frequent Kitchen job with its own planning, assignment, readiness and production evidence. Mise remains the deliberate Misebox term; the underlying research stays clinical.',
        research_route: '/workspace/kitchen/mise/search-demand',
      },
      {
        id: 'orders-service',
        title: 'Orders and Service',
        decision: 'establish-now',
        source_cluster_ids: ['orders-service'],
        source_tool_ids: [],
        rationale:
          'Kitchen order intake, routing, station progress, expo and timing need deeper research while Tables, payment and guest service remain Front-of-House boundaries.',
        research_route: '/workspace/kitchen/orders/search-demand',
      },
      {
        id: 'menus',
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
        research_route: '/workspace/kitchen/ingredients/search-demand',
      },
      {
        id: 'dishes',
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
        research_route: '/workspace/kitchen/dishes/search-demand',
      },
      {
        id: 'drinks',
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
        research_route: '/workspace/kitchen/drinks/search-demand',
      },
      {
        id: 'stations',
        title: 'Stations',
        decision: 'establish-now',
        source_cluster_ids: [
          'mise-production',
          'orders-service',
          'team-training',
        ],
        source_tool_ids: ['mise-from-recipes'],
        rationale:
          'Stations route preparation, live orders and Kitchen responsibility without becoming a generic workforce structure.',
        research_route: '/workspace/kitchen/stations/search-demand',
      },
      {
        id: 'suppliers',
        title: 'Suppliers',
        decision: 'establish-now',
        source_cluster_ids: ['purchasing-receiving-suppliers'],
        source_tool_ids: ['inventory-invoice-automation'],
        rationale:
          'Supplier identity and terms support purchasing and receiving while remaining distinct from those operations.',
        research_route: '/workspace/kitchen/suppliers/search-demand',
      },
      {
        id: 'team-training',
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
        title: 'Kitchen Reports',
        decision: 'derived',
        source_cluster_ids: ['reports-analysis'],
        source_tool_ids: [
          'recipe-portion-costing',
          'inventory-invoice-automation',
        ],
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

export const capabilities: AppSearchDemand['capabilities'] = {
  summary: 'The first Kitchen capability map connects food knowledge to safe preparation, stock, supply and live service while keeping reporting and adjacent hospitality work explicit.',
  workspace: workspaceProposal,
  capabilities: capabilityDecisions,
  next_step: 'Use the existing capability research routes as the evidence boundary: test the already-proved reviewed Menu import flow first, and validate demand for requested Recipe scaling and costing before completing their authoritative records and Tools.',
}

