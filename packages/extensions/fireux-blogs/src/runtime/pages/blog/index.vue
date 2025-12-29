<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue -->
<template>
  <UPage>
    <UPageHeader title="Blog" description="Latest articles." />
    <UPageBody class="pagebody">
      <OrganismsObjectsBlogCTA />
      <OrganismsObjectsBlogCollectionView />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { appName } = useFireUXConfig()

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

useHead({ title: `${appName} | Blog` })
</script>
