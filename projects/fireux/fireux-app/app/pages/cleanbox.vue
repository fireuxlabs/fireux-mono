<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: retain the former route only as a permanent redirect. -->
<template>
  <PublicSimplePage
    title="Cleaning moved to Werkbox"
    description="Cleaning is now a category in the shared Werkbox practical-work hub."
  >
    <template #actions>
      <UButton to="/ecosystems/werkbox/cleaning" icon="i-lucide-arrow-right">
        Continue to Werkbox cleaning
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Cleaning on Werkbox · FireUX',
  description: 'Cleaning is a category in the shared Werkbox practical-work hub.',
})

await navigateTo('/ecosystems/werkbox/cleaning', {
  redirectCode: 301,
  replace: true,
})
</script>
