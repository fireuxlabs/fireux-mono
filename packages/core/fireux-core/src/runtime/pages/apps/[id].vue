<template>
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
        description="No published app exists for this id."
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
        <AppProfile
          v-if="appProfileModel"
          :model="appProfileModel"
          :show-people="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, setResponseStatus, useHead } from '#imports'
import { useAppDetail } from '../../app/composables/useAppDetail'
import { useAppProfileView } from '../../app/composables/useAppProfileView'
import { useRouteParam } from '../../composables/shared/useRouteParam'

definePageMeta({
  layout: 'default',
  tenant: 'global',
  title: 'App',
  description: 'Published app profile from the owning ecosystem.',
  name: 'AppDetailPage',
})

const appId = useRouteParam('id')
const { app, ready, pending, statusCode, missing, failed } =
  useAppDetail(appId)

await ready

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
