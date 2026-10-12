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
