import { getConsoleScopeFromPath } from './consoleRoutes'
import { useConsoleAccess } from './useConsoleAccess'
import { useRuntimeProjectSelection } from '../runtime-project/state'
import { useNav } from '../ui/nav/useNav'

export const useConsoleNav = () => {
  const nav = useNav(['console'])
  const { canAccessScope, consoleEnabled } = useConsoleAccess()
  const { runtimeProjectId } = useRuntimeProjectSelection()

  return {
    ...nav,
    baseNavFilter: (item: { to?: string | null }) => {
      if (!item.to?.startsWith('/console')) return true

      if (item.to.startsWith('/console/projects/')) {
        const hasProject = Boolean(String(runtimeProjectId.value || '').trim())
        if (!hasProject) {
          return item.to === '/console/projects/create'
        }
        return item.to !== '/console/projects/create'
      }

      const scope = getConsoleScopeFromPath(item.to)
      if (!scope) return consoleEnabled.value
      return canAccessScope(scope)
    },
  }
}
