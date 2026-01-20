import type { AppModel } from '../../../../../../models/core/app.model'

/**
 * Placeholder for future cascading app delete flows.
 * For now, developers should rely on manual scripts or maintenance tasks.
 */
export function useAppDelete() {
  const deleteApp = async (_app?: AppModel | null) => {
    throw new Error('[useAppDelete] Not implemented. Use maintenance scripts.')
  }

  return { deleteApp }
}
