import { writeKitchenAgentUsage } from '../../../kitchen/server/ai/usage.ts'
import type { FireuxAgentTip } from 'fireux-ai/runtime/agents/agent-tip'

export async function writeKitchenMenuAgentUsage(input: {
  appId: string
  kitchenId: string
  actorId: string
  agent: string
  task: string
  provider?: string
  model?: string
  usage?: Record<string, unknown>
  tip?: FireuxAgentTip
}) {
  return writeKitchenAgentUsage({ ...input, kind: 'menu_ai_agent' })
}
