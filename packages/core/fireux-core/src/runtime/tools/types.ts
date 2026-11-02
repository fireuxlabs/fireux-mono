/** Discovery descriptions reference implementation; they do not register an executor. */
export type FireuxSearchIntent = {
  phrase: string
  kind: 'problem' | 'solution' | 'implementation' | 'integration' | 'product'
  status: 'hypothesis' | 'validated'
}

export type FireuxToolExecution = {
  environment: 'server' | 'client' | 'either'
  authorization: 'required' | 'contextual' | 'none'
  confirmation: 'required' | 'contextual' | 'none'
}

export type FireuxToolSurfaces = { human: boolean; ai: boolean }

export type FireuxToolAiContext = {
  baked: {
    purpose: string
    knows: readonly string[]
    constraints: readonly string[]
    evidence: readonly string[]
  }
  runtime: {
    accepted: boolean
    required: readonly string[]
    optional: readonly string[]
  }
}

export type FireuxPrimitiveDefinition = {
  kind: 'primitive'
  id: string
  family: string
  name: string
  description: string
  problem: string
  searchIntents: readonly FireuxSearchIntent[]
  input: { required: readonly string[]; extensible: boolean }
  result: { kind: string }
  execution: FireuxToolExecution
  surfaces: FireuxToolSurfaces
  ai: FireuxToolAiContext
  implementation: { importPath: string; exports: readonly string[] }
  documentation: {
    slug: string
    guide: string
    seoDescription: string
    example: string
  }
}

export type FireuxDomainToolDefinition = {
  kind: 'domain-tool'
  id: string
  family: string
  name: string
  description: string
  problem: string
  searchIntents: readonly FireuxSearchIntent[]
  input: { required: readonly string[]; extensible: boolean }
  result: { kind: string }
  execution: FireuxToolExecution
  surfaces: FireuxToolSurfaces
  ai: FireuxToolAiContext
  implementation: { references: readonly string[] }
  documentation: { slug: string; guide: string }
}

export type FireuxCompoundToolDefinition = {
  kind: 'compound-tool'
  id: string
  family: string
  name: string
  description: string
  problem: string
  searchIntents: readonly FireuxSearchIntent[]
  steps: readonly {
    capability: string
    role: string
    classification: 'primitive' | 'domain-tool'
    status: 'registered' | 'source-proven' | 'gap'
  }[]
  execution: FireuxToolExecution
  surfaces: FireuxToolSurfaces
  ai: FireuxToolAiContext
  implementation: { references: readonly string[] }
  documentation: { slug: string; guide: string }
}

export function defineFireuxPrimitive<
  const T extends FireuxPrimitiveDefinition,
>(primitive: T): T {
  return primitive
}

export function defineFireuxDomainTool<
  const T extends FireuxDomainToolDefinition,
>(tool: T): T {
  return tool
}

export function defineFireuxCompoundTool<
  const T extends FireuxCompoundToolDefinition,
>(tool: T): T {
  return tool
}

/** Input and presentation contract for a command-backed tool; authority stays with its domain executor. */
export type FireuxCommandToolDefinition = {
  id: string
  primitive?: string
  mode: 'read' | 'write'
  risk: 'read' | 'write' | 'destructive'
  confirmation: 'none' | 'required'
  context: {
    target: string
    instruction: string
    outcome: string
    constraints?: readonly string[]
  }
  inputSchema: Record<string, unknown>
  ai?: FireuxToolAiContext
  surfaces: {
    human:
      | false
      | {
          placement: 'toolbar'
          group: 'create' | 'update'
          label: string
          description: string
          icon: string
        }
    agent: {
      callable: boolean
    }
  }
  result?: {
    kind: 'object' | 'collection' | 'share-link' | 'mutation'
    primaryAction?: 'copy'
    label?: string
  }
}

export function defineFireuxCommandTool<
  const T extends FireuxCommandToolDefinition,
>(tool: T): T {
  return tool
}
