export type KitchenTeamToolMode = 'read' | 'write'
export type KitchenTeamToolRisk = 'read' | 'write' | 'destructive'
export type KitchenTeamToolConfirmation = 'none' | 'required'

export type KitchenTeamToolDefinition = {
  id: `kitchen.team.${string}`
  mode: KitchenTeamToolMode
  risk: KitchenTeamToolRisk
  confirmation: KitchenTeamToolConfirmation
  context: {
    target: 'KitchenTeamMember' | 'KitchenTeamMemberCollection'
    instruction: string
    outcome: string
    constraints?: readonly string[]
  }
  inputSchema: Record<string, unknown>
  surfaces: {
    human:
      | false
      | {
          placement: 'toolbar'
          group: 'create' | 'update'
          label: string
          description: string
          icon: string
        }
    agent: {
      callable: boolean
    }
  }
  result?: {
    kind: 'object' | 'collection' | 'share-link' | 'mutation'
    primaryAction?: 'copy'
    label?: string
  }
}

export function defineKitchenTeamTool<
  const Tool extends KitchenTeamToolDefinition,
>(tool: Tool): Tool {
  return tool
}
