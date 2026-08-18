import type { H3Event } from 'h3'
import type {
  KitchenTeamToolDefinition,
  KitchenTeamToolId,
} from '../../../../tools/kitchen/team'

export type KitchenTeamToolMember = {
  memberId: string
  name: string
  linked: boolean
}

export type KitchenTeamPreparedToolCall = {
  id: KitchenTeamToolId
  input: Record<string, unknown>
  name: string
  confirmation: string
}

export type KitchenTeamToolOutcome = {
  answer: string
  result: unknown
  createdObject?: { name: string; kind: string; to: string }
  resultAction?: { kind: 'copy'; label: string; value: string }
}

export type KitchenTeamServerTool = {
  definition: KitchenTeamToolDefinition
  prepare(
    input: unknown,
    members: readonly KitchenTeamToolMember[]
  ): KitchenTeamPreparedToolCall | null
  execute(
    event: H3Event,
    kitchenId: string,
    prepared: KitchenTeamPreparedToolCall
  ): Promise<KitchenTeamToolOutcome>
}
