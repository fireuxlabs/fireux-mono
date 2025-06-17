<template>
  <article class="preview-card">
    {{ blogPost }}
    <!-- TITLE -->
    <h1>
      <span v-if="blogPost.title">{{ blogPost.title }}</span>
      <em v-else class="warning">Missing title</em>
    </h1>

    <!-- SLUG -->
    <p>
      <strong>Slug:</strong>
      <span v-if="blogPost.slug">{{ blogPost.slug }}</span>
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
      <span v-if="blogPost.author?.display_name">
        {{ blogPost.author.display_name }}
      </span>
      <em v-else class="warning">Missing author</em>
    </p>

    <!-- READING TIME -->
    <p>
      <strong>Reading time:</strong>
      <span v-if="blogPost.readingTime">{{ blogPost.readingTime }}</span>
      <em v-else class="warning">Missing readingTime</em>
    </p>

    <!-- FEATURED IMAGE -->
    <div v-if="featuredImageData" class="preview-image">
      <img :src="featuredImageData" alt="Featured image preview" />
    </div>
    <em v-else class="warning">Missing featured image</em>

    <!-- SOCIAL IMAGE -->
    <div v-if="socialImageData" class="preview-image">
      <img :src="socialImageData" alt="Social image preview" />
    </div>
    <em v-else class="warning">Missing social image</em>

    <!-- TYPE -->
    <p>
      <strong>Type:</strong>
      <span v-if="blogPost.type">{{ blogPost.type }}</span>
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
      <span v-if="blogPost.metaDescription">{{
        blogPost.metaDescription
      }}</span>
      <em v-else class="warning">Missing metaDescription</em>

      <!-- CONTENT -->
      <!-- eslint-disable-next-line vue/no-v-html -->
    </p>

    <section v-html="sanitizedContent" />
    <em v-if="!blogPost.content" class="warning">Missing content</em>

    <!-- KEYWORDS -->
    <div>
      <strong>Keywords:</strong>
      <ul v-if="blogPost.keywords.length">
        <li v-for="kw in blogPost.keywords" :key="kw">{{ kw }}</li>
      </ul>
      <em v-else class="warning">No keywords provided</em>
    </div>

    <!-- TAGS -->
    <div>
      <strong>Tags:</strong>
      <ul v-if="blogPost.tags.length">
        <li v-for="tag in blogPost.tags" :key="tag">{{ tag }}</li>
      </ul>
      <em v-else class="warning">No tags provided</em>
    </div>

    <!-- CANONICAL URL -->
    <p>
      <strong>Canonical URL:</strong>
      <a
        v-if="blogPost.canonicalUrl"
        :href="blogPost.canonicalUrl"
        target="_blank"
        rel="noopener"
      >
        {{ blogPost.canonicalUrl }}
      </a>
      <em v-else class="warning">Missing canonicalUrl</em>
    </p>

    <!-- CALL TO ACTION LINK -->
    <p>
      <strong>CTA link:</strong>
      <a
        v-if="blogPost.cta_link"
        :href="blogPost.cta_link"
        target="_blank"
        rel="noopener"
      >
        {{ blogPost.cta_link }}
      </a>
      <em v-else class="warning">Missing cta_link</em>
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { useCreateBlogPostState } from '../../../../composables/firestore/objects/Blog/useCreateBlogPostState'
import { useFireUXConfig } from '../../../../composables/FireUXConfig'

// Use the centralized state management
const { blogPost, featuredImageData, socialImageData } =
  useCreateBlogPostState()

// Timestamps for display-only
const now = new Date().toISOString()
const createdAt = now
const updatedAt = now

// App ID from runtime config
const config = useFireUXConfig()
const tenantId = config.appId

// Sanitize the HTML before injecting
const sanitizedContent = computed(() =>
  DOMPurify.sanitize(blogPost.value.content || '')
)
</script>
