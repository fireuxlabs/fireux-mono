import type { BlogPost } from '../../../../../models/blogPost.model'
import type { Author } from '../../../../../models/appUser.model'
import { useAppUser } from '../../../AppUser/useAppUser'

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
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Format slug to ensure it's URL-friendly
   */
  function formatSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
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
  function getAuthor(): Author {
    const { appUser } = useAppUser()
    return {
      display_name: appUser.value?.display_name || '',
      handle: appUser.value?.handle || '',
      avatar: appUser.value?.avatar || '',
      id: appUser.value?.id || '',
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
