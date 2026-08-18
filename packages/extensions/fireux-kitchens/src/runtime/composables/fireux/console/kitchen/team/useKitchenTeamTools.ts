import { kitchenTeamHumanTools } from '../../../../../tools/kitchen/team'

export function useKitchenTeamTools() {
  return kitchenTeamHumanTools.map((tool) => ({
    id: tool.id,
    ...tool.surfaces.human,
  }))
}
