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
  const { useUser } = await import(
    'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
  )
  const { currentUser } = useUser()
  const user = currentUser.value
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
    featuredImage: '/img/core/brand/wordmark-dark.png',
    socialImage: '/img/core/brand/logo.png',
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
