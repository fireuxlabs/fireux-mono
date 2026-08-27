<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/dashboard/admin/blogs/create.vue -->
<!-- Concurrent edit — 2026-07-21 17:00 CEST — Dashboard Family pass: clarify the Blog publish task and stabilize permission loading. -->
<template>
  <UDashboardPanel id="dashboard-admin-blogs-create">
    <template #header>
      <LayoutsDashboardNavbar title="Admin · Create Blog Post" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            headline="Blog posts"
            title="Write and publish a post"
            description="Draft the post, review its preview, then publish it to the blog."
          >
            <template #links>
              <UButton
                to="/dashboard/admin/blogs"
                label="Back to posts"
                icon="i-lucide-arrow-left"
                color="neutral"
                variant="soft"
              />
            </template>
          </UPageHeader>

          <div v-if="permissionsPending" class="space-y-3">
            <USkeleton v-for="n in 3" :key="n" class="h-20" />
          </div>

          <UAlert
            v-else-if="!canPublishBlog"
            color="warning"
            title="Admins only"
            description="Only app admins can publish blog posts."
          />

          <CreateShell
            v-else
            :loading="isCreating"
            submit-label="Publish"
            @submit="handleCreate"
            @clear="handleClear"
          >
            <template #write>
              <BlogCreateWrite />
            </template>
            <template #preview>
              <BlogCreatePreview />
            </template>
          </CreateShell>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead, useRouter } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useBlogPermissions } from '../../../../composables/useBlogPermissions'
import { useBlogDraftState } from '../../../../composables/fireux/blog/editor/useBlogDraftState'
import { useBlogCreateSubmit } from '../../../../composables/fireux/blog/editor/useBlogCreateSubmit'

definePageMeta({
  layout: 'dashboard',
  title: 'Create Blog Post',
  requiresAuth: true,
  roles: ['admin'],
})

const toast = useToastify()
const { canPublishBlog, pending: permissionsPending } = useBlogPermissions()

useHead({ title: 'Create Blog Post' })

const { blogPost, resetCreateBlogPostState } = useBlogDraftState()
const { submit } = useBlogCreateSubmit()
const isCreating = ref(false)
const router = useRouter()

async function handleCreate() {
  isCreating.value = true

  try {
    await submit()
    toast.success('Blog post published.')

    handleClear()
    await router.push('/blog')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Blog post was not published: ${message}`)
  } finally {
    isCreating.value = false
  }
}

function handleClear() {
  resetCreateBlogPostState()
  blogPost.value.slug = ''
}
</script>
