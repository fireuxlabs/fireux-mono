import type { KitchenAIToolNugget } from '../../../../../components/Console/Kitchen/AI/types'

const kitchenTeamAITools = [] as const satisfies readonly KitchenAIToolNugget[]

export function useKitchenTeamAITools() {
  return kitchenTeamAITools
}
