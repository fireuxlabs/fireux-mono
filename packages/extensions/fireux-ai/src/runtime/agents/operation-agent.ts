export type FireuxOperationAgentExecution =
  | 'shared-inference'
  | 'independent-on-demand'

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
  consoleId: string
  operationId: string
  operationSlug: string
  family?: string
  contextProviders: readonly FireuxAgentContextProvider[]
  capabilities: readonly FireuxOperationAgentCapability[]
  toolIds: readonly string[]
  execution: FireuxOperationAgentExecution
}

export type FireuxConsoleAgentDefinition = {
  id: string
  name: string
  parentId: string
  consoleId: string
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

export function defineFireuxConsoleAgent<
  const T extends FireuxConsoleAgentDefinition,
>(definition: T): T {
  return definition
}

export function findFireuxOperationAgent(
  agent: FireuxConsoleAgentDefinition,
  operationSlug: string
) {
  return agent.operationAgents.find(
    (candidate) => candidate.operationSlug === operationSlug
  )
}
