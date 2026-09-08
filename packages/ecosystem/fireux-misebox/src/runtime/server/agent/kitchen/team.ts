import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { findKitchenTeamServerTool } from 'fireux-kitchens/runtime/kitchen/server/team/tools/index'
import { kitchenTeamMembersRemoveTool } from 'fireux-kitchens/runtime/kitchen/tools/team/index'
import {
  selectKitchenTeamTool,
  teamToolConfirmation,
  type PendingTeamTool,
} from './team-tools'
import { readKitchenTeamToolMembers } from './team-records'
import type { KitchenAgentRequest } from './types'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const explicitTeamRead = (prompt: string) =>
  /^(?:who\s+(?:is|works)\s+(?:on|in)|list|show|read)\b.*\b(?:team|members?)\b/i.test(
    prompt.trim()
  )

const normalizedName = (value: string) =>
  value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = row[0]
    row[0] = leftIndex
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const previous = row[rightIndex]
      row[rightIndex] = Math.min(
        row[rightIndex] + 1,
        row[rightIndex - 1] + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      )
      diagonal = previous
    }
  }
  return row[right.length]
}

function resolvePreservedMembers(prompt: string, members: Awaited<ReturnType<typeof readKitchenTeamToolMembers>>) {
  const match = prompt.match(
    /\b(?:delete|remove|remove)\b[\s\S]*\b(?:all|everyone|everybody)\b[\s\S]*\b(?:except|other than|apart from|keep)\b\s+(.+?)[.!?]*$/iu
  )
  if (!match) return null
  const requested = match[1]
    .split(/\s*(?:,|\band\b|&)\s*/iu)
    .map(normalizedName)
    .filter(Boolean)
  if (!requested.length) return null

  const preserved = requested.map((name) => {
    const matches = members.filter((member) => {
      const fullName = normalizedName(member.name)
      const parts = fullName.split(' ')
      return (
        fullName === name ||
        fullName.startsWith(`${name} `) ||
        parts.some((part) => editDistance(part, name) <= 2)
      )
    })
    return matches.length === 1 ? matches[0] : null
  })
  return preserved.every(Boolean) ? preserved : []
}

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
  pending: PendingTeamTool
) {
  const decision = teamToolConfirmation(request.prompt)
  if (decision === 'cancelled') {
    return { ok: true as const, answer: 'Okay, that action was cancelled.' }
  }
  const tool = findKitchenTeamServerTool(pending.id)
  if (!tool) return null
  const members = await readKitchenTeamToolMembers(event, request)
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

export async function runKitchenTeamAI(
  event: H3Event,
  request: KitchenAgentRequest
) {
  if (request.pendingTool) {
    return continuePendingTeamTool(event, request, request.pendingTool)
  }

  const members = await readKitchenTeamToolMembers(event, request)
  const preserved = resolvePreservedMembers(request.prompt, members)
  if (preserved) {
    if (!preserved.length) {
      return {
        ok: true as const,
        answer:
          'I could not uniquely match every person to keep. Use their displayed Team names and try again.',
      }
    }
    const preservedIds = new Set(preserved.map((member) => member?.memberId))
    const affected = members.filter(
      (member) => !preservedIds.has(member.memberId)
    )
    const tool = findKitchenTeamServerTool(kitchenTeamMembersRemoveTool.id)
    const prepared = tool?.prepare(
      { memberIds: affected.map((member) => member.memberId) },
      members
    )
    if (tool && prepared) {
      return {
        ok: true as const,
        answer: `${prepared.confirmation} Shall I continue?`,
        pendingTool: prepared,
      }
    }
    return {
      ok: true as const,
      answer: 'There are no other active Team members to remove.',
    }
  }
  const readActionId = request.availableActions.find((id) =>
    id.endsWith('.read-members')
  )
  if (readActionId && explicitTeamRead(request.prompt)) {
    const tool = findKitchenTeamServerTool(readActionId)
    const prepared = tool?.prepare({}, members)
    if (tool && prepared) {
      return executePreparedTeamTool(event, request, prepared)
    }
  }
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
