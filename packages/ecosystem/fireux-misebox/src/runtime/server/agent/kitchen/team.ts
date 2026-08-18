import { createError, type H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  addKitchenTeamMemberTool,
  executeAddKitchenTeamMemberTool,
} from 'fireux-kitchens/runtime/server/kitchen/team/add-member-tool'
import {
  createKitchenMemberInvitationTool,
  executeCreateKitchenMemberInvitationTool,
} from 'fireux-kitchens/runtime/server/kitchen/team/create-member-invitation-tool'
import {
  executeUpdateKitchenMemberPlan,
  updateKitchenMemberTool,
} from 'fireux-kitchens/runtime/server/kitchen/team/update-member-tool'
import {
  resolveSelectedMemberChanges,
  selectKitchenTeamTool,
  teamToolConfirmation,
  type PendingTeamTool,
} from './team-tools'
import type { KitchenAgentAccess, KitchenAgentRequest } from './types'

const text = (value: unknown) => String(value ?? '').trim()

async function resolveInvitationMember(
  access: KitchenAgentAccess,
  request: KitchenAgentRequest,
  name: string
) {
  const requestedSlug = normalizeSlug(name)
  const snapshot = await access.db
    .collection(`apps/${request.appId}/kitchens/${request.kitchenId}/team`)
    .limit(200)
    .get()
  const matches = snapshot.docs.filter((document) => {
    const data = document.data() || {}
    const memberName = readRecordString(data, 'name')
    return (
      !readRecordString(data, 'user_id') &&
      ((readRecordString(data, 'slug') || normalizeSlug(memberName)) ===
        requestedSlug ||
        memberName.toLowerCase() === name.toLowerCase())
    )
  })
  if (matches.length !== 1) {
    throw createError({
      statusCode: matches.length ? 409 : 404,
      statusMessage: matches.length
        ? `More than one unclaimed Kitchen member matches ${name}. Use the Team page to choose one.`
        : `No unclaimed Kitchen member named ${name} was found.`,
    })
  }
  const member = matches[0]!
  return {
    memberId: member.id,
    name: readRecordString(member.data(), 'name') || name,
  }
}

async function executePendingTeamTool(
  event: H3Event,
  request: KitchenAgentRequest,
  pending: PendingTeamTool
) {
  const decision = teamToolConfirmation(request.prompt)
  if (decision === 'cancelled') {
    return {
      ok: true as const,
      answer:
        pending.id === updateKitchenMemberTool.id
          ? 'Okay, I won’t update the Team names.'
          : pending.id === createKitchenMemberInvitationTool.id
            ? `Okay, I won’t create an invitation for ${pending.name}.`
            : `Okay, I won’t add ${pending.name}.`,
    }
  }
  if (decision !== 'confirmed') {
    return {
      ok: true as const,
      answer:
        pending.id === updateKitchenMemberTool.id
          ? `Please confirm these name changes: ${pending.changes.map((change) => `${change.previousName} → ${change.name}`).join(', ')}.`
          : pending.id === createKitchenMemberInvitationTool.id
            ? `Please confirm: create a one-use invitation link for ${pending.name}?`
            : `Please confirm: add ${pending.name} to this Kitchen team?`,
      pendingTool: pending,
    }
  }
  if (pending.id === updateKitchenMemberTool.id) {
    const updated = await executeUpdateKitchenMemberPlan(event, {
      kitchenId: request.kitchenId,
      changes: pending.changes.map(({ memberId, name }) => ({
        memberId,
        name,
      })),
    })
    return {
      ok: true as const,
      answer: `${updated.changes.length} Team ${updated.changes.length === 1 ? 'name has' : 'names have'} been updated.`,
      tool: { id: pending.id, result: updated },
    }
  }
  if (pending.id === createKitchenMemberInvitationTool.id) {
    const invitation = await executeCreateKitchenMemberInvitationTool(event, {
      kitchenId: request.kitchenId,
      memberId: pending.memberId,
    })
    return {
      ok: true as const,
      answer: `A one-use invitation for ${invitation.memberName} is ready and expires in seven days.`,
      tool: { id: pending.id, result: invitation },
      resultAction: {
        kind: createKitchenMemberInvitationTool.result.primaryAction,
        label: createKitchenMemberInvitationTool.result.label,
        value: `/kitchen/member-invitation/${encodeURIComponent(invitation.token)}`,
      },
    }
  }
  const created = await executeAddKitchenTeamMemberTool(event, {
    kitchenId: request.kitchenId,
    name: pending.name,
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
  }))
  const selection = await selectKitchenTeamTool(
    useFireuxAi(event),
    request.appId,
    request.prompt,
    members
  )
  if (selection.ok && selection.data?.agent === 'TeamAI') {
    const name = text(selection.data.name).replace(/\s+/g, ' ')
    if (
      selection.data.action === 'create_member_invitation' &&
      name &&
      name.length <= 120
    ) {
      const member = await resolveInvitationMember(access, request, name)
      return {
        ok: true as const,
        answer: `TeamAI found ${member.name}. It can create a one-use invitation link that expires in seven days. Shall I continue?`,
        pendingTool: {
          id: createKitchenMemberInvitationTool.id,
          memberId: member.memberId,
          name: member.name,
        } satisfies PendingTeamTool,
      }
    }
    if (
      selection.data.action === 'add_team_member' &&
      name &&
      name.length <= 120
    ) {
      return {
        ok: true as const,
        answer: `KitchenAI has delegated this to TeamAI. TeamAI can use Add team member to add ${name}. Shall I continue?`,
        pendingTool: {
          id: addKitchenTeamMemberTool.id,
          name,
        } satisfies PendingTeamTool,
      }
    }
    if (selection.data.action === 'update_team_member') {
      const changes = resolveSelectedMemberChanges(
        selection.data.changes || [],
        members
      )
      if (changes.length) {
        return {
          ok: true as const,
          answer: `TeamAI proposes: ${changes.map((change) => `${change.previousName} → ${change.name}`).join(', ')}. Shall I continue?`,
          pendingTool: {
            id: updateKitchenMemberTool.id,
            name: 'Team member names',
            changes,
          } satisfies PendingTeamTool,
        }
      }
    }
  }
  return request.operation === 'team'
    ? {
        ok: true as const,
        answer:
          'No Team command matched. Try “Add a member named Paul” or “Create an invitation for Daisy”.',
      }
    : null
}
