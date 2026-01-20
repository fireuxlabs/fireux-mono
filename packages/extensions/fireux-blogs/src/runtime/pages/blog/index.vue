<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <BlogCTA />
      <BlogCollectionManager :collection="items" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
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
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  head: { title: 'Blog' },
})

useHead({ title: `${appName} | ${pageTitle}` })

const { items } = useBlogFetch()
</script>
