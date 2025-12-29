<template>
  <UPage>
    <UPageBody>
      <div v-if="pending" class="space-y-3">
        <USkeleton class="h-6 w-40" />
        <USkeleton class="h-10" />
        <USkeleton class="h-64" />
      </div>

      <OrganismsObjectsBlogCardsPage v-else-if="post" :post="post" />

      <div v-else class="space-y-2">
        <h1 class="text-xl font-semibold">404 – Blog post not found</h1>
        <p class="text-sm text-gray-500">
          The requested article could not be loaded.
        </p>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlog } from '../../composables/fireux/firestore/objects/blog/useBlog'

const route = useRoute()
const { fetchBySlug } = useBlog()

const postRef = await fetchBySlug(String(route.params.slug ?? ''))
const post = computed(() => postRef.value ?? undefined)
const pending = computed(() => postRef.value === undefined)
</script>
