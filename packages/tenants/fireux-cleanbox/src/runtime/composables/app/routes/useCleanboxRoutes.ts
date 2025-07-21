import { getJobRoutes } from '../../../../../../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes'

export async function getCleanboxRoutes() {
  console.log('🧽 useCleanboxRoutes: Starting to fetch routes...')
  
  // Get job marketplace routes from jobs package
  const jobRoutesResult = await getJobRoutes()
  
  console.log('🧽 useCleanboxRoutes: Raw job routes result:', JSON.stringify(jobRoutesResult, null, 2))

  // Return in the format expected by CoreDefault layout
  const result = {
    menuBarLinks: jobRoutesResult.routes || [],
    mobileLinks: [
      ...(jobRoutesResult.routes || []),
      ...(jobRoutesResult.profileRoutes || []),
    ],
  }
  
  console.log('🧽 useCleanboxRoutes: Final cleanbox routes:', JSON.stringify(result, null, 2))
  
  return result
}
