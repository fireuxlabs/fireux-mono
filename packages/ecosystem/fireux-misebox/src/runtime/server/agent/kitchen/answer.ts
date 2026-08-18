import { createError, type H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import {
  extractFireuxAgentTip,
  fireuxAgentTipInstruction,
} from 'fireux-ai/runtime/agents/agent-tip'
import { writeKitchenAgentUsage } from 'fireux-kitchens/runtime/server/kitchen/ai/usage'
import { readKitchenAgentContext } from './context'
import type { KitchenAgentAccess, KitchenAgentRequest } from './types'

const text = (value: unknown) => String(value ?? '').trim()

export async function answerKitchenAgent(
  event: H3Event,
  request: KitchenAgentRequest,
  access: KitchenAgentAccess
) {
  const ai = useFireuxAi(event)
  const context = await readKitchenAgentContext(access, request)
  const response = await ai.generateText({
    appId: request.appId,
    task: 'summarise_text',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_summary',
      question: request.prompt,
      kitchen: {
        id: request.kitchenId,
        name: context.kitchenName,
        tagline: context.tagline,
        context: context.kitchenContext || undefined,
      },
      operation_agents: {
        MenuAI: {
          operation: 'Menus',
          authority: 'advisory',
          menu_manifest: context.menuManifest,
          context: context.menuContext || undefined,
          instruction:
            'Assess the current Menu shape from exact manifest counts and confirmed Menu context. Identify useful operational observations without inventing sales, popularity, profitability, ingredient, stock, or customer evidence. Do not propose or claim a mutation.',
        },
      },
    },
    context: {
      agent: 'KitchenAI',
      user_context: context.userContext || undefined,
      kitchen_context: context.kitchenContext || undefined,
      menu_context: context.menuContext || undefined,
      instruction: `Act as KitchenAI for the selected Kitchen. Answer using only the supplied authorized Kitchen identity, confirmed context, and named operation-agent scopes. For this summary, consult MenuAI and incorporate its supported operational observations into the final Kitchen summary. Treat saved context as operator knowledge, not measured evidence. State when the records do not support a claim. Do not claim to have changed data. Be concise and conversational. ${fireuxAgentTipInstruction}`,
    },
  })
  const result = extractFireuxAgentTip(response.text, {
    agentId: 'KitchenAI',
    parentId: 'MiseboxAI',
  })
  const answer = text(result.answer)
  if (!response.ok || !answer) {
    throw createError({
      statusCode: response.disabled ? 503 : 502,
      statusMessage: response.reason || 'KitchenAI could not answer.',
    })
  }
  const usage = await writeKitchenAgentUsage({
    appId: request.appId,
    kitchenId: request.kitchenId,
    actorId: access.uid,
    agent: 'KitchenAI',
    task: 'answer_kitchen_question',
    provider: response.provider,
    model: response.model,
    usage: response.usage,
    tip: result.tip,
  })
  return {
    ok: true as const,
    answer,
    scope: {
      source:
        response.execution === 'simulator'
          ? ('simulator' as const)
          : response.execution === 'codex'
            ? ('codex' as const)
            : ('ai' as const),
      kitchenName: context.kitchenName,
      userContext: Boolean(context.userContext),
      kitchenContext: Boolean(context.kitchenContext),
      menuContext: Boolean(context.menuContext),
      menuCount: context.menuManifest.length,
      delegates: ['MenuAI'] as const,
      tipRecorded: Boolean(result.tip),
      usage: { amount: usage.amount_label, currency: usage.currency },
    },
  }
}
