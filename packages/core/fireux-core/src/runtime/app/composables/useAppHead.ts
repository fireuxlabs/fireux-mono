import { toValue, type MaybeRefOrGetter } from 'vue'
import { useAppConfig, useHead, useRoute, useRuntimeConfig } from '#imports'
import { resolveSeoRobots } from '../../../utils/seoIndexing'
import { resolveAppTheme } from '../../utils/app-theme'
import { withBuildVersion } from '../../utils/build-version-url'

/** Shared App head policy; optional capabilities supply their manifest path. */
export function useAppHead(
  manifestPath: MaybeRefOrGetter<string> = '/manifest.webmanifest'
) {
  const runtimeConfig = useRuntimeConfig()
  const route = useRoute()
  const appConfig = useAppConfig()
  useHead(() => ({
    meta: [
      {
        name: 'theme-color',
        content: resolveAppTheme(appConfig.theme)?.palette.accent || '#000000',
      },
      ...(resolveSeoRobots({
        path: route.path,
        ...runtimeConfig.public.fireux.seo,
      }).includes('noindex')
        ? [{ name: 'robots', content: 'noindex, nofollow' }]
        : []),
    ],
    link: [
      {
        key: 'fireux-manifest',
        rel: 'manifest',
        href: withBuildVersion(
          toValue(manifestPath),
          runtimeConfig.app &&
            typeof runtimeConfig.app === 'object' &&
            'buildId' in runtimeConfig.app
            ? runtimeConfig.app.buildId
            : undefined
        ),
      },
    ],
  }))
}
