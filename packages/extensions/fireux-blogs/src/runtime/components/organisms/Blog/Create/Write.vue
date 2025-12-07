<!-- app/components/organisms/Blog/Create/Write.vue -->
<template>
  <div class="write-system">
    <UInput v-model="blogPost.title" placeholder="Blog Title" />

    <div class="editor-container">
      <ClientOnly>
        <div v-if="editor" class="editor-shell">
          <div class="editor-toolbar">
            <UButton
              size="xs"
              variant="ghost"
              @click="run('bold')"
              :pressed="isActive('bold')"
            >
              Bold
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              @click="run('italic')"
              :pressed="isActive('italic')"
            >
              Italic
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              @click="run('heading2')"
              :pressed="isActive('heading', { level: 2 })"
            >
              H2
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              @click="run('bullet')"
              :pressed="isActive('bulletList')"
            >
              • List
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              @click="run('ordered')"
              :pressed="isActive('orderedList')"
            >
              1. List
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              @click="run('undo')"
              :disabled="!can('undo')"
            >
              Undo
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              @click="run('redo')"
              :disabled="!can('redo')"
            >
              Redo
            </UButton>
          </div>
          <EditorContent :editor="editor" class="tiptap-content" />
        </div>
        <div v-else class="text-sm text-gray-500">Loading editor…</div>
      </ClientOnly>
    </div>

    <OrganismsBlogCreateAdvanced />
    <OrganismsBlogCreateImages />
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  watch,
  defineAsyncComponent,
  shallowRef,
} from 'vue'
import { useCreateBlogPostState } from '../../../../composables/firestore/objects/Blog/useCreateBlogPostState'
import { useBlogPosts } from '../../../../composables/fireux/firestore/objects/Blog/useBlogPosts'

const EditorContent = defineAsyncComponent(async () => {
  const mod = await import('@tiptap/vue-3')
  return mod.EditorContent
})

const editor = shallowRef<any>(null)

const { generateSlug, computeReadingTime } = await useBlogPosts()
const { blogPost } = useCreateBlogPostState()

onMounted(async () => {
  const [{ Editor }, { default: StarterKit }] = await Promise.all([
    import('@tiptap/vue-3'),
    import('@tiptap/starter-kit'),
  ])

  editor.value = new Editor({
    content: blogPost.value.content || '',
    extensions: [StarterKit],
    onUpdate: ({ editor }) => {
      blogPost.value.content = editor.getHTML()
      blogPost.value.readingTime = computeReadingTime(
        blogPost.value.content || ''
      )
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

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

const run = (
  action:
    | 'bold'
    | 'italic'
    | 'heading2'
    | 'bullet'
    | 'ordered'
    | 'undo'
    | 'redo'
) => {
  if (!editor.value) return
  const chain = editor.value.chain().focus()
  switch (action) {
    case 'bold':
      chain.toggleBold().run()
      break
    case 'italic':
      chain.toggleItalic().run()
      break
    case 'heading2':
      chain.toggleHeading({ level: 2 }).run()
      break
    case 'bullet':
      chain.toggleBulletList().run()
      break
    case 'ordered':
      chain.toggleOrderedList().run()
      break
    case 'undo':
      editor.value.commands.undo()
      break
    case 'redo':
      editor.value.commands.redo()
      break
  }
}

const isActive = (name: string, attrs?: Record<string, any>) =>
  editor.value?.isActive(name, attrs) ?? false

const can = (action: 'undo' | 'redo') => {
  if (!editor.value) return false
  return action === 'undo'
    ? editor.value.can().undo()
    : editor.value.can().redo()
}
</script>

<style scoped>
.write-system {
  display: flex;
  flex-direction: column;
  gap: var(--space-6); /* Increased from 1.5rem to match product system */
}

.editor-shell {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: white;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.tiptap-content {
  min-height: 220px;
  padding: 0.5rem;
}

.tiptap-content :deep(.ProseMirror) {
  outline: none;
}
</style>
