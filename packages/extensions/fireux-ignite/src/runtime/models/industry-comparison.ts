/** Review dimensions, not mandatory generated folders or a capability registry. */
export const sharedArchitectureContracts = {
  ecosystem: {
    label: 'Ecosystem',
    contract: 'Main App and branded tenant Apps.',
  },
  workspace: {
    label: 'Workspace',
    contract: 'Entity-owned operator Workspace.',
  },
  identity: {
    label: 'Identity',
    contract: 'Domain-owned identity with explicit linked-source ownership.',
  },
  capabilities: {
    label: 'Capabilities',
    contract: 'Domain-owned capabilities.',
  },
  tools: { label: 'Tools', contract: 'Actions exposed by capabilities.' },
  services: {
    label: 'Services',
    contract: 'Configured outcomes coordinating capabilities.',
  },
  surfaces: {
    label: 'Surfaces',
    contract: 'App-owned customer and operator surfaces.',
  },
  authority: {
    label: 'Authority',
    contract: 'Account, App membership and Entity access.',
  },
} as const
export type SharedArchitectureKey = keyof typeof sharedArchitectureContracts
export type ComparisonObservation = {
  level: 'source-reviewed' | 'partial' | 'proposed' | 'unverified'
  note: string
  references: readonly string[]
}
export type IgnitionIndustryCase = {
  id: string
  name: string
  kind: 'reference' | 'proposal'
  contracts: Partial<Record<SharedArchitectureKey, ComparisonObservation>>
  domain: {
    workspaceEntity: string
    managedInformation: string
    operationalRecord: string
    serviceOutcome: string
  }
}
export type IgnitionIndustryComparison = {
  id: string
  baseline: IgnitionIndustryCase
  candidate: IgnitionIndustryCase
  deltas: readonly {
    id: string
    kind: 'configuration' | 'composition' | 'new-behaviour'
    title: string
    baseline: string
    candidate: string
    reason: string
    reuse: 'existing-source' | 'partial-source' | 'needs-implementation'
    references: readonly string[]
    acceptance: string
  }[]
}
