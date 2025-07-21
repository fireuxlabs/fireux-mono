import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'

export async function getCleanboxRoutes() {
  // Get job marketplace routes from jobs package
  const jobRoutesResult = await getJobRoutes()

  // Return in the format expected by CoreDefault layout
  return {
    menuBarLinks: jobRoutesResult.routes || [],
    mobileLinks: [...(jobRoutesResult.routes || []), ...(jobRoutesResult.profileRoutes || [])],
  }
}
