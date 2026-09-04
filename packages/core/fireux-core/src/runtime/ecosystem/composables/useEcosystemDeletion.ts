import type { Deletion } from '../../models/utils/deletion.model'

const blocker = 'Ecosystem deletion requires authoritative App relationships across every App database.'

/** Safe public deletion. It cannot leave Apps referencing a missing Ecosystem. */
export function useEcosystemDeletion(): Deletion {
  const impact = async () => ({ canDelete: false, blockers: [blocker], effects: [] })
  const execute = async () => { throw new Error(blocker) }
  return { impact, execute }
}
