packages/ecosystem/fireux-fireux/src/runtime/pages/docs/index.vue
<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'docs',
  title: 'Docs',
  nav: {
    key: 'docs',
    label: 'Docs',
    icon: 'i-lucide-book-open',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['default', 'docs'],
  },
})

const { data: page } = await useAsyncData('fireux-docs-landing', () =>
  queryContent({ source: 'fireuxDocs' }).where({ _path: '/' }).findOne()
)

const title = computed(
  () => page.value?.seo?.title || page.value?.title || 'FireUX Docs'
)
const description = computed(
  () =>
    page.value?.seo?.description ||
    page.value?.description ||
    'FireUX documentation overview.'
)

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})
</script>

<template>
  <div class="space-y-6">
    <ContentRenderer v-if="page" :value="page" :prose="false">
      <template #empty>
        <p class="text-sm text-dimmed">No content found for docs landing.</p>
      </template>
    </ContentRenderer>
  </div>
</template>
