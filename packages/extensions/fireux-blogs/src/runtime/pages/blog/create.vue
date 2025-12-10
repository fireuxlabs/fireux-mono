<!-- FILE: packages/extensions/fireux-blogs/src/runtime/pages/blog/create.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Create Blog Post"
      description="Draft and publish a new post for this runtime."
    />

    <UPageBody class="pagebody">
      <div v-if="isChecking" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <UAlert
        v-else-if="!isAllowed"
        color="amber"
        title="Admins only"
        description="Only admins can publish blog posts for this runtime."
      />

      <OrganismsCreateShell
        v-else
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
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead, useRouter } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'
// Nuxt UI provides useToast via auto-import in app context; fall back if unavailable
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import { useBlogDraftState } from '../../composables/fireux/blog/useBlogDraftState'
import { useBlog } from '../../composables/fireux/firestore/objects/Blog/useBlog'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'blog-create',
    label: 'Create blog post',
    icon: 'i-lucide-plus',
    order: 31,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Create Blog Post',
})

const { isAdmin, isLoading } = useUser()
const isChecking = computed(() => Boolean(isLoading.value))
const isAllowed = computed(() => isAdmin.value)

useHead({ title: 'Create Blog Post' })

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
