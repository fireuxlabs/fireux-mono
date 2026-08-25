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
import type { KitchenCapabilityResearchRecord } from './capability-research'
import { kitchenWasteEventRecordTool } from '../tools/waste'

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
  authority: string
  approval: string
}

const recordIdsForTool = (
  records: readonly KitchenCapabilityResearchRecord[],
  toolId: `kitchen.${string}.${string}`
) =>
  records
    .filter(
      (record) =>
        record.readBy.includes(toolId) || record.writtenBy.includes(toolId)
    )
    .map((record) => record.id)

const researchTools = (
  tools: readonly ResearchTool[],
  records: readonly KitchenCapabilityResearchRecord[]
): readonly KitchenOperationToolCapability[] =>
  tools.map((tool) => ({
    id: tool.id,
    label: tool.label,
    description: tool.purpose,
    status: tool.status,
    requiredRecords: recordIdsForTool(records, tool.id),
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
    requiredRecords: recordIdsForTool(kitchenTeamSearchDemand.records, tool.id),
    authority: tool.context.constraints?.join(' ') || 'Selected Kitchen Team.',
    approval:
      tool.confirmation === 'required'
        ? 'Explicit confirmation is required.'
        : 'No mutation confirmation is required.',
  }))

const wasteTools = researchTools(
  kitchenWasteSearchDemand.toolHypotheses,
  kitchenWasteSearchDemand.records
).map((tool) =>
  tool.id === kitchenWasteEventRecordTool.id
    ? {
        ...tool,
        label: kitchenWasteEventRecordTool.surfaces.human.label,
        description: kitchenWasteEventRecordTool.surfaces.human.description,
        authority: kitchenWasteEventRecordTool.context.constraints.join(' '),
        approval:
          'The operator explicitly reviews and submits the Waste event.',
      }
    : tool
)

export const kitchenOperationToolCapabilities = {
  identity: researchTools(
    kitchenIdentitySearchDemand.toolHypotheses,
    kitchenIdentitySearchDemand.records
  ),
  dishes: researchTools(
    kitchenDishesSearchDemand.toolHypotheses,
    kitchenDishesSearchDemand.records
  ),
  drinks: researchTools(
    kitchenDrinksSearchDemand.toolHypotheses,
    kitchenDrinksSearchDemand.records
  ),
  ingredients: researchTools(
    kitchenIngredientsSearchDemand.toolHypotheses,
    kitchenIngredientsSearchDemand.records
  ),
  'food-safety': researchTools(
    kitchenFoodSafetySearchDemand.toolHypotheses,
    kitchenFoodSafetySearchDemand.records
  ),
  menus: researchTools(
    kitchenMenusSearchDemand.toolHypotheses,
    kitchenMenusSearchDemand.records
  ),
  mise: researchTools(
    kitchenMiseSearchDemand.toolHypotheses,
    kitchenMiseSearchDemand.records
  ),
  orders: researchTools(
    kitchenOrdersSearchDemand.toolHypotheses,
    kitchenOrdersSearchDemand.records
  ),
  inventory: researchTools(
    kitchenInventorySearchDemand.toolHypotheses,
    kitchenInventorySearchDemand.records
  ),
  purchasing: researchTools(
    kitchenPurchasingSearchDemand.toolHypotheses,
    kitchenPurchasingSearchDemand.records
  ),
  receiving: researchTools(
    kitchenReceivingSearchDemand.toolHypotheses,
    kitchenReceivingSearchDemand.records
  ),
  waste: wasteTools,
  recipes: researchTools(
    kitchenRecipesSearchDemand.toolHypotheses,
    kitchenRecipesSearchDemand.records
  ),
  stations: researchTools(
    kitchenStationsSearchDemand.toolHypotheses,
    kitchenStationsSearchDemand.records
  ),
  team: [
    ...liveTeamTools,
    ...researchTools(
      kitchenTeamSearchDemand.proposedTools,
      kitchenTeamSearchDemand.records
    ),
  ],
  suppliers: researchTools(
    kitchenSuppliersSearchDemand.toolHypotheses,
    kitchenSuppliersSearchDemand.records
  ),
  finance: researchTools(
    kitchenSalesSearchDemand.toolHypotheses,
    kitchenSalesSearchDemand.records
  ),
  costs: researchTools(
    kitchenCostsSearchDemand.toolHypotheses,
    kitchenCostsSearchDemand.records
  ),
  'waste-report': researchTools(
    kitchenWasteReportSearchDemand.toolHypotheses,
    kitchenWasteReportSearchDemand.records
  ),
  performance: researchTools(
    kitchenPerformanceSearchDemand.toolHypotheses,
    kitchenPerformanceSearchDemand.records
  ),
} as const satisfies Record<string, readonly KitchenOperationToolCapability[]>

export type KitchenOperationCapabilitySlug =
  keyof typeof kitchenOperationToolCapabilities
