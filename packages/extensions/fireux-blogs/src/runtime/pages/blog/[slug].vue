<template>
  <UPage>
    <UPageBody class="pagebody">
      <div v-if="pending" class="space-y-3">
        <USkeleton class="h-6 w-40" />
        <USkeleton class="h-10" />
        <USkeleton class="h-64" />
      </div>

      <div v-else-if="post">
        <UButton v-if="canPublishBlog" :to="`/dashboard/admin/blogs/${post.slug}`" color="neutral" variant="soft" class="mb-4">Edit post</UButton>
        <BlogDetail :post="post" />
      </div>

      <FireDiagnosticsDebugPanel
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
import { useBlogDetail } from '../../blog/composables/directory/useBlogDetail'
import { useBlogSeo } from '../../blog/composables/firestore/utils/useBlogSeo'

import { useBlogPermissions } from '../../blog/composables/useBlogPermissions'

const { canPublishBlog } = useBlogPermissions()
const route = useRoute()
const { post, pending } = useBlogDetail(String(route.params.slug ?? ''))

useBlogSeo(post)
</script>
