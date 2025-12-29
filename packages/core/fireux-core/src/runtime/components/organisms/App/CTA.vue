<template>
  <div class="space-y-4">
    <OrganismsAppCardsPreview />

    <UPageCTA title="Manage apps" :description="ctaDescription" variant="naked">
      <template #links>
        <UButton color="primary" size="lg" :to="detailsLink">
          {{ detailsLabel }}
        </UButton>
      </template>
    </UPageCTA>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from '../../../models/core/app.model'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'

const { app: runtimeApp } = useApp()

const current = computed<App | null>(() => runtimeApp.value ?? null)

const ctaDescription = computed(() =>
  current.value
    ? 'Inspect the current app or browse all apps available to this runtime.'
    : 'No app loaded. Browse all apps available to this runtime.'
)

const detailsLink = computed(() => {
  const id = current.value?.id
  return id ? `/apps/${id}` : '/apps'
})

const detailsLabel = computed(() =>
  current.value?.id ? 'View app details' : 'Browse apps'
)
</script>
