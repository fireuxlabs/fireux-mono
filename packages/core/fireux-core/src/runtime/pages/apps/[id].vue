<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/[id].vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="space-y-6">
      <OrganismsAppSectionsSingle :app="currentApp" :compact="false" />
      <OrganismsAppSectionsCollection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useRoute } from 'vue-router'
import { useAppFetch } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppFetch.ts'

const route = useRoute()

const appId = computed(() => {
  const param = route.params.id
  const raw = Array.isArray(param) ? param[0] ?? '' : param?.toString() ?? ''
  const value = raw.trim()
  return value.length ? value : null
})

const { app } = useAppFetch(appId)
const currentApp = computed(() => app.value ?? null)

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
