import type { WorkspaceTeamMemberDocument } from 'fireux-core/runtime/workspace/models/team-member.model'
export type KitchenDemoTeamMember = WorkspaceTeamMemberDocument
export const deanosKitchenDemoTeam: readonly KitchenDemoTeamMember[] = [
  {
    id: 'deanos-alex',
    name: 'Alex',
    user_id: '',
    role_ids: ['operator'],
  },
  {
    id: 'deanos-sam',
    name: 'Sam',
    user_id: '',
    role_ids: ['operator'],
  },
  {
    id: 'deanos-jo',
    name: 'Jo',
    user_id: '',
    role_ids: ['operator'],
  },
]
