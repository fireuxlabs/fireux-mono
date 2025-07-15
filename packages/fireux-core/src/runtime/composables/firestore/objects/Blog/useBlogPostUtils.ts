// app/composables/firestore/documents/Blog/blogPostUtils.ts
import { useAppUser } from '../../AppUser/useAppUser'
import type { BlogPost } from '../../../../models/objects/blogPost.model'
import type { Author } from '../../../../models/core/appUser.model'

/**
 * Provides helper functions for blog post creation and editing.
 */
export function useBlogPostUtils() {
  // Generate an SEO‑friendly slug from the title
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Compute estimated reading time (~200 words/minute)
  function computeReadingTime(content: string): string {
    const text = content?.replace(/<[^>]*>/g, '').trim() || ''
    const minutes = Math.ceil((text.split(/\s+/).length || 0) / 200)
    return `${minutes} min`
  }

  // Get the current user as an Author object
  async function getAuthor(): Promise<Author> {
    const { appUser } = await useAppUser()
    return {
      display_name: appUser.value?.display_name || '',
      handle: appUser.value?.handle || '',
      avatar: appUser.value?.avatar || '',
      slug: appUser.value?.slug || '',
      id: appUser.value?.uid || '',
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
