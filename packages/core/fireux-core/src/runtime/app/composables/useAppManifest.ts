import { computed } from 'vue'
import { useRoute } from '#imports'
import { useFireUXConfig } from './config/FireUXConfig'
import { pageLayoutName } from '../utils/page-layout'
import { workspaceFamilyFromRouteContext } from '../../workspace/utils/routes'
import { useWorkspaceEntryCta } from '../../workspace/composables/useWorkspaceEntryCta'

/** App manifest policy follows the selected native layout; it owns no Workspace UI. */
export function useAppManifest() {
  const route = useRoute()
  const config = useFireUXConfig()
  const { homePath } = useWorkspaceEntryCta()
  return computed(() => {
    const family = workspaceFamilyFromRouteContext(
      route.path,
      route.meta.workspace
    )
    const query =
      pageLayoutName(route.meta.layout) === 'workspace' &&
      family &&
      config.workspaces.includes(family)
        ? `?surface=workspace&start_url=${encodeURIComponent(homePath(family))}`
        : ''
    return `/manifest.webmanifest${query}`
  })
}
