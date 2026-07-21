<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the cleaning search-intent sales page. -->
<template>
  <SolutionPage
    title="App for a cleaning business"
    description="You probably do not need your own app yet. Start on Werkbox and see whether it gives your business what it needs."
  >
    <UCard variant="subtle">
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">Start shared</h2>
      </template>

      <div class="space-y-4 text-muted">
        <p>Join Werkbox, create your business profile, and start with the free plan.</p>
        <ul class="fx-list-stack">
          <li>Keep customers and cleaning jobs together.</li>
          <li>Bring in extra cleaners when a job is too large for your team.</li>
          <li>Find drivers or equipment when the work needs them.</li>
        </ul>
      </div>
    </UCard>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">Move only when it makes sense</h2>
      <p class="text-muted">
        If Werkbox works for you and your own brand needs a separate home, we can move you to a dedicated Werkbox app from $600 setup.
      </p>
    </section>

    <template #actions>
      <UButton to="/ecosystems/werkbox/cleaning" icon="i-lucide-sparkles">
        See Werkbox cleaning
      </UButton>
      <UButton to="/ecosystems/werkbox/pricing" color="neutral" variant="soft">
        See prices
      </UButton>
    </template>
  </SolutionPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'App for a Cleaning Business · FireUX',
  description: 'Start your cleaning business on shared Werkbox, then move to a dedicated app only when you need one.',
})
</script>
