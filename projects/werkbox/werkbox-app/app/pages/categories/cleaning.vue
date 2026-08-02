<!-- Concurrent edit — 2026-07-21 12:17 CEST — Cleanbox-to-Werkbox app migration: add cleaning as a neutral Werkbox category. -->
<template>
  <PublicSimplePage
    title="Cleaning"
    description="Find cleaning work, skilled professionals, and service organisations in one practical-work network."
    eyebrow="Practical work · Cleaning"
    back-to="/"
    back-label="Werkbox"
  >
    <figure class="overflow-hidden rounded-2xl border border-default bg-muted">
      <img
        src="/img/landing/practical-work-hero-v2.png"
        alt="A professional preparing a modern shared workspace"
        width="1717"
        height="916"
        class="aspect-video w-full object-cover"
      />
    </figure>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">
        Keep places ready for people
      </h2>
      <p class="text-muted">
        Browse current opportunities, discover cleaning organisations, or
        publish a Professional profile you can reuse when you apply. Employers
        manage roles and applications directly through Werkbox.
      </p>
    </section>

    <div class="grid gap-4 sm:grid-cols-3">
      <UPageCard
        title="Cleaning jobs"
        description="Find open roles across professional cleaning work."
        icon="i-lucide-briefcase-business"
        to="/jobs"
        variant="subtle"
      />
      <UPageCard
        title="Service organisations"
        description="Discover organisations hiring and delivering services."
        icon="i-lucide-building-2"
        to="/agents"
        variant="subtle"
      />
      <UPageCard
        title="Professionals"
        description="Find people who publish practical-work experience."
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
  description:
    'Find cleaning jobs, skilled professionals, and service organisations through Werkbox.',
})
</script>
