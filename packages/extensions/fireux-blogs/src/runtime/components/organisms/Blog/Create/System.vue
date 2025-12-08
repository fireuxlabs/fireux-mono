<template>
  <div class="component">
    <main>
      <UCard>
        <div class="card-header">
          <UButton
            variant="ghost"
            size="sm"
            icon="i-heroicons-trash"
            @click="handleClear"
            class="clear-button"
          />
        </div>
        <UTabs v-model="selectedTab" :items="tabItems">
          <template #write>
            <OrganismsBlogCreateWrite />
          </template>
          <template #preview>
            <OrganismsBlogCreatePreview />
          </template>
        </UTabs>
        <div class="actions">
          <UButton :loading="isCreating" @click="handleCreate">
            <UIcon name="i-heroicons-plus" />
            Publish
          </UButton>
        </div>
      </UCard>
    </main>

    <div v-if="isCreating">
      <UCard>
        <div>
          <UIcon name="i-heroicons-arrow-path" />
          <span>Publishing blog post...</span>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// Nuxt UI provides useToast via auto-import in app context; fall back if unavailable
const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined
import { useBlogDraftState } from '../../../../composables/fireux/blog/useBlogDraftState'
import { useBlog } from '../../../../composables/fireux/firestore/objects/Blog/useBlog'

const selectedTab = ref<'write' | 'preview'>('write')
const tabItems = [
  { label: 'Write', icon: 'i-lucide-pencil', value: 'write', slot: 'write' },
  { label: 'Preview', icon: 'i-lucide-eye', value: 'preview', slot: 'preview' },
]

const { blogPost, resetCreateBlogPostState, getBlogPostPayload } =
  useBlogDraftState()
const { createBlogPost, utils } = useBlog()
const isCreating = ref(false)

async function handleCreate() {
  console.log('📝 [handleCreate] Create blog post clicked')

  isCreating.value = true
  console.log('⏳ Starting blog post creation...')

  try {
    const payload = getBlogPostPayload()
    const slug = payload.slug || utils.generateSlug(payload.title || '')
    if (!slug) {
      throw new Error('Slug is required to publish a blog post')
    }

    await createBlogPost(payload, slug)

    console.log('🎉 Blog post created successfully!')
    if (toast) {
      toast.add({
        title: 'Published',
        description: 'Blog post published successfully',
        icon: 'i-heroicons-check-circle',
        color: 'green',
      })
    }

    handleClear()
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
  if (confirm('Are you sure you want to clear the form?')) {
    resetCreateBlogPostState()
    blogPost.value.slug = ''
    selectedTab.value = 'write'
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.clear-button {
  margin-left: auto;
}

footer,
.actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
</style>
