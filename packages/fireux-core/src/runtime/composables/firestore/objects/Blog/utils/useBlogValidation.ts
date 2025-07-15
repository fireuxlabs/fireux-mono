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
