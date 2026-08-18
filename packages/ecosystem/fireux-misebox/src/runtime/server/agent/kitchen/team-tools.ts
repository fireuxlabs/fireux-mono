import type { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { addKitchenTeamMemberTool } from 'fireux-kitchens/runtime/server/kitchen/team/add-member-tool'
import { createKitchenMemberInvitationTool } from 'fireux-kitchens/runtime/server/kitchen/team/create-member-invitation-tool'
import { updateKitchenMemberTool } from 'fireux-kitchens/runtime/server/kitchen/team/update-member-tool'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export type PendingTeamTool =
  | { id: typeof addKitchenTeamMemberTool.id; name: string }
  | {
      id: typeof createKitchenMemberInvitationTool.id
      memberId: string
      name: string
    }
  | {
      id: typeof updateKitchenMemberTool.id
      name: string
      changes: { memberId: string; name: string; previousName: string }[]
    }

export function pendingTeamTool(value: unknown): PendingTeamTool | null {
  const source = record(value)
  const name = text(source.name).replace(/\s+/g, ' ')
  if (!name || name.length > 120) return null
  const id = text(source.id)
  if (id === addKitchenTeamMemberTool.id) return { id, name }
  if (id === createKitchenMemberInvitationTool.id) {
    const memberId = text(source.memberId)
    return memberId ? { id, memberId, name } : null
  }
  if (id === updateKitchenMemberTool.id) {
    const changes = Array.isArray(source.changes)
      ? source.changes
          .map(record)
          .map((change) => ({
            memberId: text(change.memberId),
            name: text(change.name).replace(/\s+/g, ' '),
            previousName: text(change.previousName).replace(/\s+/g, ' '),
          }))
          .filter(
            (change) =>
              change.memberId &&
              change.name &&
              change.name.length <= 120 &&
              change.previousName
          )
      : []
    return changes.length && changes.length <= 200
      ? { id, name, changes }
      : null
  }
  return null
}

export function teamToolConfirmation(value: string) {
  if (/^(?:yes|y|confirm|do it|add (?:them|him|her))\b/i.test(value)) {
    return 'confirmed' as const
  }
  if (/^(?:no|n|cancel|stop|don't|do not)\b/i.test(value)) {
    return 'cancelled' as const
  }
  return 'unknown' as const
}

export type TeamToolMember = { memberId: string; name: string }

export function resolveSelectedMemberChanges(
  selected: readonly { memberId: string; name: string }[],
  members: readonly TeamToolMember[]
) {
  const requested = new Map(
    selected.map((change) => [
      text(change.memberId),
      text(change.name).replace(/\s+/g, ' '),
    ])
  )
  return members.flatMap((member) => {
    const name = requested.get(member.memberId)
    return name && name.length <= 120 && name !== member.name
      ? [{ memberId: member.memberId, previousName: member.name, name }]
      : []
  })
}

export function selectKitchenTeamTool(
  ai: ReturnType<typeof useFireuxAi>,
  appId: string,
  prompt: string,
  members: readonly TeamToolMember[]
) {
  return ai.generateJson<{
    action:
      | 'add_team_member'
      | 'create_member_invitation'
      | 'update_team_member'
      | 'none'
    agent?: 'TeamAI'
    name?: string
    changes?: { memberId: string; name: string }[]
  }>({
    appId,
    task: 'extract_structured_data',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_team_tool_selection',
      question: prompt,
      team_members: members,
      operation_agents: {
        TeamAI: {
          allowed_tools: [
            addKitchenTeamMemberTool,
            createKitchenMemberInvitationTool,
            updateKitchenMemberTool,
          ],
        },
      },
    },
    context: {
      agent: 'KitchenAI',
      instruction:
        'Route only to the named operation_agents and their allowed_tools. Infer the requested outcome from the operator language and current Team records. Use add_team_member for a new named person, create_member_invitation for an existing member invitation, or update_team_member with exact memberId/name changes when existing member names should change. Return none when no Team tool fits. Never execute a tool or invent a member id.',
    },
    outputJsonSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'add_team_member',
            'create_member_invitation',
            'update_team_member',
            'none',
          ],
        },
        agent: { type: 'string', enum: ['TeamAI'] },
        name: { type: 'string', maxLength: 120 },
        changes: {
          type: 'array',
          maxItems: 200,
          items: {
            type: 'object',
            properties: {
              memberId: { type: 'string' },
              name: { type: 'string', maxLength: 120 },
            },
            required: ['memberId', 'name'],
            additionalProperties: false,
          },
        },
      },
      required: ['action'],
      additionalProperties: false,
    },
  })
}
