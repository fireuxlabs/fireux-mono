<template>
  <OrganismsCreateShell
    :loading="isCreating"
    submit-label="Publish"
    @submit="handleCreate"
    @clear="handleClear"
  >
    <template #write>
      <OrganismsBlogCreateWrite />
    </template>
    <template #preview>
      <OrganismsBlogCreatePreview />
    </template>
  </OrganismsCreateShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// Nuxt UI provides useToast via auto-import in app context; fall back if unavailable
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import { useBlogDraftState } from '../../../../composables/fireux/blog/useBlogDraftState'
import { useBlog } from '../../../../composables/fireux/firestore/objects/Blog/useBlog'
import { useRouter } from '#imports'

const { blogPost, resetCreateBlogPostState, getBlogPostPayload } =
  useBlogDraftState()
const { createBlogPost, utils } = useBlog()
const isCreating = ref(false)
const router = useRouter()

async function handleCreate() {
  isCreating.value = true

  try {
    const payload = getBlogPostPayload()
    const slug = payload.slug || utils.generateSlug(payload.title || '')
    if (!slug) {
      throw new Error('Slug is required to publish a blog post')
    }

    await createBlogPost(payload, slug)

    if (toast) {
      toast.add({
        title: 'Published',
        description: 'Blog post published successfully',
        icon: 'i-heroicons-check-circle',
        color: 'green',
      })
    }

    handleClear()
    await router.push('/blog')
  } catch (error: any) {
    console.error('❌ Blog post creation failed:', error)
    if (toast) {
      toast.add({
        title: 'Publish failed',
        description: error?.message || 'Unknown error',
        icon: 'i-heroicons-x-circle',
        color: 'red',
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
