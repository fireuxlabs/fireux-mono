<template>
  <section class="market-feed" aria-labelledby="market-feed-title">
    <div class="market-feed__heading">
      <p class="market-eyebrow">{{ copy('feed_eyebrow') }}</p>
      <h2 id="market-feed-title">{{ copy('feed') }}</h2>
    </div>

    <article
      v-for="post in resolvedFutterPosts"
      :key="post.id"
      class="market-feed-post"
    >
      <img
        :src="post.image"
        :alt="post.imageAlt"
        class="market-feed-post__image"
      >
      <div class="market-feed-post__body">
        <span class="market-feed-post__label">{{ post.label }}</span>
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
        <NuxtLink
          v-if="post.to"
          :to="post.to"
          class="market-feed-post__link"
        >
          {{ copy('feed_read_post') }}
        </NuxtLink>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { usePublicBlogCollection } from 'fireux-blogs/runtime/composables/fireux/blog/public/usePublicBlogCollection'
import type { PublicBlogPostProjection } from 'fireux-blogs/runtime/models/blogPost-public.model'
import { futterPosts } from '../../content/futter'

const { copy, language } = useInterlakenCopy()
const { collection: blogPosts } = usePublicBlogCollection()
const blogsBySlug = computed(
  () => new Map<string, PublicBlogPostProjection>(
    (blogPosts.value as PublicBlogPostProjection[]).map(
      (post: PublicBlogPostProjection) => [post.slug, post]
    )
  )
)
const stripHtml = (value: string) =>
  value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const resolvedFutterPosts = computed(() =>
  futterPosts.flatMap(post => {
    if (!('blogPost' in post) || !post.blogPost) {
      return [{
        id: post.id,
        label: copy(post.labelKey),
        title: copy(post.titleKey),
        body: copy(post.bodyKey),
        image: post.imageByLanguage[language.value],
        imageAlt: copy(post.imageAltKey),
        to: '',
      }]
    }
    const blogPost = blogsBySlug.value.get(post.blogPost.slug)
    if (!blogPost) return []
    return [{
      id: post.id,
      label: copy(post.labelKey),
      title: blogPost.title,
      body: blogPost.metaDescription || stripHtml(blogPost.content),
      image: blogPost.featuredImage,
      imageAlt: blogPost.title,
      to: `/blog/${blogPost.slug}`,
    }]
  })
)
</script>
