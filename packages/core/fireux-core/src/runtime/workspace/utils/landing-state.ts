import type { ReadOutcome } from '../../utils/read-outcome'

/** Empty means no content; association counts remain separate domain facts. */
export function workspaceLandingState(input: {
  outcome: ReadOutcome
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
  if (!input.recordCount) return 'empty'
  return input.selectedId ? 'ready' : 'pending'
}
