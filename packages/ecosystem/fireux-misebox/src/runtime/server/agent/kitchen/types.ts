import type { requireKitchenWriter } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import type { PendingTeamTool } from './team-tools'

export type KitchenAgentAccess = Awaited<
  ReturnType<typeof requireKitchenWriter>
>

export type KitchenAgentRequest = {
  appId: string
  kitchenId: string
  prompt: string
  operation: string
  pendingTool: PendingTeamTool | null
  availableActions: string[]
  actionTargets: KitchenAgentActionTarget[]
}

export type KitchenAgentActionTarget = {
  actionId: string
  targetId: string
  label: string
}

export type KitchenWorkspaceActionId =
  | 'create-kitchen'
  | 'complete-kitchen'
  | 'sign-up'
  | 'explore-misebox'
