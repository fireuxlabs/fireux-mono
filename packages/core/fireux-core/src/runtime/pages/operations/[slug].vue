<!-- Concurrent edit — 2026-07-21 13:12 CEST — Operation detail surfaces: add catalogue-backed factual pages. -->
<!-- Concurrent edit — 2026-07-21 13:16 CEST — Project Operation copy: use the authored description instead of generating an awkward title. -->
<template>
  <PublicSimplePage
    v-if="operation"
    :title="operation.title"
    :description="operation.description"
    :eyebrow="operation.console.name"
    :back-to="`/operations#${operation.console.id}`"
    back-label="Operations"
  >
    <template #actions>
      <UButton
        :to="operation.to"
        :icon="operation.icon"
        color="primary"
        trailing-icon="i-lucide-arrow-right"
      >
        Open {{ operation.title }}
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createError, useAsyncData, useSeoMeta } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useRouteParam } from '../../composables/shared/useRouteParam'
import type { FireuxMetaOperation } from '../../models/system/meta-content.model'

type OperationsResponse = {
  ok: boolean
  operations: FireuxMetaOperation[]
}

const fireux = useFireUXConfig()
const requestedSlug = useRouteParam('slug')
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')

const { data } = await useAsyncData('public-app-operations', () =>
  $fetch<OperationsResponse>('/api/public/app/operations')
)

const operation = computed(() =>
  (data.value?.operations || []).find((entry) => entry.slug === requestedSlug.value)
)

if (!operation.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Operation not found: ${requestedSlug.value}`,
  })
}

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: () => `${operation.value?.title || 'Operation'} - ${appName.value}`,
  ogTitle: () => `${operation.value?.title || 'Operation'} - ${appName.value}`,
  twitterTitle: () => `${operation.value?.title || 'Operation'} - ${appName.value}`,
  description: () => operation.value?.description || '',
  ogDescription: () => operation.value?.description || '',
  twitterDescription: () => operation.value?.description || '',
})
</script>
