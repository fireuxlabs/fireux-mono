import type { Author, BlogPost } from '../../../../../../models/objects/blogPost.model'

function generateSlug(title: string): string {
  let out = title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
  out = out.replaceAll(/^-+/g, '')
  out = out.replaceAll(/-+$/g, '')
  return out
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
): Author {
  return {
    id: user?.id || '',
    display_name: user?.display_name || user?.email || '',
    handle: user?.handle || '',
    avatar: user?.avatar || '/img/core/defaults/default-thumbnail.png',
    email: user?.email || '',
  }
}

function getDefaultImages(): Pick<BlogPost, 'featuredImage' | 'socialImage'> {
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
    generateSlug,
    computeReadingTime,
    getAuthor,
    getDefaultImages,
  }
}
