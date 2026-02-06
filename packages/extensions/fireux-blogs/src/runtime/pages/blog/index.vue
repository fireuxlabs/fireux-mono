<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <BlogCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useBlogFetch } from '../../composables/fireux/firestore/objects/blog/fetch/useBlogFetch'

const { appName } = useFireUXConfig()

const pageTitle = 'Blog'
const pageDescription = 'Latest articles.'

definePageMeta({
  layout: 'default',
  title: 'Blog',
  description: 'Latest articles.',
  nav: {
    key: 'blog',
    label: 'Blog',
    icon: 'i-lucide-book',
    order: 30,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'BlogIndexPage',
})

useHead({ title: `${appName} | ${pageTitle}` })

const { items } = useBlogFetch()
const collection = computed(() => items.value ?? [])
</script>
