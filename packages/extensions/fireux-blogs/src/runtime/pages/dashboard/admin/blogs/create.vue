<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/dashboard/admin/blogs/create.vue -->
<template>
  <UDashboardPanel id="dashboard-admin-blogs-create">
    <template #header>
      <LayoutsDashboardNavbar title="Admin · Create Blog Post" />
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6">
        <UPage>
          <UPageBody class="pagebody">
            <UAlert
              v-if="!canPublishBlog"
              color="warning"
              title="Admins only"
              description="Only admins can publish blog posts for this runtime."
            />

            <MoleculesCreateShell
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
            </MoleculesCreateShell>
          </UPageBody>
        </UPage>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead, useRouter } from '#imports'
import { useBlogPermissions } from '../../../../composables/useBlogPermissions'
// Nuxt UI provides useToast via auto-import in app context; fall back if unavailable
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import { useBlogDraftState } from '../../../../composables/fireux/blog/editor/useBlogDraftState'
import { useBlogCreateSubmit } from '../../../../composables/fireux/blog/editor/useBlogCreateSubmit'

definePageMeta({
  layout: 'dashboard',
  title: 'Create Blog Post',
  requiresAuth: true,
  roles: ['admin'],
})

const { canPublishBlog } = useBlogPermissions()

useHead({ title: 'Create Blog Post' })

const { blogPost, resetCreateBlogPostState } = useBlogDraftState()
const { submit } = useBlogCreateSubmit()
const isCreating = ref(false)
const router = useRouter()

async function handleCreate() {
  isCreating.value = true

  try {
    const slug = await submit()

    if (toast) {
      toast.add({
        title: 'Published',
        description: 'Blog post published successfully',
        icon: 'i-heroicons-check-circle',
        color: 'success',
      })
    }

    handleClear()
    await router.push('/blog')
  } catch (error: any) {
    if (toast) {
      toast.add({
        title: 'Publish failed',
        description: error?.message || 'Unknown error',
        icon: 'i-heroicons-x-circle',
        color: 'error',
      })
    }
  } finally {
    isCreating.value = false
  }
}

function handleClear() {
  resetCreateBlogPostState()
  blogPost.value.slug = ''
}
</script>
