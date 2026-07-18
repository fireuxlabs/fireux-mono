<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Slap Guide</UBadge>
        <h1 class="fx-type-display-title">
          Learn More
        </h1>
        <p class="fx-type-description text-toned">
          Slap wraps drops, stories, gallery thinking, and console-backed operations in lifestyle-commerce language.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/about" color="primary" icon="i-lucide-info">About</UButton>
          <UButton to="/products" color="neutral" variant="soft" icon="i-lucide-package-open">Drops</UButton>
          <UButton to="/blog" color="neutral" variant="ghost" icon="i-lucide-newspaper">Stories</UButton>
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
