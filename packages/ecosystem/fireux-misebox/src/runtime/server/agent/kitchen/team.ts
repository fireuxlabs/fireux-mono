import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { findKitchenTeamServerTool } from 'fireux-kitchens/runtime/kitchen/server/team/tools/index'
import {
  selectKitchenTeamTool,
  teamToolConfirmation,
  type PendingTeamTool,
} from './team-tools'
import { readKitchenTeamToolMembers } from './team-records'
import type { KitchenAgentAccess, KitchenAgentRequest } from './types'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

async function executePreparedTeamTool(
  event: H3Event,
  request: KitchenAgentRequest,
  prepared: PendingTeamTool
) {
  const tool = findKitchenTeamServerTool(prepared.id)
  if (!tool) return null
  const outcome = await tool.execute(event, request.kitchenId, prepared)
  return {
    ok: true as const,
    answer: outcome.answer,
    tool: { id: prepared.id, result: outcome.result },
    ...(outcome.createdObject ? { createdObject: outcome.createdObject } : {}),
    ...(outcome.resultAction ? { resultAction: outcome.resultAction } : {}),
  }
}

async function continuePendingTeamTool(
  event: H3Event,
  request: KitchenAgentRequest,
  access: KitchenAgentAccess,
  pending: PendingTeamTool
) {
  const decision = teamToolConfirmation(request.prompt)
  if (decision === 'cancelled') {
    return { ok: true as const, answer: 'Okay, that action was cancelled.' }
  }
  const tool = findKitchenTeamServerTool(pending.id)
  if (!tool) return null
  const members = await readKitchenTeamToolMembers(access, request)
  const current = tool.prepare(pending.input, members)
  if (!current) {
    return {
      ok: true as const,
      answer:
        'That action is no longer valid for the current Team. Please run the request again.',
    }
  }
  if (
    decision !== 'confirmed' ||
    current.confirmation !== pending.confirmation
  ) {
    return {
      ok: true as const,
      answer: `${current.confirmation} Shall I continue?`,
      pendingTool: current,
    }
  }
  return executePreparedTeamTool(event, request, current)
}

export async function runKitchenTeamAgent(
  event: H3Event,
  request: KitchenAgentRequest,
  access: KitchenAgentAccess
) {
  if (request.pendingTool) {
    return continuePendingTeamTool(event, request, access, request.pendingTool)
  }

  const members = await readKitchenTeamToolMembers(access, request)
  const selection = await selectKitchenTeamTool(
    useFireuxAi(event),
    request.appId,
    request.prompt,
    members
  )
  const selected = selection.ok ? selection.data : null

  if (selected?.agent === 'TeamAI' && selected.kind === 'answer') {
    const answer = text(selected.answer)
    if (answer) return { ok: true as const, answer }
  }
  if (selected?.agent === 'TeamAI' && selected.kind === 'tool') {
    const call = record(selected.toolCall)
    const tool = findKitchenTeamServerTool(text(call.toolId))
    const prepared = tool?.prepare(record(call.input), members)
    if (tool && prepared) {
      if (tool.definition.confirmation === 'required') {
        return {
          ok: true as const,
          answer: `${prepared.confirmation} Shall I continue?`,
          pendingTool: prepared,
        }
      }
      return executePreparedTeamTool(event, request, prepared)
    }
  }

  return request.operation === 'team'
    ? {
        ok: true as const,
        answer:
          'No registered Team capability matched that request. Try another Team command.',
      }
    : null
}
