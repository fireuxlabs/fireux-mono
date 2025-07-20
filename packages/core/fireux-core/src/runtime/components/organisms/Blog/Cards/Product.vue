<template>
  <NuxtLink
    v-if="product && product.description"
    :to="`/products/${product.slug}`"
    class="blog-card-link"
  >
    <UCard class="blog-card">
      <div class="blog-card-header">
        <div v-if="product.image" class="blog-card-image">
          <img
            :src="product.image"
            alt="Product Image"
            class="blog-card-thumbnail product-thumbnail"
          >
        </div>
        <div class="blog-card-text">
          <div class="blog-card-title">{{ product.name }}</div>
          <div class="blog-card-price">${{ product.price }}</div>
        </div>
      </div>
      <div class="blog-card-content">
        <div v-html="truncateDescription(product.description)"></div>
      </div>
    </UCard>
  </NuxtLink>
  <p v-else>Loading...</p>
</template>

<script setup lang="ts">
defineProps({
  product: {
    type: Object,
    default: () => ({})
  }
})

const truncateDescription = (description: string): string => {
  if (!description) return ''
  const plainText = description.replace(/<[^>]*>/g, '')
  return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText
}
</script>

<style scoped>
/* This override provides a larger image for product cards,
   while the rest of the styling is inherited from the parent/global CSS */
.product-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}
</style>