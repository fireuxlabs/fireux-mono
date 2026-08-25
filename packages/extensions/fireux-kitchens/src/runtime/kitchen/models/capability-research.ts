export type KitchenCapabilityResearchSeed = {
  seed: string
  queries: readonly string[]
}

export type KitchenCapabilityResearchCluster = {
  id: string
  title: string
  operatorJob: string
  interpretation: string
  evidenceQueries?: readonly string[]
  authority?: string
  owner?: string
  owners?: readonly string[]
}

export type KitchenCapabilityResearchSource = {
  label: string
  url: string
  note: string
}

export type KitchenCapabilityResearchRecord = {
  id: string
  label: string
  kind: 'owned' | 'reference' | 'projection'
  status: 'available' | 'partial' | 'requested'
  owner: string
  authority: string
  facts: readonly string[]
  readBy: readonly `kitchen.${string}.${string}`[]
  writtenBy: readonly `kitchen.${string}.${string}`[]
}

export type KitchenCapabilityResearchTool = {
  id: `kitchen.${string}.${string}`
  label: string
  layer: string
  purpose: string
  inputs?: readonly string[]
  outputs?: readonly string[]
  evidence?: readonly string[]
  authority: string
  approval: string
  status: string
}

export type KitchenCapabilityResearch = {
  observedAt: string
  geography: string
  language?: string
  question: string
  method: string
  seeds: readonly KitchenCapabilityResearchSeed[]
  clusters: readonly KitchenCapabilityResearchCluster[]
  validationSources: readonly KitchenCapabilityResearchSource[]
  records: readonly KitchenCapabilityResearchRecord[]
  recordQuestions: readonly string[]
  toolHypotheses?: readonly KitchenCapabilityResearchTool[]
  proposedTools?: readonly KitchenCapabilityResearchTool[]
  currentDrift?: readonly string[]
  aiContract?: Readonly<Record<string, readonly string[]>>
  conclusion: string
}
