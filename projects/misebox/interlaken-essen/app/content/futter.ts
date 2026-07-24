import type { BlogPostFeedReference } from 'fireux-blogs/runtime/models/blogPost.model'
import type { InterlakenPublicCopyKey } from './sproochli-copy-public'
import type { InterlakenSiteLanguage } from './sproochli-site'

type FutterCard = {
  id: string
  labelKey: InterlakenPublicCopyKey
}

export type FutterEvent = FutterCard & {
  blogPost?: never
  titleKey: InterlakenPublicCopyKey
  bodyKey: InterlakenPublicCopyKey
  imageByLanguage: Record<InterlakenSiteLanguage, string>
  imageAltKey: InterlakenPublicCopyKey
}

export type FutterBlogPost = FutterCard & {
  blogPost: BlogPostFeedReference
}

export type FutterPost = FutterEvent | FutterBlogPost

export const futterPosts: FutterPost[] = [
  {
    id: 'wo-sind-die-chuehlschraenke',
    labelKey: 'from_region',
    blogPost: {
      kind: 'blog-post',
      slug: 'wo-sind-die-chuehlschraenke',
    },
  },
  {
    id: 'interlaken-essen-isch-live',
    titleKey: 'feed_launch_title',
    bodyKey: 'feed_launch_body',
    imageByLanguage: {
      gsw: '/img/app/social-launch.png',
      en: '/img/app/social-launch-en.png',
    },
    imageAltKey: 'feed_launch_image_alt',
    labelKey: 'feed_welcome_label',
  },
]
