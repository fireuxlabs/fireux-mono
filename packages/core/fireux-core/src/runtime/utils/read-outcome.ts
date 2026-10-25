export type ReadOutcome = 'idle' | 'pending' | 'error' | 'empty' | 'ready'

export type ReadInput = {
  enabled: boolean
  pending: boolean
  failed: boolean
  present: boolean
}

/** Classify one read from normalized facts. */
export function resolveReadOutcome(input: ReadInput): ReadOutcome {
  if (!input.enabled) return 'idle'
  if (input.failed) return 'error'
  if (input.pending) return 'pending'
  return input.present ? 'ready' : 'empty'
}
