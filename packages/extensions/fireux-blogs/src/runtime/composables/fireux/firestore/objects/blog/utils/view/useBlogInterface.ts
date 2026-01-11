import type { BlogPost } from '../../../../../../../models/objects/blogPost.model'

export namespace BlogCard {
  export type Card = {
    id: string
    to: string

    title: string
    excerpt: string
    author: string

    imageUrl: string
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
    const excerpt = ellipsis(stripHtml(post.content), 180)

    return {
      id: post.slug,
      to: `/blog/${post.slug}`,

      title: post.title,
      excerpt,
      author: post.author?.display_name || 'Unknown',

      imageUrl: post.featuredImage || post.socialImage || '',
      badges: [],
    }
  }

  function card(target?: BlogPost | null | undefined): BlogCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(post: BlogPost): string {
    return `${post.title} ${post.slug} ${post.author?.display_name || ''}`
      .toLowerCase()
  }

  return { card, searchText }
}
