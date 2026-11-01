<template>
  <UPageSection
    :as="{ title: primary ? 'h1' : 'h2' }"
    :headline="product.tagline ? product.name : undefined"
    :title="product.tagline || product.name"
    :description="product.description"
    :orientation="previewComponent || image ? 'horizontal' : 'vertical'"
    :reverse="reverse"
    :features="benefits"
    :links="links"
  >
    <div v-if="previewComponent" class="product-surface-preview">
      <component :is="previewComponent" v-bind="previewProps" />
    </div>
    <img
      v-else-if="image"
      class="product-surface-image"
      :src="image.url"
      :alt="image.alt || product.name"
      loading="lazy"
    />
    <p v-if="price || terms" class="product-surface-terms">
      {{ price }}<span v-if="price && terms"> · </span>{{ terms }}
    </p>
  </UPageSection>
</template>
<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { Product } from '../models/product.model'
const props = defineProps<{
  product: Product
  primary?: boolean
  action?: { label: string; to: string }
  previewComponent?: Component
  previewProps?: Record<string, unknown>
  reverse?: boolean
  price?: string
  terms?: string
}>()
const benefits = computed(() =>
  props.product.features
    .filter((feature) => feature.available)
    .map((feature) => ({
      title: feature.title,
      description: feature.description,
      icon: 'i-lucide-check',
    }))
)
const links = computed(() =>
  props.action
    ? [{ ...props.action, trailingIcon: 'i-lucide-arrow-right' }]
    : undefined
)
const image = computed(
  () =>
    props.product.images.find((image) => Boolean(image.url)) ??
    (props.product.main_image
      ? { url: props.product.main_image, alt: props.product.name }
      : undefined)
)
</script>
<style scoped>
.product-surface-preview {
  padding: clamp(1.5rem, 5vw, 3rem);
  border-radius: 2rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg-elevated);
}
.product-surface-image {
  width: 100%;
  height: auto;
  border-radius: 1.5rem;
  border: 1px solid var(--ui-border);
}
.product-surface-terms {
  color: var(--ui-text-muted);
  font-size: 0.875rem;
}
</style>
