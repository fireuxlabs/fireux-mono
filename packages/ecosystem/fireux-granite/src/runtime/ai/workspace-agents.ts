import {
  advisoryAgentCapabilities,
  defineFireuxAgentNode,
  defineFireuxWorkspaceAgent,
} from 'fireux-ai/runtime/agents/operation-agent'
import { portfolioOperationAgents } from 'fireux-properties/runtime/portfolio/models/operation-agents'

export const graniteAgent = defineFireuxAgentNode({
  id: 'granite.ai',
  name: 'GraniteAI',
  parentId: 'CoreAI',
  kind: 'ecosystem',
  contextProviders: [
    { id: 'user.context', owner: 'User', required: false },
    { id: 'granite.context', owner: 'Ecosystem', required: false },
  ],
  capabilities: advisoryAgentCapabilities,
  toolIds: [],
  execution: 'shared-inference',
})

export const graniteWorkspaceAgents = [
  defineFireuxWorkspaceAgent({
    id: 'granite.portfolio.ai',
    name: 'PortfolioAI',
    parentId: 'GraniteAI',
    workspaceId: 'portfolio',
    entityTarget: {
      kind: 'Portfolio',
      idParam: 'portfolioId',
      selection: 'required',
      authority: 'portfolio-writer',
    },
    contextProviders: [
      { id: 'user.context', owner: 'User', required: false },
      { id: 'portfolio.identity', owner: 'Portfolio', required: true },
      { id: 'portfolio.context', owner: 'AppPortfolio', required: false },
    ],
    operationAgents: portfolioOperationAgents,
  }),
] as const
