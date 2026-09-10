import { useAppCollection } from './useAppCollection'

/** Public directory: bounded pages, independent of Workspace selection. */
export function useApps(endpoint = '/api/apps', pageSize = 24) {
  const separator = endpoint.includes('?') ? '&' : '?'
  return useAppCollection(`${endpoint}${separator}limit=${pageSize}`)
}

export type AppCollectionController = ReturnType<typeof useApps>
