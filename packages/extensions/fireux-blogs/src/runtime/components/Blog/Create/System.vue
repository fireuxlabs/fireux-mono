<template>
  <MoleculesCreateShell
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
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { ref } from 'vue'
import { useBlogCreateSubmit } from '../../../composables/fireux/blog/editor/useBlogCreateSubmit'
import { useBlogDraftState } from '../../../composables/fireux/blog/editor/useBlogDraftState'
// Nuxt UI provides useToast via auto-import in app context; fall back if unavailable
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

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
