<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the Werkbox cleaning offer and capacity path. -->
<template>
  <PublicSimplePage
    title="Cleaning on Werkbox"
    description="Run cleaning work in the shared Werkbox app and bring in extra help when a job exceeds your capacity."
    eyebrow="Werkbox"
    back-to="/ecosystems/werkbox"
    back-label="Werkbox"
  >
    <UAlert
      color="primary"
      variant="soft"
      title="Werkbox cleaning is being prepared"
      description="We are moving the existing Cleanbox foundation into Werkbox. You can ask to join the first group now."
    />

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">Start with the shared app</h2>
      <ul class="fx-list-stack text-muted">
        <li>Create a cleaning business or provider profile.</li>
        <li>Manage customers and cleaning jobs.</li>
        <li>Use the free plan before choosing a paid plan.</li>
      </ul>
    </section>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">When a job gets bigger</h2>
      <p class="text-muted">Publish the capacity you need to the Werkbox network:</p>
      <div class="grid gap-3 sm:grid-cols-3">
        <UCard variant="subtle">
          <p class="font-semibold text-highlighted">Cleaners</p>
          <p class="mt-1 text-sm text-muted">Add people for a larger or short-notice job.</p>
        </UCard>
        <UCard variant="subtle">
          <p class="font-semibold text-highlighted">Drivers</p>
          <p class="mt-1 text-sm text-muted">Move workers or large equipment.</p>
        </UCard>
        <UCard variant="subtle">
          <p class="font-semibold text-highlighted">Equipment</p>
          <p class="mt-1 text-sm text-muted">Find machines or specialist tools.</p>
        </UCard>
      </div>
    </section>

    <UCard variant="subtle">
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">Need your own app later?</h2>
      </template>
      <p class="text-muted">
        Move to a branded Werkbox app for $600 setup, then choose $20/month self-managed or $50/month managed.
      </p>
    </UCard>

    <template #actions>
      <UButton
        to="mailto:fire@fireux.app?subject=Join%20Werkbox%20cleaning"
        icon="i-lucide-mail"
      >
        Ask to join
      </UButton>
      <UButton to="/ecosystems/werkbox/pricing" color="neutral" variant="soft">
        See pricing
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
  description: 'Manage cleaning work and find extra cleaners, drivers, or equipment through the Werkbox ecosystem.',
})
</script>
