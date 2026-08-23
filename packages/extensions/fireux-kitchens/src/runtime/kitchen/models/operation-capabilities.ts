import { kitchenCostsSearchDemand } from './costs-search-demand'
import { kitchenDishesSearchDemand } from './dishes-search-demand'
import { kitchenDrinksSearchDemand } from './drinks-search-demand'
import { kitchenFoodSafetySearchDemand } from './food-safety-search-demand'
import { kitchenIdentitySearchDemand } from './identity-search-demand'
import { kitchenIngredientsSearchDemand } from './ingredients-search-demand'
import { kitchenInventorySearchDemand } from './inventory-search-demand'
import { kitchenMenusSearchDemand } from './menus-search-demand'
import { kitchenMiseSearchDemand } from './mise-search-demand'
import { kitchenOrdersSearchDemand } from './orders-search-demand'
import { kitchenPerformanceSearchDemand } from './performance-search-demand'
import { kitchenPurchasingSearchDemand } from './purchasing-search-demand'
import { kitchenReceivingSearchDemand } from './receiving-search-demand'
import { kitchenRecipesSearchDemand } from './recipes-search-demand'
import { kitchenSalesSearchDemand } from './sales-search-demand'
import { kitchenStationsSearchDemand } from './stations-search-demand'
import { kitchenSuppliersSearchDemand } from './suppliers-search-demand'
import { kitchenTeamSearchDemand } from './team-search-demand'
import { kitchenWasteReportSearchDemand } from './waste-report-search-demand'
import { kitchenWasteSearchDemand } from './waste-search-demand'

export type KitchenOperationToolStatus =
  | 'requested'
  | 'building'
  | 'available'
  | 'agent-ready'

export type KitchenOperationToolCapability = {
  id: `kitchen.${string}.${string}`
  label: string
  description: string
  status: KitchenOperationToolStatus
  requiredRecords: readonly string[]
  authority: string
  approval: string
}

type ResearchTool = {
  id: `kitchen.${string}.${string}`
  label: string
  purpose: string
  status: 'requested' | 'available'
  evidence?: readonly string[]
  inputs?: readonly string[]
  authority: string
  approval: string
}

const researchTools = (
  tools: readonly ResearchTool[]
): readonly KitchenOperationToolCapability[] =>
  tools.map((tool) => ({
    id: tool.id,
    label: tool.label,
    description: tool.purpose,
    status: tool.status,
    requiredRecords: tool.evidence || tool.inputs || [],
    authority: tool.authority,
    approval: tool.approval,
  }))

const liveTeamTools: readonly KitchenOperationToolCapability[] =
  kitchenTeamSearchDemand.liveTools.map((tool) => ({
    id: tool.id,
    label:
      tool.surfaces.human === false
        ? tool.context.instruction
        : tool.surfaces.human.label,
    description: tool.context.outcome,
    status: tool.surfaces.agent.callable
      ? ('agent-ready' as const)
      : ('available' as const),
    requiredRecords: [tool.context.target],
    authority: tool.context.constraints?.join(' ') || 'Selected Kitchen Team.',
    approval:
      tool.confirmation === 'required'
        ? 'Explicit confirmation is required.'
        : 'No mutation confirmation is required.',
  }))

export const kitchenOperationToolCapabilities = {
  identity: researchTools(kitchenIdentitySearchDemand.toolHypotheses),
  dishes: researchTools(kitchenDishesSearchDemand.toolHypotheses),
  drinks: researchTools(kitchenDrinksSearchDemand.toolHypotheses),
  ingredients: researchTools(kitchenIngredientsSearchDemand.toolHypotheses),
  'food-safety': researchTools(kitchenFoodSafetySearchDemand.toolHypotheses),
  menus: researchTools(kitchenMenusSearchDemand.toolHypotheses),
  mise: researchTools(kitchenMiseSearchDemand.toolHypotheses),
  orders: researchTools(kitchenOrdersSearchDemand.toolHypotheses),
  inventory: researchTools(kitchenInventorySearchDemand.toolHypotheses),
  purchasing: researchTools(kitchenPurchasingSearchDemand.toolHypotheses),
  receiving: researchTools(kitchenReceivingSearchDemand.toolHypotheses),
  waste: researchTools(kitchenWasteSearchDemand.toolHypotheses),
  recipes: researchTools(kitchenRecipesSearchDemand.toolHypotheses),
  stations: researchTools(kitchenStationsSearchDemand.toolHypotheses),
  team: [
    ...liveTeamTools,
    ...researchTools(kitchenTeamSearchDemand.proposedTools),
  ],
  suppliers: researchTools(kitchenSuppliersSearchDemand.toolHypotheses),
  finance: researchTools(kitchenSalesSearchDemand.toolHypotheses),
  costs: researchTools(kitchenCostsSearchDemand.toolHypotheses),
  'waste-report': researchTools(
    kitchenWasteReportSearchDemand.toolHypotheses
  ),
  performance: researchTools(kitchenPerformanceSearchDemand.toolHypotheses),
} as const satisfies Record<
  string,
  readonly KitchenOperationToolCapability[]
>

export type KitchenOperationCapabilitySlug =
  keyof typeof kitchenOperationToolCapabilities
