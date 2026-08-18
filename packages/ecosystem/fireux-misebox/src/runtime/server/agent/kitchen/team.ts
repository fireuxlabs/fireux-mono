import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import {
  kitchenTeamMemberCreateTool,
  kitchenTeamMemberDeleteTool,
  kitchenTeamMemberInvitationCreateTool,
  kitchenTeamMembersReadTool,
  kitchenTeamMemberUpdateTool,
} from 'fireux-kitchens/runtime/tools/kitchen/team/index'
import { kitchenTeamServerToolRegistry } from 'fireux-kitchens/runtime/server/kitchen/team/tools/index'
import {
  pendingTeamTool,
  resolveSelectedMemberChanges,
  selectKitchenTeamTool,
  teamToolConfirmation,
  type PendingTeamTool,
  type TeamToolMember,
} from './team-tools'
import type { KitchenAgentAccess, KitchenAgentRequest } from './types'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const normalizedName = (value: unknown) => text(value).replace(/\s+/g, ' ')

const executors = kitchenTeamServerToolRegistry

function confirmationMessage(pending: PendingTeamTool) {
  if (pending.id === kitchenTeamMemberUpdateTool.id) {
    return `Please confirm these name changes: ${pending.changes
      .map((change) => `${change.previousName} → ${change.name}`)
      .join(', ')}.`
  }
  if (pending.id === kitchenTeamMemberDeleteTool.id) {
    return `Please confirm: permanently delete ${pending.name}?`
  }
  if (pending.id === kitchenTeamMemberInvitationCreateTool.id) {
    return `Please confirm: create a one-use invitation link for ${pending.name}?`
  }
  return `Please confirm: add ${pending.name} to this Kitchen team?`
}

function cancellationMessage(pending: PendingTeamTool) {
  if (pending.id === kitchenTeamMemberUpdateTool.id) {
    return 'Okay, I won’t update the Team names.'
  }
  if (pending.id === kitchenTeamMemberDeleteTool.id) {
    return `Okay, I won’t delete ${pending.name}.`
  }
  if (pending.id === kitchenTeamMemberInvitationCreateTool.id) {
    return `Okay, I won’t create an invitation for ${pending.name}.`
  }
  return `Okay, I won’t add ${pending.name}.`
}

async function executePendingTeamTool(
  event: H3Event,
  request: KitchenAgentRequest,
  pending: PendingTeamTool
) {
  const decision = teamToolConfirmation(request.prompt)
  if (decision === 'cancelled') {
    return { ok: true as const, answer: cancellationMessage(pending) }
  }
  if (decision !== 'confirmed') {
    return {
      ok: true as const,
      answer: confirmationMessage(pending),
      pendingTool: pending,
    }
  }

  if (pending.id === kitchenTeamMemberUpdateTool.id) {
    const current = await executors[kitchenTeamMembersReadTool.id].execute(
      event,
      { kitchenId: request.kitchenId }
    )
    const currentNames = new Map(
      current.members.map((member) => [member.memberId, member.name])
    )
    const unchanged = pending.changes.every(
      (change) => currentNames.get(change.memberId) === change.previousName
    )
    if (!unchanged) {
      return {
        ok: true as const,
        answer:
          'The Team changed after this update was prepared. Please run the request again.',
      }
    }
    const updated = await executors[pending.id].execute(event, {
      kitchenId: request.kitchenId,
      updates: pending.input.updates,
    })
    return {
      ok: true as const,
      answer: `${updated.updates.length} Team ${updated.updates.length === 1 ? 'name has' : 'names have'} been updated.`,
      tool: { id: pending.id, result: updated },
    }
  }

  if (pending.id === kitchenTeamMemberDeleteTool.id) {
    const deleted = await executors[pending.id].execute(event, {
      kitchenId: request.kitchenId,
      ...pending.input,
    })
    return {
      ok: true as const,
      answer: `${deleted.name} has been deleted.`,
      tool: { id: pending.id, result: deleted },
    }
  }

  if (pending.id === kitchenTeamMemberInvitationCreateTool.id) {
    const invitation = await executors[pending.id].execute(event, {
      kitchenId: request.kitchenId,
      ...pending.input,
    })
    return {
      ok: true as const,
      answer: `A one-use invitation for ${invitation.memberName} is ready and expires in seven days.`,
      tool: { id: pending.id, result: invitation },
      resultAction: {
        kind: kitchenTeamMemberInvitationCreateTool.result.primaryAction,
        label: kitchenTeamMemberInvitationCreateTool.result.label,
        value: `/kitchen/member-invitation/${encodeURIComponent(invitation.token)}`,
      },
    }
  }

  const created = await executors[pending.id].execute(event, {
    kitchenId: request.kitchenId,
    ...pending.input,
  })
  return {
    ok: true as const,
    answer: `${created.name} has been added to this Kitchen team.`,
    tool: { id: pending.id, result: created },
    createdObject: {
      name: created.name,
      kind: 'Team member',
      to: `/console/kitchen/team#${created.slug}`,
    },
  }
}

