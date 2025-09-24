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
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^(?:-)|(?:-)$/g, '')
  }

  // Compute estimated reading time (~200 words/minute)
  function computeReadingTime(content: string): string {
    const text = content?.replace(/<[^>]*>/g, '').trim() || ''
    const minutes = Math.ceil((text.split(/\s+/).length || 0) / 200)
    return `${minutes} min`
  }

  // Get the current user identity from CoreUser (canonical)
  async function getAuthor(): Promise<Author> {
    const { user } = useUser()
    return {
      id: user.value?.id || '',
      display_name:
        user.value?.core?.display_name || user.value?.core?.email || '',
      handle: user.value?.core?.handle || '',
      avatar: user.value?.core?.avatar || '/img/default-avatar.png',
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
