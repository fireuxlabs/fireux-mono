<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue -->
<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Blog index"
        description="Browse published articles for this runtime. Editorial authoring remains in the admin blog workspace."
        family="admin-managed"
        source="blogs collection"
        :count-label="`${collection.length} post${collection.length === 1 ? '' : 's'}`"
        :actions="actions"
      />
      <BlogCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useBlogCollection } from '../../composables/fireux/firestore/blog/fetch/useBlogCollection'

const { appName } = useFireUXConfig()

const pageTitle = 'Blog'
const pageDescription = 'Canonical blog index for the current runtime.'

definePageMeta({
  layout: 'default',
  title: 'Blog',
  description: 'Canonical blog index for the current runtime.',
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

const { collection } = useBlogCollection()

const actions = [
  {
    label: 'Create',
    cta: 'Write post',
    to: '/admin/blogs/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Related',
    cta: 'Browse products',
    to: '/products',
    icon: 'i-lucide-box',
  },
] as const
</script>
