<template>
  <DirectorySurface
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-app-window"
    secondary-label="Your Apps"
  >
    <AppCollectionManager
      :controller="appsController"
      title="Ecosystem Apps"
      description="Browse Apps available through this Ecosystem."
    />

    <template #secondary>
      <AppCollectionMine :controller="appsController" />
      <AppCTA :controller="appsController" />
    </template>
  </DirectorySurface>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
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
