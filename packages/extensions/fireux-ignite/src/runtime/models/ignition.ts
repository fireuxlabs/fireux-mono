export type IgnitionRole =
  | 'entity'
  | 'workspace'
  | 'capability'
  | 'tool'
  | 'service'
  | 'surface'
export type IgnitionBrief = {
  id: string
  industry: string
  outcome: string
  actors: readonly string[]
  search?: IgnitionSearchPlan
  requirements: readonly { id: string; need: string; acceptance: string }[]
}
export type IgnitionAssembly = {
  id: string
  elements: readonly {
    id: string
    role: IgnitionRole
    owner: string
    requirements: readonly string[]
    uses: readonly string[]
    sourcePaths: readonly string[]
  }[]
  evidence: readonly {
    requirement: string
    level: 'source-reviewed' | 'checks-passed' | 'journey-proved'
    observation: string
    references: readonly string[]
  }[]
  learnings: readonly {
    decision: string
    reason: string
    owner: string
    references: readonly string[]
  }[]
}

/** App-authored decisions, not keyword-volume or live indexing evidence. */
export type IgnitionSearchPlan = {
  mode: 'preview' | 'public' | 'private'
  origin: string
  owner: string
  geography: string
  languages: readonly string[]
  journeys: readonly {
    id: string
    audience: string
    intent: string
    action: string
    references: readonly string[]
  }[]
  pages: readonly {
    path: string
    journey: string
    owner: string
    index: boolean
    sitemap: boolean
    title: string
    description: string
  }[]
  measurement: {
    status: 'planned' | 'connected'
    owner: string
    measures: readonly string[]
  }
}
