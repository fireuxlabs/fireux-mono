import {
  sharedArchitectureContracts,
  type IgnitionIndustryComparison,
  type SharedArchitectureKey,
} from '../models/industry-comparison.js'

/** Projects an authored review. It does not infer semantic equivalence or prove reuse. */
export function compareIndustries(comparison: IgnitionIndustryComparison) {
  if (comparison.baseline.id === comparison.candidate.id)
    throw new Error('Comparison needs distinct cases.')
  if (
    new Set(comparison.deltas.map((item) => item.id)).size !==
    comparison.deltas.length
  )
    throw new Error('Delta ids must be unique.')
  for (const delta of comparison.deltas) {
    if (!delta.reason.trim() || !delta.acceptance.trim())
      throw new Error('Deltas need reasons and observable acceptance criteria.')
    if (delta.reuse !== 'needs-implementation' && !delta.references.length)
      throw new Error('Reuse claims need source references.')
  }
  const shared = (
    Object.keys(sharedArchitectureContracts) as SharedArchitectureKey[]
  ).map((key) => {
    const dimension = sharedArchitectureContracts[key]
    const absent = {
      level: 'unverified' as const,
      note: 'This responsibility has not been reviewed.',
      references: [],
    }
    return {
      key,
      ...dimension,
      baseline: comparison.baseline.contracts[key] || absent,
      candidate: comparison.candidate.contracts[key] || absent,
    }
  })
  return {
    ...comparison,
    shared,
    boundary:
      'Identical architectural language describes the shared working hypothesis. Evidence and domain rules are assessed separately; neither matching labels nor a source review proves interchangeable code or a generated product.',
  }
}
