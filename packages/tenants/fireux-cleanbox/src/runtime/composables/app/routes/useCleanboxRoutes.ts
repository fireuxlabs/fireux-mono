import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'

export async function getCleanboxRoutes() {
  // Get job marketplace routes from jobs package
  const jobRoutesResult = await getJobRoutes()

  const result = {
    menuBarLinks: jobRoutesResult.routes || [],
    mobileLinks: [
      ...(jobRoutesResult.routes || []),
      ...(jobRoutesResult.profileRoutes || []),
    ],
  }
  return result
}
