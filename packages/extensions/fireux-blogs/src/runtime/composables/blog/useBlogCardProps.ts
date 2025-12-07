import type { BlogPost } from '../../models/objects/blogPost.model'

export namespace BlogCard {
  export interface Base {
    to: string
    title: string
    excerpt: string
    author: string
    readingTime?: string
    date?: string
    image?: string
    badge?: string
  }

  export interface Teaser extends Base {
    layout: 'teaser'
  }

  export interface Cell extends Base {
    layout: 'cell'
  }
}

function stripHtml(input: string): string {
  return (input || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function ellipsis(text: string, limit = 160): string {
  if (!text) return ''
  return text.length > limit ? `${text.slice(0, limit)}…` : text
}

export function useBlogCardProps() {
  const base = (post: BlogPost): BlogCard.Base => {
    const text = stripHtml(post.content)
    return {
      to: `/blog/${post.slug}`,
      title: post.title,
      excerpt: ellipsis(text, 180),
      author: post.author?.display_name || 'Unknown author',
      readingTime: post.readingTime?.replace(' min', '') || undefined,
      date: post.created_at,
      image: post.featuredImage || post.socialImage || undefined,
      badge: post.type === 'product' ? 'Product' : undefined,
    }
  }

  const teaser = (post: BlogPost): BlogCard.Teaser => ({
    layout: 'teaser',
    ...base(post),
  })

  const cell = (post: BlogPost): BlogCard.Cell => ({
    layout: 'cell',
    ...base(post),
  })

  return { teaser, cell }
}
