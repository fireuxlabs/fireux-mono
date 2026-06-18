<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody>
      <BlogCTA />
      <BlogCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

const { appName } = useFireUXConfig()

const pageTitle = 'Blog'
const pageDescription = 'Read updates, releases, and stories.'

definePageMeta({
  layout: 'default',
  title: 'Blog',
  description: 'Read updates, releases, and stories.',
  nav: {
    key: 'blog',
    label: 'Blog',
    icon: 'i-lucide-book',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
  name: 'BlogIndexPage',
})

useHead({ title: `${appName} | ${pageTitle}` })

</script>
