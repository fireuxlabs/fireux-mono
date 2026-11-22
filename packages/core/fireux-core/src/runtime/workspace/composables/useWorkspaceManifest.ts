import { useHead, useRoute, useRuntimeConfig } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { pageLayoutName } from '../../app/utils/page-layout'
import { withBuildVersion } from '../../app/utils/build-version-url'
import { workspaceFamilyFromRouteContext } from '../utils/routes'
import { useWorkspaceEntryCta } from './useWorkspaceEntryCta'

export function useWorkspaceManifest() {
  const route = useRoute()
  const config = useFireUXConfig()
  const { app } = useRuntimeConfig()
  const { homePath } = useWorkspaceEntryCta()

  useHead(() => {
    const family = workspaceFamilyFromRouteContext(
      route.path,
      route.meta.workspace
    )
    if (
      pageLayoutName(route.meta.layout) !== 'workspace' ||
      !family ||
      !config.workspaces.includes(family)
    )
      return {}

    return {
      link: [
        {
          key: 'fireux-manifest',
          rel: 'manifest',
          href: withBuildVersion(
            `/workspace.webmanifest?start_url=${encodeURIComponent(homePath(family))}`,
            app?.buildId
          ),
        },
      ],
    }
  })
}
