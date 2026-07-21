<!-- Concurrent edit — 2026-07-21 12:17 CEST — Cleanbox-to-Werkbox app migration: add the general practical-work hub. -->
<template>
  <PublicSimplePage
    title="Werkbox"
    description="A shared hub for practical jobs, service organisations, and professional profiles."
    eyebrow="Practical work, connected"
  >
    <UCard variant="subtle">
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">
          Start with the work, not a product silo
        </h2>
      </template>

      <p class="text-muted">
        Werkbox uses neutral Jobs, Agents, Professionals, Companies, and Places foundations.
        Cleaning is the first category, and the same records can support other practical work later.
      </p>
    </UCard>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold text-highlighted">
        Explore Werkbox
      </h2>

      <div class="grid gap-4 sm:grid-cols-2">
        <UPageCard
          title="Cleaning"
          description="Explore cleaning work without creating cleaning-specific Job identities."
          icon="i-lucide-sparkles"
          to="/categories/cleaning"
          variant="subtle"
        />
        <UPageCard
          title="Jobs"
          description="Browse practical work published through the shared Jobs domain."
          icon="i-lucide-briefcase-business"
          to="/jobs"
          variant="subtle"
        />
        <UPageCard
          title="Agents"
          description="Browse service organisations represented by Agent profiles."
          icon="i-lucide-building-2"
          to="/agents"
          variant="subtle"
        />
        <UPageCard
          title="Professionals"
          description="Browse people who publish Professional profiles for practical work."
          icon="i-lucide-users"
          to="/professionals"
          variant="subtle"
        />
      </div>
    </section>

    <template #actions>
      <UButton to="/jobs" icon="i-lucide-briefcase-business">
        Browse jobs
      </UButton>
      <UButton to="/categories/cleaning" color="neutral" variant="soft">
        Explore cleaning
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Werkbox · Practical work, connected',
  description: 'Browse practical jobs, service organisations, and professional profiles, starting with cleaning work.',
})
</script>
