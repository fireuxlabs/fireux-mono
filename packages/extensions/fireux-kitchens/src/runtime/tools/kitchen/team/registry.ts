import { kitchenTeamMemberCreateTool } from './create-member'
import { kitchenTeamMemberInvitationCreateTool } from './create-member-invitation'
import { kitchenTeamMemberDeleteTool } from './delete-member'
import { kitchenTeamMembersReadTool } from './read-members'
import { kitchenTeamMemberUpdateTool } from './update-member'

export const kitchenTeamToolRegistry = {
  [kitchenTeamMemberCreateTool.id]: kitchenTeamMemberCreateTool,
  [kitchenTeamMembersReadTool.id]: kitchenTeamMembersReadTool,
  [kitchenTeamMemberUpdateTool.id]: kitchenTeamMemberUpdateTool,
  [kitchenTeamMemberDeleteTool.id]: kitchenTeamMemberDeleteTool,
  [kitchenTeamMemberInvitationCreateTool.id]:
    kitchenTeamMemberInvitationCreateTool,
} as const

export type KitchenTeamToolId = keyof typeof kitchenTeamToolRegistry

export const kitchenTeamTools = Object.values(kitchenTeamToolRegistry)
export type KitchenTeamTool = (typeof kitchenTeamTools)[number]
export type KitchenTeamHumanTool = Extract<
  KitchenTeamTool,
  { surfaces: { human: object } }
>

export const kitchenTeamAgentTools = kitchenTeamTools.filter(
  (tool) => tool.surfaces.agent.enabled
)
export const kitchenTeamAgentToolIds = kitchenTeamAgentTools.map(
  (tool) => tool.id
) as KitchenTeamToolId[]
export const kitchenTeamHumanTools = kitchenTeamTools.filter(
  (tool): tool is KitchenTeamHumanTool => tool.surfaces.human !== false
)

export function findKitchenTeamTool(id: string) {
  return kitchenTeamToolRegistry[id as KitchenTeamToolId]
}
