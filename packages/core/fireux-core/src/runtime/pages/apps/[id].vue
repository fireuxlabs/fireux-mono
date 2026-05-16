<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody>
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading app…</p>
      </UPageCard>

      <UPageCard
        v-else-if="!app"
        title="App not found"
        description="No app record exists for this id."
        variant="subtle"
      >
        <UButton to="/apps" variant="soft" class="w-fit">
          Back to apps
        </UButton>
      </UPageCard>

      <div v-else class="space-y-6">
        <AppCardsProfile v-if="appProfileModel" :model="appProfileModel" />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, useHead, useRoute } from '#imports'
import { useAppFetch } from '../../composables/fireux/firestore/core/app/fetch/useAppFetch'
import { useAppProfileView } from '../../composables/fireux/firestore/core/app/utils/view/useAppProfileView'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'Canonical app record.',
  name: 'AppDetailPage',
})

const route = useRoute()
const appId = computed(() => String(route.params.id || '').trim())
const { app, pending } = useAppFetch(appId)
const { model: appProfileModel } = useAppProfileView(app)

const pageTitle = computed(() => app.value?.app_name || appId.value || 'App')
const pageDescription = computed(() =>
  app.value?.description || 'Canonical app record, media, admins, and public profile.'
)

useHead({
  title: computed(() => pageTitle.value),
})
</script>
