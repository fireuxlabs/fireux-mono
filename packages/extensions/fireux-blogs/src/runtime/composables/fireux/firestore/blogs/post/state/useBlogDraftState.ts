import { useStorage } from '@vueuse/core'
import { onMounted } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useBlogUtils } from '../../../objects/Blog/utils/useBlogUtils.ts'
import type { BlogPostEntry } from '#fireux-blogs/models/blog/post.model.ts'

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
export function useBlogDraftState() {
  const { appId: tenantId } = useFireUXConfig()
  const { getAuthor, getDefaultImages } = useBlogUtils()

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

    const defaults = getDefaultImages()
    // Backfill stored images to app-branded defaults.
    if (!blogPost.value.featuredImage) {
      blogPost.value.featuredImage = defaults.featuredImage
    }
    if (!blogPost.value.socialImage) {
      blogPost.value.socialImage = defaults.socialImage
    }

    // Ensure previews show defaults when nothing uploaded yet.
    if (!featuredImageData.value) {
      featuredImageData.value = defaults.featuredImage
    }
    if (!socialImageData.value) {
      socialImageData.value = defaults.socialImage
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
