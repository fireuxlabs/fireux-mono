<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton size="xs" variant="ghost" icon="i-lucide-arrow-left" to="/apps">
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UAlert
        v-if="pending"
        color="neutral"
        variant="soft"
        title="Loading app"
      />

      <UAlert
        v-else-if="failed"
        color="error"
        variant="soft"
        title="App unavailable"
        description="This directory entry could not be loaded. Please try again."
      />

      <UAlert
        v-else-if="missing"
        color="warning"
        variant="soft"
        title="App not found"
        description="No published App directory entry matches this id or slug."
      />

      <AppCardsProfile
        v-else-if="profile"
        :model="profile"
        :show-details="false"
        :show-people="false"
        :show-socials="false"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useAppProfileView } from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppProfileView'
import type {
  AppDirectoryEntry,
  PlatformDirectoryResponse,
} from 'fireux-core/runtime/models/core/supporting/directory'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'View a published FireUX App directory projection.',
  name: 'FireuxAppDirectoryDetailPage',
})

const routeId = useRouteParam('id')
const { data, pending, error } = await useAsyncData<PlatformDirectoryResponse>(
  'fireux-platform-directory',
  () => $fetch('/api/public/directory'),
  { server: true, lazy: false }
)
const app = computed<AppDirectoryEntry | null>(() =>
  data.value?.apps.find(
    (entry: AppDirectoryEntry) =>
      entry.id === routeId.value || entry.slug === routeId.value
  ) ?? null
)
const statusCode = computed(() =>
  Number(
    (error.value as any)?.statusCode ||
      (error.value as any)?.status ||
      (error.value as any)?.response?.status ||
      0
  )
)
const missing = computed(() => !pending.value && !error.value && !app.value)
const failed = computed(() => Boolean(error.value))

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 500 ? statusCode.value : 503)
  }
}

const { model: profile } = useAppProfileView(app)
const pageTitle = computed(() => app.value?.app_name || 'App')
const pageDescription = computed(
  () => app.value?.description || 'Published FireUX App directory projection.'
)

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogImage: computed(
    () => app.value?.media.cover_url || app.value?.media.thumbnail_url || undefined
  ),
})
</script>
