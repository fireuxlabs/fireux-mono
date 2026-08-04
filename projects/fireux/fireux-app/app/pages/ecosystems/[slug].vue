<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/ecosystems"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UAlert
        v-if="pending"
        color="neutral"
        variant="soft"
        title="Loading ecosystem"
      />

      <UAlert
        v-else-if="failed"
        color="error"
        variant="soft"
        title="Ecosystem unavailable"
        description="This ecosystem could not be loaded. Please try again."
      />

      <UAlert
        v-else-if="!ecosystem"
        color="warning"
        variant="soft"
        title="Ecosystem not found"
        description="No published Ecosystem projection matches this slug."
      />

      <EcosystemCardsProfile v-else-if="profile" :item="profile" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useEcosystemInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import type { PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory'
import type { EcosystemDirectoryEntry } from 'fireux-core/runtime/models/utils/directory'

definePageMeta({
  layout: 'default',
  title: 'Ecosystem',
  description: 'View a published FireUX Ecosystem projection.',
  name: 'FireuxEcosystemDetailPage',
})

const routeSlug = useRouteParam('slug')
const { data, pending, error } = await useAsyncData<PlatformDirectoryResponse>(
  'fireux-platform-directory',
  () => $fetch('/api/public/directory'),
  { server: true, lazy: false }
)
const ecosystems = computed(() => data.value?.ecosystems ?? [])
const { profile: makeProfile } = useEcosystemInterface()
const ecosystem = computed(() =>
  ecosystems.value.find(
    (entry: EcosystemDirectoryEntry) =>
      entry.slug === routeSlug.value || entry.id === routeSlug.value
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
const missing = computed(
  () => !pending.value && !error.value && !ecosystem.value
)
const failed = computed(() => Boolean(error.value))

if (import.meta.server) {
  if (missing.value) {
    setResponseStatus(404)
  } else if (failed.value) {
    setResponseStatus(statusCode.value >= 500 ? statusCode.value : 503)
  }
}
const profile = computed(() => {
  const entry = ecosystem.value
  if (!entry) return null
  return makeProfile({
    ...entry,
    appCount: entry.app_count,
    href: entry.detail_url,
  })
})
const pageTitle = computed(() => ecosystem.value?.name || 'Ecosystem')
const pageDescription = computed(
  () => ecosystem.value?.description || 'Published FireUX Ecosystem projection.'
)

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogImage: computed(() => ecosystem.value?.image_url || undefined),
})
</script>
