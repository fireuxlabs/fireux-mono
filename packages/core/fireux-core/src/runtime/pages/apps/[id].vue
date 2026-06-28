<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody>
      <UPageCard v-if="pending || app === undefined" variant="subtle">
        <p class="text-sm text-dimmed">Loading app…</p>
      </UPageCard>

      <UPageCard
        v-else-if="app === null"
        title="App not found"
        description="No app record exists for this id."
        variant="subtle"
      >
        <UButton to="/apps" variant="soft" class="w-fit">
          Back to apps
        </UButton>
      </UPageCard>

      <AppDetailPublic v-else :app="app" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, useHead, useRoute } from '#imports'
import { useAppFetch } from '../../composables/fireux/firestore/core/app/fetch/useAppFetch'

definePageMeta({
  layout: 'default',
  tenant: 'global',
  title: 'App',
  description: 'Canonical app record.',
  name: 'AppDetailPage',
})

const route = useRoute()
const appId = computed(() => String(route.params.id || '').trim())
const { app, pending } = useAppFetch(appId)

const pageTitle = computed(() => app.value?.app_name || appId.value || 'App')
const pageDescription = computed(() =>
  app.value?.description || 'Public app profile, launch link, and case-study notes.'
)

useHead({
  title: computed(() => pageTitle.value),
})
</script>
