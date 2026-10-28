import { randomUUID } from 'node:crypto'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenAiUsageTarget } from '../mutation-targets'
import { actualMenuAiCost } from '../../../menu/server/ai/cost.ts'
import type { FireuxAgentTip } from 'fireux-ai/runtime/models/agents/agent-tip'

export async function writeKitchenAgentUsage(input: {
  appId: string
  kitchenId: string
  actorId: string
  agent: string
  task: string
  provider?: string
  model?: string
  usage?: Record<string, unknown>
  tip?: FireuxAgentTip
  kind?: 'kitchen_ai_agent' | 'menu_ai_agent'
}) {
  const actual = actualMenuAiCost([{ model: input.model, usage: input.usage }])
  const id = randomUUID()
  const target = serverKitchenAiUsageTarget(input.kitchenId)

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    mutations.create(target, id, {
      id,
      kind: input.kind || 'kitchen_ai_agent',
      status: 'recorded',
      billable: actual.amount_minor > 0,
      billing_owner: 'kitchen',
      app_id: input.appId,
      kitchen_id: input.kitchenId,
      agent: input.agent,
      task: input.task,
      provider: input.provider || '',
      model: input.model || '',
      usage: input.usage || {},
      ...(input.tip ? { tip: input.tip } : {}),
      actual,
      amount_minor: actual.amount_minor,
      amount_label: actual.amount_label,
      currency: actual.currency,
      created: serverAuditStamp({ by: input.actorId, appId: input.appId }),
    })
  })

  return { id, ...actual }
}
