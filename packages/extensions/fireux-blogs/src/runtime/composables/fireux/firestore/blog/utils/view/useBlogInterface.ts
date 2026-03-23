import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { BlogPost } from '../../../../../../models/blogPost.model'

export namespace BlogCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string
    imageUrl: string

    // Primary display fields
    subtitle: string

    title: string
    summary: string
    status: string
    excerpt: string
    author: string

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
  type BlogPill = BlogCard.Card
  type BlogCell = BlogCard.Card
  type BlogPreview = BlogCard.Card
  type BlogProfile = BlogCard.Card

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
      imageUrl,
      subtitle: author,

      title,
      summary: excerpt,
      status: '',
      excerpt,
      author,
      badges: [],
    }
  }

  function buildInterface(target?: BlogPost | null | undefined): BlogCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: BlogPost | null | undefined): BlogPill | null {
    return buildInterface(target)
  }

  function cell(target?: BlogPost | null | undefined): BlogCell | null {
    return buildInterface(target)
  }

  function preview(target?: BlogPost | null | undefined): BlogPreview | null {
    return buildInterface(target)
  }

  function profile(target?: BlogPost | null | undefined): BlogProfile | null {
    return buildInterface(target)
  }

  function searchText(post: BlogPost): string {
    const title = safeString(post.title)
    const slug = safeString(post.slug)
    const author = safeString((post.author as any)?.display_name)
    return `${title} ${slug} ${author}`.trim().toLowerCase()
  }

  return { interface: buildInterface, pill, cell, preview, profile, searchText }
}
