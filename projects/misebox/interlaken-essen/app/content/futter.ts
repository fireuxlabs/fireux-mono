import type { BlogPostFeedReference } from 'fireux-blogs/runtime/models/blogPost.model'

type FutterCard = {
  id: string
  label: string
}

export type FutterEvent = FutterCard & {
  blogPost?: never
  title: string
  body: string
  image: string
  imageAlt: string
}

export type FutterBlogPost = FutterCard & {
  blogPost: BlogPostFeedReference
}

export type FutterPost = FutterEvent | FutterBlogPost

export const futterPosts: FutterPost[] = [
  {
    id: 'wo-sind-die-chuehlschraenke',
    label: 'Us dr Region',
    blogPost: {
      kind: 'blog-post',
      slug: 'wo-sind-die-chuehlschraenke',
    },
  },
  {
    id: 'interlaken-essen-isch-live',
    title: 'Interlaken Essen isch live!',
    body: 'Dr lokali Marktplatz für Milch, Chäs, Honig und meh us üser Region.',
    image: '/img/app/social-launch.png',
    imageAlt:
      'Illustrierts Interlaken-Panorama mit Milch, Chäs, em Geissbock und em Text Interlaken Essen isch live.',
    label: 'Willkomme',
  },
]
