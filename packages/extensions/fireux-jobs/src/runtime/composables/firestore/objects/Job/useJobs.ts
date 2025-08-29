import { useObject } from 'fireux-core/runtime/composables/firestore/objects/useObject'
import { useJobCreate } from './useJobCreate'
import { useJobUpdate } from './useJobUpdate'
import { useJobDelete } from './useJobDelete'
import type { ObjectConfig } from 'fireux-core/runtime/models/objects/object.model'

export async function useJobs() {
  // Configure job-specific CRUD operations
  const jobConfig: ObjectConfig = {
    collectionName: 'jobs',
    objectType: 'Job', // This will create 'fetchJob' method
    createComposable: useJobCreate,
    updateComposable: useJobUpdate,
    deleteComposable: useJobDelete,
  }

  // Use the generic object composable with job-specific config
  const jobsComposable = await useObject(jobConfig)

  return {
    // Rename for job-specific context
    jobsCollection: jobsComposable.all,
    fetchJob: (jobsComposable as any).fetchJob, // Dynamic property based on objectType
    // All CRUD operations are included via spread
    ...jobsComposable,
  }
}
