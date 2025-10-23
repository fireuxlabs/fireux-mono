# FireUX Blog Composables (Current)

## FILE: packages/core/fireux-core/src/runtime/composables-old/firestore/objects/Blog/useCreateBlogPostState.ts

```ts
import { useStorage } from '@vueuse/core'
import { onMounted } from 'vue'
import { useFireUXConfig } from '../../../FireUXConfig'
import { useBlogPostUtils } from './useBlogPostUtils'
import type { BlogPostEntry } from '../../../../models/objects/blogPost.model'

export function useCreateBlogPostState() {
  const now = new Date().toISOString()
  const { appId: tenantId } = useFireUXConfig()
  const { getAuthor, getDefaultImages } = useBlogPostUtils()

  // Default blog post template
  const defaultBlogPost: BlogPostEntry = {
    title: '',
    content: '',
    metaDescription: '',
    slug: '',
    author: {
      id: '',
      display_name: '',
      avatar: '',
    },
    keywords: [],
    tags: [],
    canonicalUrl: '',
    featuredImage: '',
    socialImage: '',
    readingTime: '',
    cta_link: '',
    cta_text: '',
    type: 'article',
    product_id: undefined,
  }

  // Reactive state stored in localStorage
  const blogPost = useStorage<BlogPostEntry>('createBlogPost', defaultBlogPost)

  // Image state keys (must match what ImagePicker components use)
  const featuredImageData = useStorage<string>(
    'createBlogFeaturedImageData',
    ''
  )
  const socialImageData = useStorage<string>('createBlogSocialImageData', '')

  // Initialize author on mount
  onMounted(async () => {
    if (!blogPost.value.author.id) {
      blogPost.value.author = await getAuthor()
    }
  })

  // Reset function to clear all blog post state
  function resetCreateBlogPostState() {
    const defaultImages = getDefaultImages()

    blogPost.value = {
      title: '',
      content: '',
      metaDescription: '',
      slug: '',
  author: blogPost.value.author,
      keywords: [],
      tags: [],
      canonicalUrl: '',
      featuredImage: defaultImages.featuredImage,
      socialImage: defaultImages.socialImage,
      readingTime: '',
      cta_link: '',
      cta_text: '',
      type: 'article',
      product_id: undefined,
    }

    // Clear image picker state
    featuredImageData.value = ''
    socialImageData.value = ''
  }

  // Get complete blog post payload ready for creation
  function getBlogPostPayload() {
    return {
      ...blogPost.value,
      created_at: now,
      updated_at: now,
  appId: tenantId,
    }
  }

  return {
    blogPost,
    featuredImageData,
    socialImageData,
    resetCreateBlogPostState,
    getBlogPostPayload,
  }
}

```

## FILE: packages/core/fireux-core/src/runtime/composables-old/firestore/objects/Blog/useBlogCreate.ts

```ts
import { useFirestoreManager } from '../../useFirestoreManager'
import type { BlogPost } from '../../../../models/objects/blogPost.model'

export function useBlogCreate() {
  const { setDocument } = useFirestoreManager()

  const createBlogPost = async (
    postData: Partial<BlogPost>,
    slug: string
  ): Promise<string> => {
    // Use the slug as the document ID
    return setDocument('blogs', slug, postData).then(() => slug)
  }

  return { createBlogPost }
}

```

## FILE: packages/core/fireux-core/src/runtime/composables-old/firestore/objects/Blog/useBlogUpdate.ts

```ts
import { useFirestoreUpdate } from '../../useFirestoreUpdate'
import { serverTimestamp } from 'firebase/firestore'
import type { BlogPost } from '../../../../models/objects/blogPost.model'

export function useBlogUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  async function updateBlogPost(
    postId: string,
    updates: Partial<BlogPost>
  ): Promise<boolean> {
    try {
      if (!postId) {
        throw new Error('No BlogPost ID provided.')
      }

      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid update payload. Must be an object.')
      }

      // Add server timestamp for updated_at
      const updateData = {
        ...updates,
        updated_at: serverTimestamp(),
      }

      await updateDocument('blogs', postId, updateData)
      console.log(`✅ BlogPost updated successfully: ${postId}`)
      return true
    } catch (error) {
      console.error('❌ Error updating BlogPost:', error)
      throw error
    }
  }

  return { updateBlogPost }
}

```

