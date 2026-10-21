<template>
  <div class="write-system">
    <UInput
      v-model="blogPost.title"
      aria-label="Blog title"
      placeholder="Blog Title"
    />

    <ClientOnly>
      <UEditor
        v-slot="{ editor }"
        v-model="blogPost.content"
        content-type="html"
        aria-label="Blog content"
        placeholder="Write your post…"
        :image="false"
        :mention="false"
      >
        <UEditorToolbar :editor="editor" :items="toolbarItems" size="xs" />
      </UEditor>
      <template #fallback>
        <p>Loading editor…</p>
      </template>
    </ClientOnly>

    <BlogCreateAdvanced />
    <BlogCreateImages ref="imagesRef" />
  </div>
</template>

<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
import { onMounted, shallowRef, watch } from 'vue'
import { useBlogUtils } from '../../composables/firestore/utils/useBlogUtils'
import { useBlogDraftState } from '../../composables/editor/useBlogDraftState'

const toolbarItems: EditorToolbarItem[] = [
  { kind: 'mark', mark: 'bold', label: 'Bold' },
  { kind: 'mark', mark: 'italic', label: 'Italic' },
  { kind: 'heading', level: 2, label: 'H2' },
  { kind: 'bulletList', label: '• List' },
  { kind: 'orderedList', label: '1. List' },
  { kind: 'undo', label: 'Undo' },
  { kind: 'redo', label: 'Redo' },
]

const imagesRef = shallowRef<{
  uploadImages: (blogId: string) => Promise<{
    featuredImage: string
    socialImage: string
  }>
} | null>(null)

const { normalizeBlogSlug, computeReadingTime } = useBlogUtils()
const { blogPost } = useBlogDraftState()

onMounted(() => {
  // Ensure slug exists when a title was prefilled before mount.
  if (!blogPost.value.slug && blogPost.value.title) {
    blogPost.value.slug = normalizeBlogSlug(blogPost.value.title)
  }
})

// Watch for title changes to auto-generate slug
watch(
  () => blogPost.value.title,
  (title: string) => {
    blogPost.value.slug = title ? normalizeBlogSlug(title) : ''
  }
)

// Watch for content changes to auto-compute reading time
watch(
  () => blogPost.value.content,
  (content: string) => {
    blogPost.value.readingTime = computeReadingTime(content || '')
  }
)

defineExpose({
  uploadImages: (blogId: string) => imagesRef.value?.uploadImages(blogId),
})
</script>

<style scoped>
.write-system {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
}
</style>
