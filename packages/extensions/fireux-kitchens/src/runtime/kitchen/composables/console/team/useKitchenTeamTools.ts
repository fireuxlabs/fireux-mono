import { kitchenTeamHumanTools } from '../../../tools/team'

export function useKitchenTeamTools() {
  return kitchenTeamHumanTools.map((tool) => ({
    id: tool.id,
    ...tool.surfaces.human,
  }))
}
