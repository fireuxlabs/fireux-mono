import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
  defineFireuxConsoleAgent,
  findFireuxOperationAgent,
} from 'fireux-ai/runtime/agents/operation-agent'
import { kitchenOperationAgents } from 'fireux-kitchens/runtime/ai/operation-agents'

export const miseboxAgent = defineFireuxAgentNode({
  id: 'misebox.ai',
  name: 'MiseboxAI',
  parentId: 'CoreAI',
  kind: 'ecosystem',
  contextProviders: [
    { id: 'user.context', owner: 'User', required: false },
    { id: 'misebox.context', owner: 'Ecosystem', required: false },
  ],
  capabilities: advisoryAgentCapabilities,
  toolIds: [],
  execution: 'shared-inference',
})

export const miseboxConsoleAgents = [
  defineFireuxConsoleAgent({
    id: 'misebox.kitchen.ai',
    name: 'KitchenAI',
    parentId: 'MiseboxAI',
    consoleId: 'kitchen',
    entityTarget: {
      kind: 'Kitchen',
      idParam: 'kitchenId',
      selection: 'required',
      authority: 'kitchen-writer',
    },
    contextProviders: [
      { id: 'user.context', owner: 'User', required: false },
      { id: 'kitchen.identity', owner: 'Kitchen', required: true },
      { id: 'kitchen.context', owner: 'AppKitchen', required: false },
    ],
    operationAgents: kitchenOperationAgents,
  }),
] as const

export function findMiseboxConsoleAgent(consoleId: string) {
  return miseboxConsoleAgents.find((agent) => agent.consoleId === consoleId)
}

export function findMiseboxOperationAgent(
  consoleId: string,
  operationSlug: string
) {
  const coordinator = findMiseboxConsoleAgent(consoleId)
  return coordinator
    ? findFireuxOperationAgent(coordinator, operationSlug)
    : undefined
}
