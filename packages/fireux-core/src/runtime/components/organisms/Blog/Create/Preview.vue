<template>
  <article class="preview-card">
    {{ post }}
    <!-- TITLE -->
    <h1>
      <span v-if="post.title">{{ post.title }}</span>
      <em v-else class="warning">Missing title</em>
    </h1>

    <!-- SLUG -->
    <p>
      <strong>Slug:</strong>
      <span v-if="post.slug">{{ post.slug }}</span>
      <em v-else class="warning">Missing slug</em>
    </p>

    <!-- CREATED AT -->
    <p>
      <strong>Created at:</strong>
      <span v-if="createdAt">{{ createdAt }}</span>
      <em v-else class="warning">Missing created_at</em>
    </p>

    <!-- UPDATED AT -->
    <p>
      <strong>Updated at:</strong>
      <span v-if="updatedAt">{{ updatedAt }}</span>
      <em v-else class="warning">Missing updated_at</em>
    </p>

    <!-- AUTHOR -->
    <p>
      <strong>Author:</strong>
      <span v-if="post.author?.display_name">
        {{ post.author.display_name }}
      </span>
      <em v-else class="warning">Missing author</em>
    </p>

    <!-- READING TIME -->
    <p>
      <strong>Reading time:</strong>
      <span v-if="post.readingTime">{{ post.readingTime }}</span>
      <em v-else class="warning">Missing readingTime</em>
    </p>

    <!-- FEATURED IMAGE -->
    <div v-if="featuredData" class="preview-image">
      <img :src="featuredData" alt="Featured image preview" />
    </div>
    <em v-else class="warning">Missing featured image</em>

    <!-- SOCIAL IMAGE -->
    <div v-if="socialData" class="preview-image">
      <img :src="socialData" alt="Social image preview" />
    </div>
    <em v-else class="warning">Missing social image</em>

    <!-- TYPE -->
    <p>
      <strong>Type:</strong>
      <span v-if="post.type">{{ post.type }}</span>
      <em v-else class="warning">Missing type</em>
    </p>

    <!-- TENANT ID -->
    <p>
      <strong>Tenant ID:</strong>
      <span v-if="tenantId">{{ tenantId }}</span>
      <em v-else class="warning">Missing tenantId</em>
    </p>

    <!-- META DESCRIPTION -->
    <p>
      <strong>Meta Description:</strong>
      <span v-if="post.metaDescription">{{ post.metaDescription }}</span>
      <em v-else class="warning">Missing metaDescription</em>

      <!-- CONTENT -->
      <!-- eslint-disable-next-line vue/no-v-html -->
    </p>

    <section v-html="sanitizedContent" />
    <em v-if="!post.content" class="warning">Missing content</em>

    <!-- KEYWORDS -->
    <div>
      <strong>Keywords:</strong>
      <ul v-if="post.keywords.length">
        <li v-for="kw in post.keywords" :key="kw">{{ kw }}</li>
      </ul>
      <em v-else class="warning">No keywords provided</em>
    </div>

    <!-- TAGS -->
    <div>
      <strong>Tags:</strong>
      <ul v-if="post.tags.length">
        <li v-for="tag in post.tags" :key="tag">{{ tag }}</li>
      </ul>
      <em v-else class="warning">No tags provided</em>
    </div>

    <!-- CANONICAL URL -->
    <p>
      <strong>Canonical URL:</strong>
      <a
        v-if="post.canonicalUrl"
        :href="post.canonicalUrl"
        target="_blank"
        rel="noopener"
      >
        {{ post.canonicalUrl }}
      </a>
      <em v-else class="warning">Missing canonicalUrl</em>
    </p>

    <!-- CALL TO ACTION LINK -->
    <p>
      <strong>CTA link:</strong>
      <a
        v-if="post.cta_link"
        :href="post.cta_link"
        target="_blank"
        rel="noopener"
      >
        {{ post.cta_link }}
      </a>
      <em v-else class="warning">Missing cta_link</em>
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useState } from 'nuxt/app'
import DOMPurify from 'dompurify'
import type { BlogPost } from '../../../../models/blogPost.model'
import { useFireUXConfig } from '../../../../composables/FireUXConfig'

// Use full BlogPost so all fields exist
const post = useState<BlogPost>('createBlogPost')

// Pull the two images from their own state keys (Data-URLs)
const featuredData = useState<string>('createBlogFeaturedImage')
const socialData = useState<string>('createBlogSocialImage')

// Timestamps for display-only
const now = new Date().toISOString()
const createdAt = now
const updatedAt = now

// App ID from runtime config
const config = useFireUXConfig()
const tenantId = config.tenantId

// Sanitize the HTML before injecting
const sanitizedContent = computed(() =>
  DOMPurify.sanitize(post.value.content || '')
)
</script>