function selectedMember(
  input: Record<string, unknown>,
  members: readonly TeamToolMember[]
) {
  const memberId = text(input.memberId)
  return members.find((member) => member.memberId === memberId)
}

function prepareTeamTool(
  toolId: string,
  input: Record<string, unknown>,
  members: readonly TeamToolMember[]
) {
  if (toolId === kitchenTeamMemberCreateTool.id) {
    const name = normalizedName(input.name)
    return name && name.length <= 120
      ? pendingTeamTool({ id: toolId, name, input: { name } })
      : null
  }
  if (
    toolId === kitchenTeamMemberInvitationCreateTool.id ||
    toolId === kitchenTeamMemberDeleteTool.id
  ) {
    const member = selectedMember(input, members)
    if (!member || member.linked) return null
    return pendingTeamTool({
      id: toolId,
      name: member.name,
      input: { memberId: member.memberId },
    })
  }
  if (toolId === kitchenTeamMemberUpdateTool.id) {
    const selected = Array.isArray(input.updates)
      ? input.updates.map(record).map((update) => ({
          memberId: text(update.memberId),
          changes: record(update.changes) as { name?: string },
        }))
      : []
    const changes = resolveSelectedMemberChanges(selected, members)
    return pendingTeamTool({
      id: toolId,
      name: 'Team member names',
      changes,
      input: {
        updates: changes.map(({ memberId, name }) => ({
          memberId,
          changes: { name },
        })),
      },
    })
  }
  return null
}

export async function runKitchenTeamAgent(
  event: H3Event,
  request: KitchenAgentRequest,
  access: KitchenAgentAccess
) {
  if (request.pendingTool) {
    return executePendingTeamTool(event, request, request.pendingTool)
  }

  const snapshot = await access.db
    .collection(`apps/${request.appId}/kitchens/${request.kitchenId}/team`)
    .limit(200)
    .get()
  const members = snapshot.docs.map((document) => ({
    memberId: document.id,
    name: readRecordString(document.data(), 'name'),
    linked: Boolean(readRecordString(document.data(), 'user_id')),
  }))
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
    const toolId = text(call.toolId)
    const input = record(call.input)
    if (toolId === kitchenTeamMembersReadTool.id) {
      const result = await executors[toolId].execute(event, {
        kitchenId: request.kitchenId,
      })
      return {
        ok: true as const,
        answer: result.members.length
          ? `This Kitchen Team has ${result.members.length} ${result.members.length === 1 ? 'member' : 'members'}: ${result.members.map((member) => member.name).join(', ')}.`
          : 'This Kitchen Team has no members.',
        tool: { id: toolId, result },
      }
    }
    const pending = prepareTeamTool(toolId, input, members)
    if (pending) {
      return {
        ok: true as const,
        answer: `${confirmationMessage(pending)} Shall I continue?`,
        pendingTool: pending,
      }
    }
  }

  return request.operation === 'team'
    ? {
        ok: true as const,
        answer:
          'No Team command matched. Try “Add a member named Alex” or choose a Team tool.',
      }
    : null
}
