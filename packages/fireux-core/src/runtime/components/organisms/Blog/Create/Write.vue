<!-- app/components/organisms/Blog/Create/Write.vue -->
<template>
  <div class="write-system">
    <UInput v-model="post.title" placeholder="Blog Title" />

    <div class="editor-container">
      <ClientOnly>
        <QuillEditor
          v-model:content="post.content"
          content-type="html"
          theme="snow"
        />
      </ClientOnly>
    </div>

    <OrganismsBlogCreateAdvanced />
    <OrganismsBlogCreateImages />
  </div>
</template>

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const { getAuthor, generateSlug, computeReadingTime } = useBlogPosts()
const post = useState<BlogPostEntry>('createBlogPost')

onMounted(() => {
  // Seed author
  post.value.author = getAuthor()
})

watch(
  () => post.value.title,
  title => {
    post.value.slug = title ? generateSlug(title) : ''
  }
)

watch(
  () => post.value.content,
  content => {
    post.value.readingTime = computeReadingTime(content || '')
  }
)
</script>

<style scoped>
.write-system {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* breathing space between sections */
}
</style>
