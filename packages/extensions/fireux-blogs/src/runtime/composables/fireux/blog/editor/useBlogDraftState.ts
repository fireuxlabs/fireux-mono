import { useStorage } from '@vueuse/core'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { onMounted } from 'vue'
import type { BlogPostCreateInput } from '../../../../utils/blog-post'
import { useBlogUtils } from '../../firestore/blog/utils/useBlogUtils'

const defaultBlogPost: BlogPostCreateInput = {
  source_app_id: '',
  visibility: 'app',
  publication_scope: 'app',
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
  featuredImageAlt: '',
  socialImage: '',
  readingTime: '',
  cta_link: '',
  cta_text: '',
  type: 'article',
  product_id: '',
  editorial_review: {
    source_kind: 'human',
    privacy_reviewed: false,
    facts_reviewed: false,
    names_approved: false,
  },
  sproochli: undefined,
}

/**
 * Manages local draft state for the blog post authoring flow.
 */
export function useBlogDraftState() {
  const { appId: tenantId } = useFireUXConfig()
  const { currentUser } = useUserSession()
  const { getAuthor, getDefaultImages } = useBlogUtils()

  const blogPost = useStorage<BlogPostCreateInput>(
    'createBlogPost',
    defaultBlogPost
  )
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
      title: '',
      content: '',
      metaDescription: '',
      slug: '',
      author: blogPost.value.author,
      keywords: [],
      tags: [],
      canonicalUrl: '',
      featuredImage: defaults.featuredImage,
      featuredImageAlt: '',
      socialImage: defaults.socialImage,
      readingTime: '',
      cta_link: '',
      cta_text: '',
      type: 'article',
      product_id: '',
      editorial_review: {
        source_kind: 'human',
        privacy_reviewed: false,
        facts_reviewed: false,
        names_approved: false,
      },
      sproochli: undefined,
      source_app_id: tenantId,
      visibility: 'app',
      publication_scope: 'app',
    }

    featuredImageData.value = ''
    socialImageData.value = ''
  }

  function getBlogPostPayload(): BlogPostCreateInput {
    return {
      ...blogPost.value,
      source_app_id: tenantId,
      visibility: blogPost.value.visibility || 'app',
      publication_scope: blogPost.value.publication_scope || 'app',
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
