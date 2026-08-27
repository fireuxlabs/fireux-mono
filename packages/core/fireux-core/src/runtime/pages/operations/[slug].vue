<!-- Concurrent edit — 2026-07-21 13:12 CEST — Operation detail surfaces: add catalogue-backed factual pages. -->
<!-- Concurrent edit — 2026-07-21 13:16 CEST — Project Operation copy: use the authored description instead of generating an awkward title. -->
<template>
  <main v-if="operation" class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton
          :to="`/operations#${operation.workspace.id}`"
          variant="link"
          class="px-0"
        >
          Operations
        </UButton>
        <UPageHeader
          :title="operation.headline || operation.title"
          :description="operation.description"
          :headline="operation.workspace.name"
        />
        <UPageBody class="space-y-4">
          <OperationGuidingLiterature :operation="operation" />

          <div class="flex flex-wrap gap-3">
            <UButton
              :to="operation.to"
              :icon="operation.icon"
              color="primary"
              trailing-icon="i-lucide-arrow-right"
            >
              Open {{ operation.title }}
            </UButton>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
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
  $fetch<OperationsResponse>('/api/app/operations')
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
    () =>
      `${operation.value?.headline || operation.value?.title || 'Operation'} - ${appName.value}`
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
