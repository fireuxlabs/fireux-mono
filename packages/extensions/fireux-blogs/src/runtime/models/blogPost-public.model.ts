export const PUBLIC_BLOG_INDEX_PAGE_SIZE = 24
export const PUBLIC_BLOG_INDEX_MAX_PAGE_SIZE = 48
export const PUBLIC_BLOG_INDEX_SCAN_BATCH_SIZE = 48
export const PUBLIC_BLOG_INDEX_MAX_SCAN_SIZE = 240

export type PublicBlogPostProjection = {
  id: string
  slug: string
  visibility: 'public'
  language: string
  available_languages: string[]
  title: string
  content: string
  metaDescription: string
  author: {
    display_name: string
    avatar?: string
    handle?: string
  }
  keywords: string[]
  tags: string[]
  canonicalUrl: string
  featuredImage: string
  socialImage: string
  readingTime: string
  cta_link: string
  cta_text: string
  type: 'article' | 'product'
  product_id: string
}

export type PublicBlogPostIndexProjection = Omit<
  PublicBlogPostProjection,
  'content'
> & {
  excerpt: string
}

export type PublicBlogIndexPage = {
  items: PublicBlogPostIndexProjection[]
  nextCursor?: string
}

export type PublicBlogDetailResponse = {
  item: PublicBlogPostProjection
}
