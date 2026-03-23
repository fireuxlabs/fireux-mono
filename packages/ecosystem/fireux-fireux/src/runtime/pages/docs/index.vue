<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#imports'

function toFireuxDocsContentPath(routePath: string): string {
  const normalized = routePath === '/' ? '/' : routePath.replace(/\/+$/, '')
  return normalized === '/' ? '/README' : `${normalized}/README`
}

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

const landingPath = toFireuxDocsContentPath('/')

const { data: page } = await useAsyncData('fireux-docs-landing', () =>
  queryCollection('fireuxDocs' as never).path(landingPath).first()
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
