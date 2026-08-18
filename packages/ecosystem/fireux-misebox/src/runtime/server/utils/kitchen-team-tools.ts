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

export function possibleTeamToolRequest(prompt: string) {
  return /\b(?:add|create|invite|invitation|rename|capitalise|capitalize|title[ -]?case)\b/i.test(
    prompt
  )
}

export function requestsTeamTitleCase(prompt: string) {
  return (
    /\b(?:title[ -]?case|capitalise|capitalize)\b/i.test(prompt) &&
    /\b(?:all|everyone|everybody|names?|members?|team)\b/i.test(prompt)
  )
}

export function teamTitleCaseChanges(
  documents: readonly { id: string; data: () => Record<string, unknown> }[]
) {
  return documents.flatMap((document) => {
    const previousName = text(document.data().name)
    const name = previousName.replace(
      /(^|[\s'-])([\p{L}])/gu,
      (_, boundary: string, letter: string) =>
        `${boundary}${letter.toLocaleUpperCase()}`
    )
    return previousName && name !== previousName
      ? [{ memberId: document.id, previousName, name }]
      : []
  })
}

export function selectKitchenTeamTool(
  ai: ReturnType<typeof useFireuxAi>,
  appId: string,
  prompt: string
) {
  return ai.generateJson<{
    action: 'add_team_member' | 'create_member_invitation' | 'none'
    agent?: 'TeamAI'
    name?: string
  }>({
    appId,
    task: 'extract_structured_data',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_team_tool_selection',
      question: prompt,
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
        'Route only to the named operation_agents and their allowed_tools. Delegate an explicit request to add or create a named Kitchen person to TeamAI and kitchen.team.add-member. Delegate a request for an invite or invitation link for an existing named member to TeamAI and kitchen.member.create-invitation. Return the matching action and name; otherwise return {"action":"none"}. Never execute a tool.',
    },
    outputJsonSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['add_team_member', 'create_member_invitation', 'none'],
        },
        agent: { type: 'string', enum: ['TeamAI'] },
        name: { type: 'string', maxLength: 120 },
      },
      required: ['action'],
      additionalProperties: false,
    },
  })
}
