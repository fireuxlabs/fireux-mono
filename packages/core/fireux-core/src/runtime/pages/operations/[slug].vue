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
import { createError, useAsyncData } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import {
  buildPublicPageJsonLd,
  useSeo,
} from '../../composables/fireux/seo/useSeo'
import { useRouteParam } from '../../composables/shared/useRouteParam'
import type { FireuxMetaOperation } from '../../../config/app/meta-content'

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
  (data.value?.operations || []).find(
    (entry) => entry.slug === requestedSlug.value
  )
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

useSeo({
  title: computed(
    () => `${operation.value?.title || 'Operation'} - ${appName.value}`
  ),
  description: () => operation.value?.description || '',
  path: computed(() =>
    requestedSlug.value
      ? `/operations/${encodeURIComponent(requestedSlug.value)}`
      : ''
  ),
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
    }),
})
</script>
