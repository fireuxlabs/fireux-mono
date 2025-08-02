import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'

export async function getCleanboxRoutes() {
  // Get job routes using the new structure
  const jobRoutesResult = await getJobRoutes()

  return jobRoutesResult.value
}
