import type { IgnitionAssembly, IgnitionBrief } from '../models/ignition.js'
import { reviewSearchPlan } from './review-search-plan.ts'

function validateAssembly(brief: IgnitionBrief, assembly: IgnitionAssembly) {
  const requirements = new Set(brief.requirements.map((item) => item.id))
  const elements = new Map(assembly.elements.map((item) => [item.id, item]))
  if (elements.size !== assembly.elements.length)
    throw new Error('Assembly element ids must be unique.')
  for (const element of assembly.elements) {
    if (!element.id.trim() || !element.owner.trim())
      throw new Error('Every assembly element needs an id and owner.')
    for (const requirement of element.requirements)
      if (!requirements.has(requirement))
        throw new Error(`Unknown requirement: ${requirement}`)
    for (const dependency of element.uses)
      if (!elements.has(dependency))
        throw new Error(`Unknown assembly dependency: ${dependency}`)
  }
  const visited = new Set<string>(),
    visiting = new Set<string>()
  function visit(id: string) {
    if (visiting.has(id)) throw new Error(`Circular assembly dependency: ${id}`)
    if (visited.has(id)) return
    visiting.add(id)
    for (const dependency of elements.get(id)!.uses) visit(dependency)
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of elements.keys()) visit(id)
  for (const evidence of assembly.evidence) {
    if (!requirements.has(evidence.requirement))
      throw new Error(`Unknown evidence requirement: ${evidence.requirement}`)
    if (!evidence.observation.trim() || !evidence.references.length)
      throw new Error('Evidence needs an observation and references.')
  }
}

/** Structural comparison, not a generator, semantic-equivalence test or release gate. */
export function reconcileIgnition(
  brief: IgnitionBrief,
  proposal: IgnitionAssembly | null,
  reference: IgnitionAssembly
) {
  if (
    !brief.requirements.length ||
    new Set(brief.requirements.map((item) => item.id)).size !==
      brief.requirements.length ||
    brief.requirements.some(
      (item) => !item.id.trim() || !item.need.trim() || !item.acceptance.trim()
    )
  )
    throw new Error(
      'Brief requirements need unique ids, a need and acceptance criteria.'
    )
  validateAssembly(brief, reference)
  if (proposal) validateAssembly(brief, proposal)
  const coverage = brief.requirements.map((requirement) => {
    const observed = reference.elements.filter((item) =>
      item.requirements.includes(requirement.id)
    )
    const proposed =
      proposal?.elements.filter((item) =>
        item.requirements.includes(requirement.id)
      ) || []
    const status = !proposal
      ? 'proposal-not-supplied'
      : observed.length && proposed.length
        ? 'covered-in-both'
        : observed.length
          ? 'missing-in-proposal'
          : proposed.length
            ? 'new-in-proposal'
            : 'uncovered'
    return {
      ...requirement,
      status,
      observed,
      proposed,
      referenceJourneyProved:
        observed.length > 0 &&
        reference.evidence.some(
          (item) =>
            item.requirement === requirement.id &&
            item.level === 'journey-proved'
        ),
      proposalJourneyProved:
        proposed.length > 0 &&
        Boolean(
          proposal?.evidence.some(
            (item) =>
              item.requirement === requirement.id &&
              item.level === 'journey-proved'
          )
        ),
    }
  })
  return {
    briefId: brief.id,
    proposalSupplied: proposal !== null,
    search: reviewSearchPlan(brief.search),
    coverage,
    learnings: reference.learnings,
    boundary:
      'Coverage compares declared requirements only. Source review, passing checks and a completed user journey are separate evidence. A generated sibling still needs independent acceptance.',
  }
}
