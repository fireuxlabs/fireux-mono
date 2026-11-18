export type OverviewSummary = {
  message: string
  role?: 'alert' | 'status'
  flags: string[]
}

/** Shared card feedback; domain counts and attention facts remain with their owner. */
export function overviewSummary(summary: {
  outcome: string
  status: string
  flags: string[]
}): OverviewSummary {
  if (summary.outcome === 'error')
    return { message: 'Could not load this summary.', role: 'alert', flags: [] }
  if (summary.outcome === 'idle')
    return { message: summary.status, role: 'status', flags: [] }
  if (summary.outcome !== 'ready')
    return { message: 'Loading…', role: 'status', flags: [] }
  return { message: summary.status, flags: summary.flags }
}
