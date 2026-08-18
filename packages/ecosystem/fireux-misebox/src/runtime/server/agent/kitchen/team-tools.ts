import {
  composeFireuxAgentInstruction,
  fireuxAgentBaseInstruction,
} from 'fireux-ai/runtime/agents/instructions'
import type { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { kitchenOperationAgents } from 'fireux-kitchens/runtime/ai/operation-agents'
import type {
  KitchenTeamPreparedToolCall,
  KitchenTeamToolMember,
} from 'fireux-kitchens/runtime/server/kitchen/team/tools/index'
import {
  findKitchenTeamTool,
  kitchenTeamAgentTools,
  type KitchenTeamToolId,
} from 'fireux-kitchens/runtime/tools/kitchen/team/index'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const teamAgent = kitchenOperationAgents.find(
  (agent) => agent.operationSlug === 'team'
)

export type PendingTeamTool = KitchenTeamPreparedToolCall
export type TeamToolMember = KitchenTeamToolMember

export function pendingTeamTool(value: unknown): PendingTeamTool | null {
  const source = record(value)
  const id = text(source.id)
  const definition = findKitchenTeamTool(id)
  const name = text(source.name).replace(/\s+/g, ' ')
  const confirmation = text(source.confirmation)
  if (
    !definition ||
    definition.confirmation !== 'required' ||
    !name ||
    name.length > 120 ||
    !confirmation ||
    confirmation.length > 4_000
  ) {
    return null
  }
  return {
    id: definition.id,
    input: record(source.input),
    name,
    confirmation,
  }
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

const agentEnvelope = (prompt: string, members: readonly TeamToolMember[]) => ({
  question: prompt,
  team_members: members,
  operation_agents: {
    TeamAI: {
      definition: teamAgent,
      allowed_tools: kitchenTeamAgentTools,
    },
  },
})

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
      ...agentEnvelope(prompt, members),
    },
    context: {
      agent: 'KitchenAI',
      instruction: composeFireuxAgentInstruction(
        fireuxAgentBaseInstruction,
        teamAgent?.instruction,
        'Understand the request, then consider every registered tool, authorized record and permission. Return a canonical tool call when appropriate. Otherwise return a concise grounded answer or none. Never invent a member id.'
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

export function suggestKitchenTeamPrompts(
  ai: ReturnType<typeof useFireuxAi>,
  appId: string,
  members: readonly TeamToolMember[]
) {
  return ai.generateJson<{ suggestions: string[] }>({
    appId,
    task: 'extract_structured_data',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_team_prompt_suggestions',
      ...agentEnvelope('', members),
    },
    context: {
      agent: 'TeamAI',
      instruction: composeFireuxAgentInstruction(
        fireuxAgentBaseInstruction,
        teamAgent?.instruction,
        'Infer four concise requests the operator could make from the complete set of registered capabilities, current records and permissions. Use a plausible fake name when a capability creates a record. Use real supplied names when a capability acts on an existing record. Each suggestion must be executable through a current registered tool. Do not suggest destructive actions. Return suggestions only.'
      ),
    },
    outputJsonSchema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          minItems: 1,
          maxItems: 4,
          items: { type: 'string', minLength: 1, maxLength: 160 },
        },
      },
      required: ['suggestions'],
      additionalProperties: false,
    },
  })
}
