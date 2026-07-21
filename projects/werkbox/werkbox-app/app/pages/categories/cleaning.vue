<!-- Concurrent edit — 2026-07-21 12:17 CEST — Cleanbox-to-Werkbox app migration: add cleaning as a neutral Werkbox category. -->
<template>
  <PublicSimplePage
    title="Cleaning"
    description="Cleaning work inside the shared Werkbox Jobs and provider network."
    eyebrow="Werkbox category"
    back-to="/"
    back-label="Werkbox"
  >
    <figure class="overflow-hidden rounded-2xl border border-default bg-muted">
      <img
        src="/img/categories/cleaning/cover.png"
        alt="Cleaning tools and bubbles"
        width="1280"
        height="720"
        class="aspect-video w-full object-cover"
      />
    </figure>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">
        One category, shared foundations
      </h2>
      <p class="text-muted">
        Cleaning Jobs keep their normal Job IDs and use the product-neutral category ID
        <code>cleaning</code>. Organisations and workers use the same Agent and Professional
        profiles as other practical-work categories.
      </p>
    </section>

    <div class="grid gap-4 sm:grid-cols-3">
      <UPageCard
        title="Cleaning jobs"
        description="Browse the shared Jobs collection."
        icon="i-lucide-briefcase-business"
        to="/jobs"
        variant="subtle"
      />
      <UPageCard
        title="Service organisations"
        description="Browse organisations with Agent profiles."
        icon="i-lucide-building-2"
        to="/agents"
        variant="subtle"
      />
      <UPageCard
        title="Professionals"
        description="Browse individual Professional profiles."
        icon="i-lucide-users"
        to="/professionals"
        variant="subtle"
      />
    </div>

    <template #actions>
      <UButton to="/jobs" icon="i-lucide-briefcase-business">
        Browse jobs
      </UButton>
      <UButton to="/agents" color="neutral" variant="soft">
        Browse organisations
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'Cleaning · Werkbox',
  description: 'Browse cleaning jobs, service organisations, and professionals through the shared Werkbox network.',
})
</script>
