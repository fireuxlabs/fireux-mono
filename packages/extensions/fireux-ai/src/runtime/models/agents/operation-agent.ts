export type FireuxOperationAgentExecution =
  | 'shared-inference'
  | 'independent-on-demand'

export type FireuxOperationAgentMaturity =
  | 'not-connected'
  | 'handshake'
  | 'connected'
  | 'complete'

export type FireuxOperationAgentCapability =
  | 'read_context'
  | 'summarise'
  | 'identify_gaps'
  | 'propose_changes'
  | 'use_tools'

export type FireuxAgentContextProvider = {
  id: string
  owner: string
  required: boolean
}

export type FireuxOperationAgentTool = {
  id: string
  label: string
  description: string
  status: 'requested' | 'building' | 'available' | 'agent-ready'
  requiredRecords: readonly string[]
  authority: string
  approval: string
}

export type FireuxAgentEntityTarget = {
  kind: string
  idParam: string
  selection: 'required' | 'optional'
  authority: string
}

export type FireuxAgentNodeKind = 'core' | 'user' | 'ecosystem'

export type FireuxAgentNodeDefinition = {
  id: string
  name: string
  parentId?: string
  kind: FireuxAgentNodeKind
  contextProviders: readonly FireuxAgentContextProvider[]
  capabilities: readonly FireuxOperationAgentCapability[]
  toolIds: readonly string[]
  execution: FireuxOperationAgentExecution
}

export type FireuxOperationAgentDefinition = {
  id: string
  name: string
  parentId: string
  workspaceId: string
  operationId: string
  operationSlug: string
  family?: string
  instruction?: string
  contextProviders: readonly FireuxAgentContextProvider[]
  capabilities: readonly FireuxOperationAgentCapability[]
  toolIds: readonly string[]
  toolCatalogue?: readonly FireuxOperationAgentTool[]
  execution: FireuxOperationAgentExecution
  maturity?: FireuxOperationAgentMaturity
}

export type FireuxWorkspaceAgentDefinition = {
  id: string
  name: string
  parentId: string
  workspaceId: string
  entityTarget: FireuxAgentEntityTarget
  contextProviders: readonly FireuxAgentContextProvider[]
  operationAgents: readonly FireuxOperationAgentDefinition[]
}

export const identityAgentCapabilities = [
  'read_context',
  'summarise',
  'identify_gaps',
  'propose_changes',
] as const satisfies readonly FireuxOperationAgentCapability[]

export const advisoryAgentCapabilities = [
  'read_context',
  'summarise',
  'identify_gaps',
  'propose_changes',
] as const satisfies readonly FireuxOperationAgentCapability[]

export function defineFireuxAgentNode<
  const T extends FireuxAgentNodeDefinition,
>(definition: T): T {
  return definition
}

export function defineFireuxOperationAgent<
  const T extends FireuxOperationAgentDefinition,
>(definition: T): T {
  return definition
}

export function defineFireuxWorkspaceAgent<
  const T extends FireuxWorkspaceAgentDefinition,
>(definition: T): T {
  return definition
}

export function findFireuxOperationAgent(
  agent: FireuxWorkspaceAgentDefinition,
  operationSlug: string
) {
  return agent.operationAgents.find(
    (candidate) => candidate.operationSlug === operationSlug
  )
}
