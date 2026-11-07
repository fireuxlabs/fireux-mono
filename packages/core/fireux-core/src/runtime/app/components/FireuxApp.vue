<template>
  <UApp>
    <ClientOnly>
      <FirePwaStatus />
    </ClientOnly>
    <LazyWorkspace
      v-if="route.meta.workspacePage && fireuxConfig.workspaces.length"
    />
    <NuxtLayout v-else>
      <UMain>
        <NuxtPage />
      </UMain>
    </NuxtLayout>

    <DevOnly>
      <AppDevControls />
    </DevOnly>

    <ClientOnly>
      <UModal
        v-if="showOnboardingModal"
        :open="showOnboardingModal"
        :dismissible="false"
        title="🚫 Blocked"
        :description="setupDescription"
      >
        <template #body>
          <AppInitializeSystem />
        </template>
      </UModal>
    </ClientOnly>
  </UApp>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveSeoRobots } from '../../../utils/seoIndexing'
import { useHead, useRoute, useRuntimeConfig } from '#imports'
import { useFireUXConfig } from '../composables/config/FireUXConfig'
import AppInitializeSystem from './Initialize/System.vue'
import { useAppRead } from '../composables/useAppRead'
import { workspaceFamilyFromRouteContext } from '../../workspace/utils/routes'
import { useWorkspaceEntryCta } from '../../workspace/composables/useWorkspaceEntryCta'
import { withBuildVersion } from '../../utils/build-version-url'

const fireuxConfig = useFireUXConfig()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { homePath: workspaceHomePath } = useWorkspaceEntryCta()
const manifestHref = computed(() => {
  const family = workspaceFamilyFromRouteContext(
    route.path,
    route.meta.workspace
  )
  const query =
    family && fireuxConfig.workspaces.includes(family)
      ? `?surface=workspace&start_url=${encodeURIComponent(workspaceHomePath(family))}`
      : ''
  return withBuildVersion(
    `/manifest.webmanifest${query}`,
    runtimeConfig.app &&
      typeof runtimeConfig.app === 'object' &&
      'buildId' in runtimeConfig.app
      ? runtimeConfig.app.buildId
      : undefined
  )
})
const { exists: appExists } = useAppRead(fireuxConfig.appId)
const setupDescription = 'This App needs to be initialized.'

const showOnboardingModal = computed(() => appExists.value === false)

useHead(() => ({
  meta: resolveSeoRobots({
    path: route.path,
    ...runtimeConfig.public.fireux.seo,
  }).includes('noindex')
    ? [{ name: 'robots', content: 'noindex, nofollow' }]
    : [],
  link: [{ key: 'fireux-manifest', rel: 'manifest', href: manifestHref.value }],
}))
</script>
