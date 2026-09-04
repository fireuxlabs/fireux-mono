import type { Deletion } from '../../models/utils/deletion.model'

const blocker = 'App deletion requires an authoritative inventory of App-owned records and relationships.'

/** Safe public deletion. Raw one-document deletion remains a lower primitive. */
export function useAppDeletion(): Deletion {
  const impact = async () => ({ canDelete: false, blockers: [blocker], effects: [] })
  const execute = async () => { throw new Error(blocker) }
  return { impact, execute }
}
