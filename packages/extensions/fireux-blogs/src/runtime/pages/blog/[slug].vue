<template>
  <UPage>
    <UPageBody class="pagebody">
      <div v-if="pending" class="space-y-3">
        <USkeleton class="h-6 w-40" />
        <USkeleton class="h-10" />
        <USkeleton class="h-64" />
      </div>

      <BlogViewPage v-else-if="post" :post="post" />

      <DevDebugPanel
        v-if="post"
        object-origin="fetched"
        launcher
        include-route
        title="Blog detail (JSON)"
        context="blog detail · public projection · root: blogs"
        :objects="[post]"
        :derived="{}"
        :default-open="false"
      />

      <div v-else class="space-y-2">
        <h1 class="text-xl font-semibold">404 – Blog post not found</h1>
        <p class="text-sm text-muted">
          The requested article could not be loaded.
        </p>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useBlogDetail } from '../../composables/fireux/blog/directory/useBlogDetail'
import { useBlogSeo } from '../../composables/fireux/firestore/blog/utils/useBlogSeo'

const route = useRoute()
const { post, pending } = useBlogDetail(String(route.params.slug ?? ''))

useBlogSeo(post)
</script>
