<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/[id].vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="space-y-6">
      <OrganismsAppSectionsSingle :app-id="appId" />
      <OrganismsAppSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useAppFetch } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppFetch.ts'

const route = useRoute()
const appId = Array.isArray(route.params.id)
  ? route.params.id[0] ?? ''
  : route.params.id?.toString() ?? ''

const { app } = useAppFetch(appId || null)

const currentApp = computed(() =>
  app.value === undefined ? null : app.value ?? null
)

const pageTitle = computed(() => currentApp.value?.app_name ?? 'App Details')
const pageDescription = computed(() =>
  currentApp.value?.app_name
    ? `Inspect ${currentApp.value.app_name}, its overlays, and related apps.`
    : 'Inspect the selected app, its overlays, and related apps.'
)

useHead({
  title: computed(() =>
    currentApp.value?.app_name
      ? `${currentApp.value.app_name} · App`
      : 'App Details'
  ),
})
</script>
