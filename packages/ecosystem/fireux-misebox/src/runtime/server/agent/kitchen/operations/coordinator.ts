import type { FireuxOperationAgentDefinition } from 'fireux-ai/runtime/models/agents/operation-agent'

export function buildKitchenCoordinatorContext(
  operationAgents: readonly FireuxOperationAgentDefinition[]
): Record<string, unknown> {
  return {
    operation: 'Kitchen Workspace',
    authority: 'advisory',
    operation_agents: operationAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      operation: agent.operationSlug,
      maturity: agent.maturity || 'handshake',
      context_providers: agent.contextProviders,
      capabilities: agent.capabilities,
      tool_catalogue: agent.toolCatalogue || [],
    })),
    instruction:
      'Determine the relevant Kitchen capability from the operator question. Explain only capabilities, records, tools, and evidence supplied here. A Tool can be described only according to its status: requested and building are not executable; available and agent-ready may be offered only when they are registered for the request. Do not claim live operational evidence, conclusions, or changes that are not supplied.',
  }
}
