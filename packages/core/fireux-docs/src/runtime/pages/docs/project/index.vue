<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      headline="Project Pages"
    />

    <UPageBody class="pagebody">
      <ContentRenderer :value="page" />
    </UPageBody>
  </UPage>

  <div v-else class="space-y-3">
    <h1 class="text-2xl font-semibold">Project pages docs not found</h1>
    <p class="text-sm text-dimmed">
      The FireUX docs layer does not yet have a project pages README.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'docs',
  title: 'Project Pages',
  path: '/docs/pages/project',
})

const { data: page } = await useAsyncData(
  'fireux-docs-pages-project-page',
  () =>
    queryCollection('fireuxDocs' as never)
      .path('/pages/docs/project/README')
      .first()
)

const title = computed(
  () => page.value?.seo?.title || page.value?.title || 'Project Pages'
)
const description = computed(
  () =>
    page.value?.seo?.description ||
    page.value?.description ||
    'FireUX project page surfaces.'
)

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})
</script>
