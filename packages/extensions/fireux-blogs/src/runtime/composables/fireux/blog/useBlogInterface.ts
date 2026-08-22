import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type {
  BlogDirectoryEntry,
  BlogDetail,
} from '../../../models/blog-directory.model'
import type { BlogPost } from '../../../utils/blog-post'

type BlogViewPost = BlogPost | BlogDirectoryEntry | BlogDetail

export namespace BlogCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string
    imageUrl: string
    imageAlt: string

    // Primary display fields
    subtitle: string

    title: string
    summary: string
    status: string
    excerpt: string
    author: string
    authorAvatarUrl: string
    authorHandle: string
    readingTime: string
    tags: string[]
    type: 'article' | 'product'

    // Status/label chips
    badges: string[]
  }
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function ellipsis(text: string, limit = 180): string {
  return text.length > limit ? `${text.slice(0, limit)}…` : text
}

export function useBlogInterface() {
  type BlogPill = BlogCard.Card
  type BlogCell = BlogCard.Card
  type BlogPreview = BlogCard.Card
  type BlogProfile = BlogCard.Card

  function map(post: BlogViewPost): BlogCard.Card {
    const content = 'content' in post ? safeString(post.content) : ''
    const storedExcerpt = 'excerpt' in post ? safeString(post.excerpt) : ''
    const excerpt = storedExcerpt || ellipsis(stripHtml(content), 180)

    const author = safeString((post.author as any)?.display_name)
    const authorAvatarUrl = safeString((post.author as any)?.avatar)
    const authorHandle = safeString((post.author as any)?.handle)
    const imageUrl =
      safeString(post.featuredImage) || safeString(post.socialImage)
    const imageAlt = safeString(post.featuredImageAlt) || safeString(post.title)
    const id = safeString(post.slug).trim()
    const title = safeString(post.title)
    const readingTime = safeString(post.readingTime)
    const type = post.type === 'product' ? 'product' : 'article'
    const tags = Array.from(
      new Set(
        (Array.isArray(post.tags) ? post.tags : [])
          .map((tag) => safeString(tag))
          .filter(Boolean)
      )
    )
    const typeLabel = type === 'product' ? 'Product note' : 'Article'
    const summary = safeString(post.metaDescription) || excerpt

    return {
      id,
      to: id ? `/blog/${id}` : '',

      avatarUrl: authorAvatarUrl,
      imageUrl,
      imageAlt,
      subtitle: [author, readingTime].filter(Boolean).join(' · '),

      title,
      summary,
      status: type,
      excerpt,
      author,
      authorAvatarUrl,
      authorHandle,
      readingTime,
      tags,
      type,
      badges: tags.length ? tags.slice(0, 3) : [typeLabel],
    }
  }

  function buildInterface(
    target?: BlogViewPost | null | undefined
  ): BlogCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: BlogViewPost | null | undefined): BlogPill | null {
    return buildInterface(target)
  }

  function cell(target?: BlogViewPost | null | undefined): BlogCell | null {
    return buildInterface(target)
  }

  function preview(
    target?: BlogViewPost | null | undefined
  ): BlogPreview | null {
    return buildInterface(target)
  }

  function profile(
    target?: BlogViewPost | null | undefined
  ): BlogProfile | null {
    return buildInterface(target)
  }

  return { interface: toInterface, pill, cell, preview, profile }
}
