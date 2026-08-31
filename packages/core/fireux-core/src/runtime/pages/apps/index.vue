<template>
  <UPage>
    <UPageBody>
      <AppHero :title="pageTitle" :description="pageDescription" />
      <AppCurrent :apps="apps" />
      <AppCreate :apps="apps" />
      <AppCollection :apps="apps" scope="ecosystem" />
      <DevDebugPanel
        title="Apps index acquisition"
        context="Canonical Apps passed into the FL index surface."
        object-origin="fetched"
        :objects="{ apps }"
        :derived="{ count: apps.length, scope: 'ecosystem' }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useApps } from '../../app/composables/useApps'
import { useSeo } from '../../composables/fireux/seo/useSeo'

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  tenant: 'global',
  title: 'Apps',
  description: 'Browse apps for the current ecosystem.',
  layout: 'default',
  name: 'AppsIndexPage',
})

const { appName } = useFireUXConfig()
const { apps } = useApps()

const pageTitle = 'Apps'
const pageDescription = 'Find apps in this ecosystem, or start your app.'

useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/apps',
})
</script>
