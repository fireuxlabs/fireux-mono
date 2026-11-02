import type { FireuxCommandToolDefinition } from 'fireux-core/runtime/tools/types'

export type KitchenTeamToolDefinition = FireuxCommandToolDefinition & {
  id: `kitchen.team.${string}`
  primitive?: 'workspace.team.create-member'
  context: FireuxCommandToolDefinition['context'] & {
    target: 'WorkspaceTeamMemberDocument' | 'KitchenTeamMemberCollection'
  }
}
