export type WorkspaceOutcome =
  | 'idle'
  | 'pending'
  | 'error'
  | 'empty'
  | 'missing'
  | 'ready'
export type WorkspaceTargetOutcome = WorkspaceOutcome
export type WorkspaceEntityOutcome = WorkspaceOutcome

/** Empty means a settled account with no associations, never an unresolved selection. */
export function workspaceLandingState(input: {
  outcome: WorkspaceOutcome
  accountPending: boolean
  accountError: boolean
  associationCount: number
  recordCount: number
  selectedId: string
}) {
  if (input.accountError || input.outcome === 'error') return 'error'
  if (
    input.accountPending ||
    input.outcome === 'pending' ||
    input.outcome === 'idle'
  )
    return 'pending'
  if (!input.recordCount) return input.associationCount ? 'missing' : 'empty'
  return input.selectedId ? 'ready' : 'pending'
}
