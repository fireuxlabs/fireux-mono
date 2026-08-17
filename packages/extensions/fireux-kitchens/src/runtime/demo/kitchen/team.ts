import {
  KitchenTeamMemberDefaults,
  type KitchenTeamMember,
} from '../../models/kitchen/team.model'
import {
  deanosKitchenDemoIdentity,
  kitchenDemoCreated,
  kitchenDemoUpdated,
} from './core/fixtures'

export type KitchenDemoTeamMember = KitchenTeamMember

const member = (
  id: string,
  name: string,
  role: string,
  stationIds: string[],
  sortOrder: number
): KitchenDemoTeamMember => ({
  ...KitchenTeamMemberDefaults,
  id,
  kitchen_id: deanosKitchenDemoIdentity.kitchenId,
  name,
  slug: id,
  display_name: name,
  role,
  station_ids: stationIds,
  active: true,
  sort_order: sortOrder,
  status: 'active',
  station: stationIds[0] ?? '',
  shift_label: 'Day service',
  created: kitchenDemoCreated(deanosKitchenDemoIdentity, undefined, id),
  updated: kitchenDemoUpdated(undefined, id),
})

export const deanosKitchenDemoTeam = [
  member('deanos-alex', 'Alex', 'Shift lead', ['pass', 'grill'], 1),
  member('deanos-sam', 'Sam', 'Kitchen operator', ['grill', 'fryers'], 2),
  member('deanos-jo', 'Jo', 'Kitchen operator', ['prep', 'drinks'], 3),
] as const satisfies readonly KitchenDemoTeamMember[]
