import type { Deletion } from '../../models/utils/deletion.model'

const blocker = 'User deletion requires authoritative App membership relationships across every App database.'

/** Safe public deletion. It cannot orphan AppUser relationships or delete Auth implicitly. */
export function useUserDeletion(): Deletion {
  const impact = async () => ({ canDelete: false, blockers: [blocker], effects: [] })
  const execute = async () => { throw new Error(blocker) }
  return { impact, execute }
}