## FILE: packages/core/fireux-core/src/runtime/composables-old/firestore/objects/Blog/useBlogDelete.ts

```ts
import { useFirestoreManager } from '../../useFirestoreManager'

export function useBlogDelete() {
  const { deleteDocument } = useFirestoreManager()

  async function deleteBlogPost(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('No blog post slug provided.')
    }

    try {
      await deleteDocument('blogs', slug)
      console.log('✅ Blog Post Deleted Successfully')
      return true
    } catch (error) {
      console.error('❌ Error Deleting Blog Post:', error)
      throw error
    }
  }

  return { deleteBlogPost }
}

```

## FILE: packages/core/fireux-core/src/runtime/composables-old/firestore/objects/Blog/useBlogPosts.ts

```ts
// filepath: /Users/danielwatson/Developer/FireUX/packages/fireux-core/composables/firestore/objects/Blog/useBlogPosts.ts
import { computed, type Ref } from 'vue'
import { useFirestoreRead } from '../../useFirestoreRead'
import type { BlogPost } from '../../../../models/objects/blogPost.model'
import { useBlogCreate } from './useBlogCreate'
import { useBlogDelete } from './useBlogDelete'
import { useBlogUpdate } from './useBlogUpdate'
import { useBlogPostUtils } from './useBlogPostUtils'

export async function useBlogPosts() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const blogPostsCollection = await firestoreFetchCollection<BlogPost>('blogs')

  const sortedBlogPostsCollection = computed(() => {
    const posts = blogPostsCollection.value
    return posts?.slice().sort((a: BlogPost, b: BlogPost) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  async function fetchBlogPost(
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> {
    return (await firestoreFetchDoc('blogs', slug)) as Ref<
      BlogPost | null | undefined
    >
  }

  return {
    blogPostsCollection: sortedBlogPostsCollection,
    fetchBlogPost,
    ...useBlogCreate(),
    ...useBlogDelete(),
    ...useBlogUpdate(),
    ...useBlogPostUtils(),
  }
}

```

## FILE: packages/core/fireux-core/src/runtime/composables-old/firestore/objects/Blog/useBlogs.ts

```ts
// filepath: /Users/danielwatson/Developer/FireUX/packages/fireux-core/composables/firestore/objects/Blog/useBlogPosts.ts
import { computed, type Ref } from 'vue'
import { useFirestoreManager } from '../../useFirestoreManager'
import type { BlogPost } from '../../../../models/objects/blogPost.model'
import { useBlogCreate } from './useBlogCreate'
import { useBlogDelete } from './useBlogDelete'
import { useBlogUpdate } from './useBlogUpdate'
import { useBlogValidation } from './utils/useBlogValidation'
import { useBlogFormatting } from './utils/useBlogFormatting'

export async function useBlogs() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  const blogsCollection = await firestoreFetchCollection<BlogPost>('blogs')

  const sortedBlogsCollection = computed(() => {
    const posts = blogsCollection.value
    return posts?.slice().sort((a: BlogPost, b: BlogPost) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  async function fetchBlog(
    slug: string
  ): Promise<Ref<BlogPost | null | undefined>> {
    return (await firestoreFetchDoc('blogs', slug)) as Ref<
      BlogPost | null | undefined
    >
  }

  // Child composables
  const blogCreate = useBlogCreate()
  const blogUpdate = useBlogUpdate()
  const blogDelete = useBlogDelete()
  const blogValidation = useBlogValidation()
  const blogFormatting = useBlogFormatting()

  return {
    blogsCollection: sortedBlogsCollection,
    fetchBlog,
    ...blogCreate,
    ...blogUpdate,
    ...blogDelete,
    ...blogValidation,
    ...blogFormatting,
  }
}

```

## FILE: packages/core/fireux-core/src/runtime/composables-old/firestore/objects/Blog/useBlogPostUtils.ts

