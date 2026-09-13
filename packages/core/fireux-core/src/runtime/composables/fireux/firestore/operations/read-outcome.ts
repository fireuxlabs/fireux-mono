export type ReadOutcome =
  | 'idle'
  | 'pending'
  | 'error'
  | 'empty'
  | 'missing'
  | 'ready'

/** One state order for live client bindings and server projections. */
type ReadInput = {
  active: boolean
  pending: boolean
  error?: unknown
  kind: 'document' | 'collection'
  present: boolean
  current?: boolean
}

export function resolveReadOutcome(
  input: ReadInput & { kind: 'document' }
): Exclude<ReadOutcome, 'empty'>
export function resolveReadOutcome(
  input: ReadInput & { kind: 'collection' }
): Exclude<ReadOutcome, 'missing'>
export function resolveReadOutcome(input: ReadInput): ReadOutcome
export function resolveReadOutcome(input: ReadInput): ReadOutcome {
  if (!input.active) return 'idle'
  if (input.current === false) return 'pending'
  if (input.error) {
    const error = input.error as { statusCode?: number; status?: number }
    return input.kind === 'document' &&
      Number(error.statusCode ?? error.status) === 404
      ? 'missing'
      : 'error'
  }
  if (input.pending) return 'pending'
  return input.present
    ? 'ready'
    : input.kind === 'document'
      ? 'missing'
      : 'empty'
}
