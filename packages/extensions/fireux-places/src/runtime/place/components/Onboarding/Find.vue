<template>
  <!-- Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: isolate Place selection as the first funnel step. -->
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: keep Place search focused on selection and actionable state. -->
  <section class="form-stack-sm">
    <PlaceSearchSection
      :show-confirm-button="false"
      allow-google
      placeholder="Search by name or address"
      @selected="emit('selected', $event)"
      @cleared="emit('cleared')"
    />

    <UAlert
      v-if="pending"
      color="neutral"
      variant="soft"
      icon="i-lucide-loader-circle"
      title="Checking this location…"
    />

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="We could not use this location"
      :description="error"
    />
  </section>
</template>

<script setup lang="ts">
import type { PlaceOnboardingSelection } from '../../composables/usePlaceOnboarding'

defineProps<{
  pending: boolean
  error: string
}>()

const emit = defineEmits<{
  (event: 'selected', selection: PlaceOnboardingSelection): void
  (event: 'cleared'): void
}>()
</script>
