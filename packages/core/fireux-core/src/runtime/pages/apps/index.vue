<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody>
      <!-- Core/platform CTA family: AppCTA starts onboarding; My apps is scoped, browse is the public collection. -->
      <AppCTA :controller="appsController" />
      <AppCollectionMine :controller="appsController" />
      <AppCollectionManager
        :controller="appsController"
        title="Ecosystem directory"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useEcosystemAppCollection } from '../../ecosystem/composables/useEcosystemAppCollection'

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
const appsController = useEcosystemAppCollection()

const pageTitle = 'Apps'
const pageDescription = 'Find apps in this ecosystem, or start your app.'

useHead({ title: `${appName} | ${pageTitle}` })
</script>
