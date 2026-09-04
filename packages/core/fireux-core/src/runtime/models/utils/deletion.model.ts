/** Shared result shape only. Every entity owns how these facts are produced. */
export type DeletionImpact<Effect = string> = {
  canDelete: boolean
  blockers: string[]
  effects: Effect[]
}

export type Deletion<Effect = string, Result = void> = {
  impact: () => Promise<DeletionImpact<Effect>>
  execute: () => Promise<Result>
}
