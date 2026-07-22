<!-- Concurrent edit — 2026-07-22 13:03 CEST — Origin-aware Ignition pipelines: replace competing app offers with the canonical Ignition price and intake. -->
<template>
  <PublicSimplePage
    title="FireUX App pricing"
    description="A branded web app configured, launched, hosted, and maintained by FireUX."
    eyebrow="FireUX App"
    back-to="/pricing"
    back-label="Pricing"
  >
    <section class="grid gap-4 sm:grid-cols-2">
      <UCard variant="subtle">
        <p class="text-sm text-muted">Setup</p>
        <p class="mt-1 text-3xl font-semibold text-highlighted">
          {{ appMeta.getStarted.setupPrice }}
        </p>
        <p class="mt-2 text-sm text-muted">
          Branding, configuration, and launch.
        </p>
      </UCard>

      <UCard variant="subtle">
        <p class="text-sm text-muted">Maintenance</p>
        <p class="mt-1 text-3xl font-semibold text-highlighted">
          {{ appMeta.getStarted.monthlyPrice }}
        </p>
        <p class="mt-2 text-sm text-muted">
          Hosting, updates, and maintenance.
        </p>
      </UCard>
    </section>

    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">Included</h2>
      </template>

      <ul class="grid gap-3 sm:grid-cols-2">
        <li
          v-for="item in appMeta.getStarted.included"
          :key="item"
          class="flex items-start gap-2 text-sm text-muted"
        >
          <UIcon name="i-lucide-check" class="mt-0.5 shrink-0 text-primary" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </UCard>

    <UAlert
      color="neutral"
      variant="soft"
      title="What happens next"
      description="Send the brief. We review it and confirm the scope before work starts."
    />

    <template #actions>
      <UButton to="/get-started?from=pricing-apps" icon="i-lucide-rocket">
        Request Ignition
      </UButton>
      <UButton to="/pricing/users" color="neutral" variant="ghost">
        User pricing
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { appMeta } from '../../meta'

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'App Pricing · FireUX',
  description: 'Launch a FireUX App for $150 setup and $15 per month.',
})
</script>
