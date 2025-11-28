import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'
import type { Job } from '../../../../types/job.model.ts'

export function useJobCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const jobs = firestoreFetchCollection<Job>('jobs')
  return { jobs }
}
