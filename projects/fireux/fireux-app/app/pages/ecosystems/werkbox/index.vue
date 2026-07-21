<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the authored Werkbox ecosystem overview. -->
<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: keep future practical-work copy product-neutral. -->
<template>
  <PublicSimplePage
    title="Werkbox"
    description="Shared tools and services for people who do practical work."
    eyebrow="FireUX ecosystem"
    back-to="/ecosystems"
    back-label="Ecosystems"
  >
    <UCard variant="subtle">
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">Start in the shared app</h2>
      </template>

      <p class="text-muted">
        Use Werkbox before paying for a dedicated app. Start free, upgrade when the shared tools earn their place in your business, and move to your own branded app later if needed.
      </p>
    </UCard>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-highlighted">Services</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <UPageCard
          title="Cleaning"
          description="Run cleaning work and bring in extra capacity when a job gets bigger."
          icon="i-lucide-sparkles"
          to="/ecosystems/werkbox/cleaning"
          variant="subtle"
        />
        <UPageCard
          title="More practical work"
          description="Additional practical-work categories can reuse the same neutral Job and Place foundations when their workflows are ready."
          icon="i-lucide-wrench"
          variant="subtle"
        />
      </div>
    </section>

    <template #actions>
      <UButton to="/ecosystems/werkbox/cleaning" icon="i-lucide-sparkles">
        Explore cleaning
      </UButton>
      <UButton to="/ecosystems/werkbox/pricing" color="neutral" variant="soft">
        Werkbox pricing
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Werkbox · FireUX Ecosystem',
  description: 'Start with shared tools for practical work, then move to a dedicated Werkbox app when the business needs one.',
})
</script>
