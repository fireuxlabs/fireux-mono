import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { BlogPost } from '../../../../../../models/blogPost.model'

export namespace BlogCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    subtitle: string

    title: string
    excerpt: string
    author: string

    // Secondary media (empty string means unset)
    imageUrl: string

    // Status/label chips
    badges: string[]
  }
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function ellipsis(text: string, limit = 180): string {
  return text.length > limit ? `${text.slice(0, limit)}…` : text
}

export function useBlogInterface() {
  function map(post: BlogPost): BlogCard.Card {
    const content = safeString(post.content)
    const excerpt = ellipsis(stripHtml(content), 180)

    const author = safeString((post.author as any)?.display_name)
    const imageUrl = safeString(post.featuredImage) || safeString(post.socialImage)
    const id = safeString(post.slug).trim()
    const title = safeString(post.title)

    return {
      id,
      to: id ? `/blog/${id}` : '',

      avatarUrl: imageUrl,
      subtitle: author,

      title,
      excerpt,
      author,

      imageUrl,
      badges: [],
    }
  }

  function card(target?: BlogPost | null | undefined): BlogCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function searchText(post: BlogPost): string {
    const title = safeString(post.title)
    const slug = safeString(post.slug)
    const author = safeString((post.author as any)?.display_name)
    return `${title} ${slug} ${author}`.trim().toLowerCase()
  }

  return { card, searchText }
}
