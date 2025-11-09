<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="space-y-6">
      <OrganismsAppSectionsSingle :app="currentApp" />
      <OrganismsAppSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'

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
  title: 'Apps',
  description: 'FireUX apps resolved for this runtime.',
  layout: 'default',
  name: 'AppsIndexPage',
})

const { app } = useApp()
const currentApp = computed(() => app.value ?? null)

const pageTitle = computed(() => currentApp.value?.app_name ?? 'Apps')
const pageDescription = computed(() =>
  currentApp.value?.app_name
    ? `Inspect ${currentApp.value.app_name}, its overlays, and related apps.`
    : 'Inspect the current app and browse all apps available to this runtime.'
)

useHead({
  title: computed(() =>
    currentApp.value?.app_name ? `${currentApp.value.app_name} · Apps` : 'Apps'
  ),
})
</script>
