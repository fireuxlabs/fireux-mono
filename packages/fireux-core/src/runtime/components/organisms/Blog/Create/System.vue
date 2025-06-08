<!-- app/components/organisms/Blog/Create/System.vue -->
<template>
  <div class="root-container">
    <UTabs v-model="selectedTab" :items="tabItems">
      <template #write>
        <OrganismsBlogCreateWrite />
      </template>
      <template #preview>
        <OrganismsBlogCreatePreview />
      </template>
    </UTabs>

    <div class="actions">
      <UButton @click="handleCreate">Create Blog Post</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
// which tab is active
const selectedTab = ref<'write' | 'preview'>('write')
const tabItems = [
  { label: 'Write', icon: 'i-lucide-edit', value: 'write', slot: 'write' },
  { label: 'Preview', icon: 'i-lucide-eye', value: 'preview', slot: 'preview' }
]

// Shared entry state
const post = useState<BlogPostEntry>(
  'createBlogPost',
  (): BlogPostEntry => ({
    title: '',
    content: '',
    metaDescription: '',
    slug: '',
    author: { display_name: '', handle: '', avatar: '', id: '' },
    keywords: [],
    tags: [],
    canonicalUrl: '',
    featuredImage: '',
    socialImage: '',
    readingTime: '',
    cta_link: '',
    type: 'article',
    cta_text: ''
  })
)

// File refs for each image slot
const featuredFile = useState<File | null>(
  'createBlogFeaturedImageFile',
  () => null
)
const socialFile = useState<File | null>(
  'createBlogSocialImageFile',
  () => null
)

// Firestore creation helpers
const { createBlogPost } = useBlogPostCreate()
const { updateBlogPost } = useBlogPostUpdate()

async function handleCreate() {
  const { uploadImage } = useMediaStorage()

  // First, create the blog post to get an ID
  const id = await createBlogPost(post.value)
  post.value.slug = id

  // Upload featured image using generated ID
  const featuredUrl = await uploadImage({
    file: featuredFile.value,
    collection: 'blogs',
    id,
    type: 'featured'
  })
  // Upload social image using generated ID
  const socialUrl = await uploadImage({
    file: socialFile.value,
    collection: 'blogs',
    id,
    type: 'social'
  })

  // Update post with image URLs
  await updateBlogPost(id, {
    featuredImage: featuredUrl || '',
    socialImage: socialUrl || ''
  })

  try {
    console.log('Blog post created and updated with images, ID:', id)
  } catch (err) {
    console.error('Error updating blog post images:', err)
  }
}
</script>

<style scoped>
.root-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}
</style>
