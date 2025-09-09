<!-- app/components/organisms/Blog/Create/Write.vue -->
<template>
  <div class="write-system">
    <UInput v-model="blogPost.title" placeholder="Blog Title" />

    <div class="editor-container">
      <ClientOnly>
        <QuillEditor
          v-model:content="blogPost.content"
          content-type="html"
          theme="snow"
        />
      </ClientOnly>
    </div>

    <FireOrganismsBlogCreateAdvanced />
    <FireOrganismsBlogCreateImages />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
let QuillEditor: any
if (process.client) {
  const mod = await import('@vueup/vue-quill')
  QuillEditor = mod.QuillEditor
  await import('@vueup/vue-quill/dist/vue-quill.snow.css')
}
import { useCreateBlogPostState } from '../../../../composables/firestore/objects/Blog/useCreateBlogPostState'
import { useBlogPosts } from '../../../../composables/firestore/objects/Blog/useBlogPosts'

const { generateSlug, computeReadingTime } = await useBlogPosts()
const { blogPost } = useCreateBlogPostState()

// Watch for title changes to auto-generate slug
watch(
  () => blogPost.value.title,
  (title: string) => {
    blogPost.value.slug = title ? generateSlug(title) : ''
  }
)

// Watch for content changes to auto-compute reading time
watch(
  () => blogPost.value.content,
  (content: string) => {
    blogPost.value.readingTime = computeReadingTime(content || '')
  }
)
</script>

<style scoped>
.write-system {
  display: flex;
  flex-direction: column;
  gap: var(--space-6); /* Increased from 1.5rem to match product system */
}
</style>
