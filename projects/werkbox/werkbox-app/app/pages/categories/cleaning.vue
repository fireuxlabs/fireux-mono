<!-- Concurrent edit — 2026-07-21 12:17 CEST — Cleanbox-to-Werkbox app migration: add cleaning as a neutral Werkbox category. -->
<template>
  <UPage>
    <UButton to="/" variant="link"> Werkbox </UButton>
    <UPageHeader
      title="Cleaning"
      description="Find cleaning work, skilled professionals, and service organisations in one practical-work network."
      headline="Practical work · Cleaning"
    />
    <UPageBody>
      <figure>
        <img
          src="/img/landing/practical-work-hero-v2.png"
          alt="A professional preparing a modern shared workspace"
          width="1717"
          height="916"
        />
      </figure>

      <section class="pagebody">
        <h2 class="fx-type-section-title">Keep places ready for people</h2>
        <p class="fx-type-body">
          Browse current opportunities, discover cleaning organisations, or
          publish a Professional profile you can reuse when you apply. Employers
          manage roles and applications directly through Werkbox.
        </p>
      </section>

      <UPageGrid>
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
          to="/get-started"
          variant="subtle"
        />
      </UPageGrid>

      <div class="fx-card__actions">
        <UButton to="/jobs" icon="i-lucide-briefcase-business">
          Browse jobs
        </UButton>
        <UButton to="/agents" color="neutral" variant="soft">
          Browse organisations
        </UButton>
      </div>
    </UPageBody>
  </UPage>
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