```ts
// app/composables/firestore/documents/Blog/blogPostUtils.ts
import type {
  BlogPost,
  Author,
} from '../../../../models/objects/blogPost.model'

/**
 * Provides helper functions for blog post creation and editing.
 */
export function useBlogPostUtils() {
  // Generate an SEO‑friendly slug from the title
  function generateSlug(title: string): string {
    let out = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    out = out.replace(/^-+/, '')
    out = out.replace(/-+$/, '')
    return out
  }

  // Compute estimated reading time (~200 words/minute)
  function computeReadingTime(content: string): string {
    const text = content?.replace(/<[^>]*>/g, '').trim() || ''
    const minutes = Math.ceil((text.split(/\s+/).length || 0) / 200)
    return `${minutes} min`
  }

  // Get the current user identity from CoreUser (canonical)
  async function getAuthor(): Promise<Author> {
    const { useUser } = await import('../../user/useUser')
    const { user } = useUser()
    return {
      id: user.value?.id || '',
      display_name:
        user.value?.core?.display_name || user.value?.core?.email || '',
      handle: user.value?.core?.handle || '',
      avatar: user.value?.core?.avatar || '/img/default-image.png',
      email: user.value?.core?.email || '',
    }
  }

  // Default images for a blog post
  function getDefaultImages(): Pick<BlogPost, 'featuredImage' | 'socialImage'> {
    return {
      featuredImage: '/img/logo-type-dark.svg',
      socialImage: '/img/logo.png',
    }
  }

  return {
    generateSlug,
    computeReadingTime,
    getAuthor,
    getDefaultImages,
  }
}

```

## FILE: packages/core/fireux-core/src/runtime/composables-old/firestore/objects/Blog/utils/useBlogValidation.ts

```ts
import type { BlogPost } from '../../../../../models/objects/blogPost.model'

export function useBlogValidation() {
  /**
   * Validate blog post data
   */
  function validateBlog(blog: Partial<BlogPost>) {
    const errors: string[] = []

    // Required fields
    if (!blog.title?.trim()) {
      errors.push('Title is required')
    }

    if (!blog.content?.trim()) {
      errors.push('Content is required')
    }

    if (!blog.slug?.trim()) {
      errors.push('Slug is required')
    }

    // Title validation
    if (blog.title && blog.title.length > 200) {
      errors.push('Title must be 200 characters or less')
    }

    // Slug validation
    if (blog.slug && !isValidSlug(blog.slug)) {
      errors.push(
        'Slug must contain only lowercase letters, numbers, and hyphens'
      )
    }

    // Meta description validation
    if (blog.metaDescription && blog.metaDescription.length > 160) {
      errors.push('Meta description should be 160 characters or less')
    }

    // Featured image validation
    if (blog.featuredImage && !isValidUrl(blog.featuredImage)) {
      errors.push('Featured image must be a valid URL')
    }

    // Social image validation
    if (blog.socialImage && !isValidUrl(blog.socialImage)) {
      errors.push('Social image must be a valid URL')
    }

    // Tags validation
    if (blog.tags && blog.tags.length > 10) {
      errors.push('Maximum 10 tags allowed')
    }

    // Keywords validation
    if (blog.keywords && blog.keywords.length > 15) {
      errors.push('Maximum 15 keywords allowed')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate slug format
   */
  function isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug)
  }

  /**
   * Validate URL format
   */
  function isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validate reading time format
   */
  function isValidReadingTime(readingTime: string): boolean {
    const timeRegex = /^\d+\s+min$/
    return timeRegex.test(readingTime)
  }

  return {
    validateBlog,
    isValidSlug,
    isValidUrl,
    isValidReadingTime,
  }
}

```

## FILE: packages/core/fireux-core/src/runtime/composables-old/firestore/objects/Blog/utils/useBlogFormatting.ts

