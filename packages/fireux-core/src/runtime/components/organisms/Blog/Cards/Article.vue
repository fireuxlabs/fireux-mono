<template>
  <NuxtLink
    v-if="post && post.content"
    :to="`/blog/${post.slug}`"
    class="blog-card-link"
  >
    <UCard class="blog-card">
      <div class="blog-card-header">
        <div class="blog-card-text">
          <div class="blog-card-title">{{ post.title }}</div>
          <div class="blog-card-reading-time">
            {{ post.readingTime.replace(' min', '') }} read
          </div>
        </div>
        <div v-if="post.featuredImage" class="blog-card-image">
          <img
            :src="post.featuredImage"
            alt="Featured Image"
            class="blog-card-thumbnail"
          />
        </div>
      </div>

      <div class="blog-card-content">
        <div v-html="truncateContent(post.content)"></div>
      </div>
    </UCard>
  </NuxtLink>
  <p v-else>Loading...</p>
</template>

<script setup lang="ts">
defineProps({
  post: {
    type: Object,
    default: () => ({})
  }
})

const truncateContent = (content: string): string => {
  if (!content) return ''
  const plainText = content.replace(/<[^>]*>/g, '')
  return plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText
}
</script>
