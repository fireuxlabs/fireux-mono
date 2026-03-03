<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/admin/blogs/index.vue -->
<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription">
      <template #actions>
        <UButton to="/admin/blogs/create" color="primary">
          Create post
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <BlogCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useBlogFetch } from '../../../composables/fireux/firestore/blog/fetch/useBlogFetch'

const { appName } = useFireUXConfig()

const pageTitle = 'Blog'
const pageDescription = 'Manage blog posts for this runtime.'

definePageMeta({
  layout: 'console',
  title: 'Admin Blog',
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: `${appName} | ${pageTitle}` })

const { items } = useBlogFetch()
const collection = computed(() => items.value ?? [])
</script>
