import { ref, type Ref } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreManager'
import type { Job } from '../../../../models/objects/Job.model.ts'
import { useJobCreate } from './useJobCreate'
import { useJobUpdate } from './useJobUpdate'
import { useJobDelete } from './useJobDelete'

export function useJobs() {
  const { firestoreFetchCollection, firestoreFetchDoc, getCollectionPath } =
    useFirestoreManager()

  const collectionPath = getCollectionPath('jobs')
  const jobsCollection =
    (firestoreFetchCollection<Job>(collectionPath) as Ref<Job[] | undefined>) ??
    ref<Job[] | undefined>([])

  const fetchJob = (slug: string) =>
    firestoreFetchDoc<Job>(collectionPath, slug)

  const { createJob } = useJobCreate()
  const { updateJob } = useJobUpdate()
  const { deleteJob } = useJobDelete()

  return {
    jobsCollection,
    fetchJob,
    createJob,
    updateJob,
    deleteJob,
  }
}
