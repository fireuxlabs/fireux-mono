<template>
  <!-- Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: hide private creator identity on public App detail. -->
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody>
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading app…</p>
      </UPageCard>

      <UAlert
        v-else-if="failed"
        color="error"
        variant="soft"
        title="App unavailable"
        description="This app could not be loaded right now. Please try again."
      />

      <UPageCard
        v-else-if="missing"
        title="App not found"
        description="No published app exists for this id or slug."
        variant="subtle"
      >
        <UButton to="/apps" variant="soft" class="w-fit">
          Back to apps
        </UButton>
      </UPageCard>

      <div
        v-else-if="app"
        class="space-y-6"
        data-app-projection="detail"
        :data-app-id="app.id"
      >
        <AppCardsProfile
          v-if="appProfileModel"
          :model="appProfileModel"
          :show-people="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, setResponseStatus, useAsyncData, useHead } from '#imports'
import { useAppProfileView } from '../../composables/fireux/firestore/core/app/utils/view/useAppProfileView'
import { useRouteParam } from '../../composables/shared/useRouteParam'
import type {
  PublicAppDto,
  PublicDetailResponse,
} from '../../server/utils/public-projection/public-dto.types'

definePageMeta({
  layout: 'default',
  tenant: 'global',
  title: 'App',
  description: 'Published app profile from the owning ecosystem.',
  name: 'AppDetailPage',
})

const appId = useRouteParam('id')
const { data, pending, error } = await useAsyncData(
  () => `public-app-${appId.value || 'unknown'}`,
  async () => {
    if (!appId.value) return null
    return $fetch<PublicDetailResponse<PublicAppDto>>(
      `/api/public/apps/${encodeURIComponent(appId.value)}`
    )
  },
  {
    server: true,
    watch: [appId],
  }
)

const app = computed<PublicAppDto | null>(() => {
  return data.value?.item ?? null
})
const statusCode = computed(() =>
  Number(
    (error.value as any)?.statusCode ||
      (error.value as any)?.status ||
      (error.value as any)?.response?.status ||
      0
  )
)
const missing = computed(
  () =>
    statusCode.value === 404 || (!pending.value && !error.value && !app.value)
)
const failed = computed(() => Boolean(error.value) && statusCode.value !== 404)

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 500 ? statusCode.value : 503)
  }
}

const { model: appProfileModel } = useAppProfileView(app)

const pageTitle = computed(() => app.value?.app_name || appId.value || 'App')
const pageDescription = computed(
  () =>
    app.value?.description ||
    'Published app profile from the owning ecosystem.'
)

useHead({
  title: computed(() => pageTitle.value),
})
</script>
