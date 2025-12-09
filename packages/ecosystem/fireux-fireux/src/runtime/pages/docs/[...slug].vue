<template>
  <div class="space-y-4">
    <ContentDoc :path="normalizedPath" source="fireuxDocs">
      <template #not-found>
        <h1 class="text-2xl font-semibold mb-2">Page not found</h1>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          We couldn’t find that doc yet. Try going back to the main docs index.
        </p>
      </template>
    </ContentDoc>

    <UCard>
      <p class="text-xs text-gray-600 dark:text-gray-400">
        Debug: requested <code>{{ rawPath }}</code> → resolving to
        <code>{{ normalizedPath }}</code> (source: fireuxDocs)
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useHead } from '#imports'

const route = useRoute()
const slug = route.params.slug as string[] | undefined
const rawPath = '/' + (slug ?? []).join('/')
const normalizedPath = rawPath === '/' ? '/index' : rawPath

definePageMeta({
  layout: 'FireuxDocs',
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

useHead({ title: 'FireUX Docs' })
</script>
