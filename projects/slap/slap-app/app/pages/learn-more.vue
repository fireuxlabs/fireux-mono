<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <section>
      <UContainer>
        <UBadge color="primary" variant="soft">Slap Guide</UBadge>
        <h1 class="fx-type-display-title">Learn More</h1>
        <p class="fx-type-description">
          Slap wraps drops, stories, gallery thinking, and workspace-backed
          operations in lifestyle-commerce language.
        </p>
        <div class="fx-card__actions">
          <UButton to="/about" color="primary" icon="i-lucide-info"
            >About</UButton
          >
          <UButton
            to="/products"
            color="neutral"
            variant="soft"
            icon="i-lucide-package-open"
            >Drops</UButton
          >
          <UButton
            to="/blog"
            color="neutral"
            variant="ghost"
            icon="i-lucide-newspaper"
            >Stories</UButton
          >
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'SlapLearnMorePage',
})

useSeoMeta({
  title: 'Learn More · Slap',
  description: 'Guide to the Slap lifestyle-commerce ecosystem.',
})
</script>
