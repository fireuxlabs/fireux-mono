import type {
  KitchenDemoScenarioAssembly,
  KitchenDemoScenarioInput,
} from './types'
import { createKitchenDemoValidationContext } from './validation-context'

export function validateKitchenDemoOperations(
  input: KitchenDemoScenarioInput,
  assembly: KitchenDemoScenarioAssembly
): string[] {
  const { stationIds } =
    createKitchenDemoValidationContext(input, assembly)

  const hasInvalidStation =
    stationIds.size !== input.stations.length ||
    input.stations.some(
      (station) =>
        station.kitchen_id !== input.identity.kitchenId ||
        !station.id ||
        !station.name
    )

  const team = [...(input.team ?? [])]

  const teamIds = new Set(team.map((member) => member.id))

  const kitchenTeamIds = input.access.teamIds

  const kitchenOperatorIds = input.access.operatorIds

  const hasInvalidTeam =
    teamIds.size !== team.length ||
    team.some((member) => !member.id || !member.name) ||
    kitchenTeamIds.length !== team.length ||
    new Set(kitchenTeamIds).size !== teamIds.size ||
    kitchenTeamIds.some((id) => !teamIds.has(id)) ||
    new Set(kitchenOperatorIds).size !== kitchenOperatorIds.length ||
    kitchenOperatorIds.some((id) => !teamIds.has(id)) ||
    input.access.kitchenId !== input.identity.kitchenId


  return [
    hasInvalidStation && 'stations',
    hasInvalidTeam && 'team',
  ].filter((item): item is string => Boolean(item))
}
