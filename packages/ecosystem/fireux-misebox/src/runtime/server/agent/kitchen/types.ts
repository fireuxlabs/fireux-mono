import type { requireKitchenWriter } from 'fireux-kitchens/runtime/server/kitchen/core/operator-access'
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
}