```ts
import type { BlogPost } from '../../../../../models/objects/blogPost.model'
import type { CoreUserDoc as CoreUser } from '../../../../../models/core/user.model'
import { useUser } from '../../../user/useUser'

export function useBlogFormatting() {
  /**
   * Format blog data before saving
   */
  function formatBlogData(blog: Partial<BlogPost>): Partial<BlogPost> {
    const formatted: Partial<BlogPost> = { ...blog }

    // Format title
    if (formatted.title) {
      formatted.title = formatted.title.trim()
    }

    // Format slug
    if (formatted.slug) {
      formatted.slug = formatSlug(formatted.slug)
    }

    // Format meta description
    if (formatted.metaDescription) {
      formatted.metaDescription = formatted.metaDescription.trim()
    }

    // Format canonical URL
    if (formatted.canonicalUrl) {
      formatted.canonicalUrl = formatUrl(formatted.canonicalUrl)
    }

    // Format arrays (remove empty strings and duplicates)
    if (formatted.tags) {
      formatted.tags = formatStringArray(formatted.tags)
    }
    if (formatted.keywords) {
      formatted.keywords = formatStringArray(formatted.keywords)
    }

    return formatted
  }

  /**
   * Generate an SEO‑friendly slug from the title
   */
  function generateSlug(title: string): string {
    let out = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    out = out.replace(/^-+/, '')
    out = out.replace(/-+$/, '')
    return out
  }

  /**
   * Format slug to ensure it's URL-friendly
   */
  function formatSlug(slug: string): string {
    let out = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
    out = out.replace(/--+/g, '-')
    out = out.replace(/^-+/, '')
    out = out.replace(/-+$/, '')
    return out
  }

  /**
   * Compute estimated reading time (~200 words/minute)
   */
  function computeReadingTime(content: string): string {
    const text = content?.replace(/<[^>]*>/g, '').trim() || ''
    const minutes = Math.ceil((text.split(/\s+/).length || 0) / 200)
    return `${minutes} min`
  }

  /**
   * Get the current user as an Author object
   */
  async function getAuthor(): Promise<
    Pick<CoreUser, 'id' | 'display_name' | 'handle' | 'avatar' | 'email'>
  > {
    const { user } = useUser()
    return {
      id: user.value?.id || '',
      display_name:
        user.value?.core?.display_name || user.value?.core?.email || '',
      handle: user.value?.core?.handle || '',
      avatar: user.value?.core?.avatar || '/img/default-image.png',
      email: user.value?.core?.email || '',
    }
  }

  /**
   * Default images for a blog post
   */
  function getDefaultImages(): Pick<BlogPost, 'featuredImage' | 'socialImage'> {
    return {
      featuredImage: '/img/logo-type-dark.svg',
      socialImage: '/img/logo.png',
    }
  }

  /**
   * Format blog title for display
   */
  function formatBlogTitle(blog: BlogPost): string {
    return blog.title || 'Untitled Post'
  }

  /**
   * Format blog excerpt from content
   */
  function formatBlogExcerpt(blog: BlogPost, maxLength: number = 150): string {
    const plainText = blog.content?.replace(/<[^>]*>/g, '').trim() || ''
    if (plainText.length <= maxLength) return plainText

    return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
  }

  /**
   * Format reading time for display
   */
  function formatReadingTime(blog: BlogPost): string {
    return blog.readingTime || computeReadingTime(blog.content || '')
  }

  /**
   * Format publication date
   */
  function formatPublicationDate(blog: BlogPost): string {
    if (!blog.created_at) return 'Unknown date'

    try {
      const date = new Date(blog.created_at)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Format tags for display
   */
  function formatTags(blog: BlogPost): string[] {
    return blog.tags?.filter((tag) => tag?.trim()) || []
  }

  /**
   * Helper function to format URL
   */
  function formatUrl(url: string): string {
    const trimmed = url.trim()
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  /**
   * Helper function to format string arrays
   */
  function formatStringArray(arr: string[]): string[] {
    return [
      ...new Set(arr.filter((item) => item?.trim()).map((item) => item.trim())),
    ]
  }

  return {
    formatBlogData,
    generateSlug,
    formatSlug,
    computeReadingTime,
    getAuthor,
    getDefaultImages,
    formatBlogTitle,
    formatBlogExcerpt,
    formatReadingTime,
    formatPublicationDate,
    formatTags,
  }
}

```
