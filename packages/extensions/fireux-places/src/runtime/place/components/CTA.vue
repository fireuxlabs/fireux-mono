<template>
  <!-- Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: keep the public directory browse-only. -->
  <UPageCTA
    class="cta"
    data-entity-cta-family="domain-managed"
    title="Add a Place"
    description="Find the real location, confirm its identity, and review it before adding it to FireUX."
    variant="naked"
  >
    <template #links>
      <UButton
        to="/places/create"
        icon="i-lucide-map-pin-plus"
        color="primary"
      >
        Start Place onboarding
      </UButton>
    </template>
  </UPageCTA>
</template>
