import { useStorage } from '@vueuse/core'
import { onMounted } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { useBlogPostUtils } from './useBlogPostUtils.ts'
import type { BlogPostEntry } from '../../../../models/objects/blogPost.model.ts'

type BlogPostPayload = BlogPostEntry & {
  created_at: string
  updated_at: string
  appId: string
}

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

/**
 * Manages local draft state for the blog post authoring flow.
 */
export function useCreateBlogPostState() {
  const { appId: tenantId } = useFireUXConfig()
  const { getAuthor, getDefaultImages } = useBlogPostUtils()

  const blogPost = useStorage<BlogPostEntry>('createBlogPost', defaultBlogPost)
  const featuredImageData = useStorage<string>(
    'createBlogFeaturedImageData',
    ''
  )
  const socialImageData = useStorage<string>('createBlogSocialImageData', '')

  onMounted(async () => {
    if (!blogPost.value.author.id) {
      blogPost.value.author = await getAuthor()
    }

    if (!blogPost.value.featuredImage || !blogPost.value.socialImage) {
      const defaults = getDefaultImages()
      blogPost.value.featuredImage ||= defaults.featuredImage
      blogPost.value.socialImage ||= defaults.socialImage
    }
  })

  function resetCreateBlogPostState() {
    const defaults = getDefaultImages()

    blogPost.value = {
      title: '',
      content: '',
      metaDescription: '',
      slug: '',
      author: blogPost.value.author,
      keywords: [],
      tags: [],
      canonicalUrl: '',
      featuredImage: defaults.featuredImage,
      socialImage: defaults.socialImage,
      readingTime: '',
      cta_link: '',
      cta_text: '',
      type: 'article',
      product_id: undefined,
    }

    featuredImageData.value = ''
    socialImageData.value = ''
  }

  function getBlogPostPayload(): BlogPostPayload {
    const now = new Date().toISOString()
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
