import type { BlogAuthor } from '../../../../../models/blogPost.model'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'

function normalizeBlogSlug(title: string): string {
  return normalizeSlug(title)
}

function computeReadingTime(content: string): string {
  const text = content?.replaceAll(/<[^>]*>/g, '').trim() || ''
  const minutes = Math.ceil((text.split(/\s+/).length || 0) / 200)
  return `${minutes} min`
}

function getAuthor(
  user?: {
    id?: string
    display_name?: string
    handle?: string
    avatar?: string
    email?: string
  } | null
): BlogAuthor {
  return {
    id: user?.id || '',
    display_name: user?.display_name || '',
    handle: user?.handle || '',
    avatar: user?.avatar || '/img/core/defaults/default-thumbnail.png',
    email: user?.email || '',
  }
}

function getDefaultImages(): { featuredImage: string; socialImage: string } {
  return {
    featuredImage: '/img/app/wordmark-dark.png',
    socialImage: '/img/app/logo.png',
  }
}

/**
 * Helper utilities shared across blog authoring flows.
 */
export function useBlogUtils() {
  return {
    normalizeBlogSlug,
    computeReadingTime,
    getAuthor,
    getDefaultImages,
  }
}
