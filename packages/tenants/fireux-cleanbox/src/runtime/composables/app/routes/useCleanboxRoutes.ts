import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'

export async function getCleanboxRoutes() {
  // Get job marketplace routes from jobs package
  const jobRoutesResult = await getJobRoutes()

  return {
    profileRoutes: jobRoutesResult.profileRoutes,
    routes: jobRoutesResult.routes,
  }
}
