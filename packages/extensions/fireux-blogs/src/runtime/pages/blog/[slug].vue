<template>
  <UPage>
    <UPageBody class="pagebody">
      <FireState v-if="pending" outcome="pending" />

      <div v-else-if="post">
        <UButton
          v-if="canPublishBlog"
          :to="`/dashboard/admin/blogs/${post.slug}`"
          color="neutral"
          variant="soft"
          >Edit post</UButton
        >
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

      <div v-else>
        <h1 class="fx-type-page-title">404 – Blog post not found</h1>
        <p>The requested article could not be loaded.</p>
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
