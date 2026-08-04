<!-- Concurrent edit — 2026-07-21 11:57 CEST — Sarah sales journey: add the Werkbox cleaning offer and capacity path. -->
<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: align the offer with currently owned Job and profile foundations. -->
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
      title="Cleaning is a Werkbox category"
      description="Cleaning work uses the shared Jobs, Agent, Professional, Company, and Place foundations without creating cleaning-specific record IDs."
    />

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">Start with the shared app</h2>
      <ul class="fx-list-stack text-muted">
        <li>Browse practical Jobs through the shared Jobs domain.</li>
        <li>Represent service organisations and workers with shared profiles.</li>
        <li>Keep the product-neutral category ID <code>cleaning</code>.</li>
      </ul>
    </section>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">Shared foundations</h2>
      <p class="text-muted">Werkbox currently composes these reusable domains:</p>
      <div class="grid gap-3 sm:grid-cols-3">
        <UCard variant="subtle">
          <p class="font-semibold text-highlighted">Jobs</p>
          <p class="mt-1 text-sm text-muted">Product-neutral work records classified by category.</p>
        </UCard>
        <UCard variant="subtle">
          <p class="font-semibold text-highlighted">Agents</p>
          <p class="mt-1 text-sm text-muted">Service organisations using shared public profiles.</p>
        </UCard>
        <UCard variant="subtle">
          <p class="font-semibold text-highlighted">Professionals</p>
          <p class="mt-1 text-sm text-muted">People using portable professional profiles.</p>
        </UCard>
      </div>
    </section>

    <UCard variant="subtle">
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">Need your own app later?</h2>
      </template>
      <p class="text-muted">
        Move to a branded Werkbox App for CHF 600 setup, then choose CHF 20/month Pro or CHF 50/month Managed.
      </p>
    </UCard>

    <template #actions>
      <UButton
        to="mailto:fire@fireux.app?subject=Join%20Werkbox%20cleaning"
        icon="i-lucide-mail"
      >
        Ask to join
      </UButton>
      <UButton to="/apps/werkbox" color="neutral" variant="soft">
        View Werkbox
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
  description: 'Explore cleaning Jobs, service organisations, and professionals through the shared Werkbox hub.',
})
</script>
