<template>
  <CreateShell
    :loading="isCreating"
    submit-label="Publish"
    @submit="handleCreate"
    @clear="handleClear"
  >
    <template #write>
      <BlogCreateWrite ref="writeRef" />
    </template>
    <template #preview>
      <BlogCreatePreview />
    </template>
  </CreateShell>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { ref, watch } from 'vue'
import { useBlogCreateSubmit } from '../../composables/editor/useBlogCreateSubmit'
import { useBlogDraftState } from '../../composables/editor/useBlogDraftState'
// Nuxt UI provides useToast via auto-import in app context; fall back if unavailable
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const { blogPost, resetCreateBlogPostState } = useBlogDraftState()
const { submit, captureIntent, scopeEpoch } = useBlogCreateSubmit()
const isCreating = ref(false)
watch(scopeEpoch, () => { isCreating.value = false }, { flush: 'sync' })
const writeRef = ref<{
  uploadImages: (blogId: string) => Promise<
    | {
        featuredImage: string
        socialImage: string
      }
    | undefined
  >
} | null>(null)
const router = useRouter()

async function handleCreate() {
  if (isCreating.value) return
  const isCurrent = captureIntent()
  isCreating.value = true

  try {
    await submit(async (blogId) => writeRef.value?.uploadImages(blogId))

    if (!isCurrent()) return
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
    if (!isCurrent()) return
    if (!isCurrent()) return
    if (toast) {
      toast.add({
        title: 'Publish failed',
        description: error?.message || 'Unknown error',
        icon: 'i-heroicons-x-circle',
        color: 'error',
      })
    }
  } finally {
    if (isCurrent()) isCreating.value = false
  }
}

function handleClear() {
  resetCreateBlogPostState()
  blogPost.value.slug = ''
}
</script>
