import { useObject } from 'fireux-core/runtime/composables/firestore/objects/useObject'
import { useJobCreate } from './useJobCreate'
import { useJobUpdate } from './useJobUpdate'
import { useJobDelete } from './useJobDelete'
import type { Job } from '../../../../models/objects/Job.model'
import type { ObjectConfig } from 'fireux-core/runtime/models/objects/object.model'

export async function useJobs() {
  // Configure job-specific CRUD operations
  const jobConfig: ObjectConfig = {
    collectionName: 'jobs',
    createComposable: useJobCreate,
    updateComposable: useJobUpdate,
    deleteComposable: useJobDelete,
  }

  // Use the generic object composable with job-specific config
  const jobsComposable = await useObject<Job>(jobConfig)

  return {
    // Rename for job-specific context
    jobsCollection: jobsComposable.objectsCollection,
    fetchJob: jobsComposable.fetchObject,
    // All CRUD operations are included via spread
    ...jobsComposable,
  }
}
