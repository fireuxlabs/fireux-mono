export const BLOG_DIRECTORY_PAGE_SIZE = 24
export const BLOG_DIRECTORY_MAX_PAGE_SIZE = 48
export const BLOG_DIRECTORY_SCAN_BATCH_SIZE = 48
export const BLOG_DIRECTORY_MAX_SCAN_SIZE = 240

export type BlogDetail = {
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
  featuredImageAlt: string
  socialImage: string
  readingTime: string
  cta_link: string
  cta_text: string
  type: 'article' | 'product'
  product_id: string
}

export type BlogDirectoryEntry = Omit<BlogDetail, 'content'> & {
  excerpt: string
}

export type BlogDirectoryPage = {
  items: BlogDirectoryEntry[]
  nextCursor?: string
}

export type BlogDetailResponse = {
  item: BlogDetail
}
