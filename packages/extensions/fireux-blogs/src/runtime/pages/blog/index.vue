<template>
  <BlogIndex />
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import BlogIndex from '../../blog/components/Index.vue'

const { appName } = useFireUXConfig()

const pageTitle = 'Blog'

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
