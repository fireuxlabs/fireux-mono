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
