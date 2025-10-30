import type {
  BlogPost,
  Author,
} from '../../../../models/objects/blogPost.model.ts'

function generateSlug(title: string): string {
  let out = title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
  out = out.replaceAll(/^-+/, '')
  out = out.replaceAll(/-+$/, '')
  return out
}

function computeReadingTime(content: string): string {
  const text = content?.replaceAll(/<[^>]*>/g, '').trim() || ''
  const minutes = Math.ceil((text.split(/\s+/).length || 0) / 200)
  return `${minutes} min`
}

async function getAuthor(): Promise<Author> {
  const { useUser } = await import('../../core/user/useUser')
  const { user } = useUser()
  return {
    id: user.value?.id || '',
    display_name: user.value?.display_name || user.value?.email || '',
    handle: user.value?.handle || '',
    avatar: user.value?.avatar || '/img/default-image.png',
    email: user.value?.email || '',
  }
}

function getDefaultImages(): Pick<BlogPost, 'featuredImage' | 'socialImage'> {
  return {
    featuredImage: '/img/logo-type-dark.svg',
    socialImage: '/img/logo.png',
  }
}

/**
 * Helper utilities shared across blog authoring flows.
 */
export function useBlogPostUtils() {
  return {
    generateSlug,
    computeReadingTime,
    getAuthor,
    getDefaultImages,
  }
}
