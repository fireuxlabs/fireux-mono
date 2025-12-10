<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <OrganismsBlogCTA v-if="canPublishBlog" />
      <OrganismsBlogList :posts="posts ?? []" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useBlog } from '../../composables/fireux/firestore/objects/Blog/useBlog'
import { useBlogPermissions } from '#fireux-blogs/composables/useBlogPermissions'

const { appName } = useFireUXConfig()
const pageTitle = 'Blog'
const pageDescription = 'Latest articles.'

definePageMeta({
  layout: 'default',
  title: pageTitle,
  description: pageDescription,
  nav: {
    key: 'blog',
    label: 'Blog',
    icon: 'i-lucide-book',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  head: { title: pageTitle },
})

useHead({ title: `${appName} | ${pageTitle}` })

const { items: posts } = useBlog()
const { canPublishBlog } = useBlogPermissions()
</script>
