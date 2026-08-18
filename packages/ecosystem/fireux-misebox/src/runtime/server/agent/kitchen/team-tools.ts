import {
  composeFireuxAgentInstruction,
  fireuxAgentBaseInstruction,
} from 'fireux-ai/runtime/agents/instructions'
import type { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { kitchenOperationAgents } from 'fireux-kitchens/runtime/ai/operation-agents'
import {
  kitchenTeamAgentTools,
  kitchenTeamMemberCreateTool,
  kitchenTeamMemberDeleteTool,
  kitchenTeamMemberInvitationCreateTool,
  kitchenTeamMemberUpdateTool,
  type KitchenTeamToolId,
} from 'fireux-kitchens/runtime/tools/kitchen/team/index'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const name = (value: unknown) => text(value).replace(/\s+/g, ' ')

const teamAgent = kitchenOperationAgents.find(
  (agent) => agent.operationSlug === 'team'
)

type PendingMemberChange = {
  memberId: string
  name: string
  previousName: string
}

export type PendingTeamTool =
  | {
      id: typeof kitchenTeamMemberCreateTool.id
      name: string
      input: { name: string }
    }
  | {
      id:
        | typeof kitchenTeamMemberInvitationCreateTool.id
        | typeof kitchenTeamMemberDeleteTool.id
      name: string
      input: { memberId: string }
    }
  | {
      id: typeof kitchenTeamMemberUpdateTool.id
      name: string
      input: { updates: { memberId: string; changes: { name: string } }[] }
      changes: PendingMemberChange[]
    }

export function pendingTeamTool(value: unknown): PendingTeamTool | null {
  const source = record(value)
  const input = record(source.input)
  const displayName = name(source.name)
  const id = text(source.id)

  if (id === kitchenTeamMemberCreateTool.id) {
    const requestedName = name(input.name)
    return requestedName && requestedName.length <= 120
      ? { id, name: displayName || requestedName, input: { name: requestedName } }
      : null
  }
  if (
    id === kitchenTeamMemberInvitationCreateTool.id ||
    id === kitchenTeamMemberDeleteTool.id
  ) {
    const memberId = text(input.memberId)
    return memberId && displayName
      ? { id, name: displayName, input: { memberId } }
      : null
  }
  if (id === kitchenTeamMemberUpdateTool.id) {
    const changes = Array.isArray(source.changes)
      ? source.changes
          .map(record)
          .map((change) => ({
            memberId: text(change.memberId),
            name: name(change.name),
            previousName: name(change.previousName),
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
      ? {
          id,
          name: displayName || 'Team member names',
          input: {
            updates: changes.map(({ memberId, name: nextName }) => ({
              memberId,
              changes: { name: nextName },
            })),
          },
          changes,
        }
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

export type TeamToolMember = {
  memberId: string
  name: string
  linked: boolean
}

export function resolveSelectedMemberChanges(
  selected: readonly {
    memberId: string
    changes?: { name?: string }
  }[],
  members: readonly TeamToolMember[]
) {
  const requested = new Map(
    selected.map((update) => [
      text(update.memberId),
      name(update.changes?.name),
    ])
  )
  return members.flatMap((member) => {
    const nextName = requested.get(member.memberId)
    return nextName && nextName.length <= 120 && nextName !== member.name
      ? [
          {
            memberId: member.memberId,
            previousName: member.name,
            name: nextName,
          },
        ]
      : []
  })
}

export type KitchenTeamToolSelection = {
  kind: 'tool' | 'answer' | 'none'
  agent?: 'TeamAI'
  toolCall?: { toolId: KitchenTeamToolId; input: unknown }
  answer?: string
}

const toolCallSchema = {
  oneOf: kitchenTeamAgentTools.map((tool) => ({
    type: 'object',
    properties: {
      toolId: { type: 'string', const: tool.id },
      input: tool.inputSchema,
    },
    required: ['toolId', 'input'],
    additionalProperties: false,
  })),
}

export function selectKitchenTeamTool(
  ai: ReturnType<typeof useFireuxAi>,
  appId: string,
  prompt: string,
  members: readonly TeamToolMember[]
) {
  return ai.generateJson<KitchenTeamToolSelection>({
    appId,
    task: 'extract_structured_data',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_team_tool_selection',
      question: prompt,
      team_members: members,
      operation_agents: {
        TeamAI: {
          definition: teamAgent,
          allowed_tools: kitchenTeamAgentTools,
        },
      },
    },
    context: {
      agent: 'KitchenAI',
      instruction: composeFireuxAgentInstruction(
        fireuxAgentBaseInstruction,
        teamAgent?.instruction,
        'Understand the request, then consider the registered tools, authorized records and permissions. Return a canonical tool call when a tool is appropriate. Otherwise return a concise grounded answer or none. Never invent a member id.'
      ),
    },
    outputJsonSchema: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['tool', 'answer', 'none'] },
        agent: { type: 'string', enum: ['TeamAI'] },
        toolCall: toolCallSchema,
        answer: { type: 'string', maxLength: 1000 },
      },
      required: ['kind', 'agent'],
      additionalProperties: false,
    },
  })
}
