<template>
  <main class="mx-auto grid w-full max-w-7xl gap-12 px-4 py-10">
    <AppHero :title="pageTitle" :description="pageDescription" />
    <AppCurrent :apps="appsController.apps.value" />
    <AppCreate :apps="appsController.apps.value" />
    <AppCollection
      :apps="appsController.apps.value"
      title="Ecosystem Apps"
      description="Browse Apps available through this Ecosystem."
    />
  </main>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useApps } from '../../app/composables/useApps'

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
const appsController = useApps()

const pageTitle = 'Apps'
const pageDescription = 'Find apps in this ecosystem, or start your app.'

useHead({ title: `${appName} | ${pageTitle}` })
</script>
