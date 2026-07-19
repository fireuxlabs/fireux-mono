import { useStorage } from '@vueuse/core'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { onMounted } from 'vue'
import type { BlogPostCreateInput } from '../../../../models/blogPost.model'
import { useBlogUtils } from '../../firestore/blog/utils/useBlogUtils'

const defaultBlogPost: BlogPostCreateInput = {
  id: '',
  source_app_id: '',
  source_ecosystem_id: '',
  owner_type: 'app',
  owner_id: '',
  visibility: 'app',
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
  product_id: '',
}

/**
 * Manages local draft state for the blog post authoring flow.
 */
export function useBlogDraftState() {
  const { appId: tenantId } = useFireUXConfig()
  const { currentUser } = useUser()
  const { getAuthor, getDefaultImages } = useBlogUtils()

  const blogPost = useStorage<BlogPostCreateInput>('createBlogPost', defaultBlogPost)
  const featuredImageData = useStorage<string>(
    'createBlogFeaturedImageData',
    ''
  )
  const socialImageData = useStorage<string>('createBlogSocialImageData', '')

  onMounted(() => {
    if (!blogPost.value.author.id) {
      blogPost.value.author = getAuthor(currentUser.value)
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
      id: '',
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
      product_id: '',
      source_app_id: tenantId,
      source_ecosystem_id: useFireUXConfig().ecosystemId || '',
      owner_type: 'app',
      owner_id: tenantId,
      visibility: 'app',
    }

    featuredImageData.value = ''
    socialImageData.value = ''
  }

  function getBlogPostPayload(): BlogPostCreateInput {
    const ecosystemId = useFireUXConfig().ecosystemId || ''
    return {
      ...blogPost.value,
      source_app_id: tenantId,
      source_ecosystem_id: ecosystemId,
      owner_type: 'app',
      owner_id: tenantId || ecosystemId,
      visibility: blogPost.value.visibility || 'app',
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
