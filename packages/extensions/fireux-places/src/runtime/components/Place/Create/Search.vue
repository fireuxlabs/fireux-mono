<template>
  <!-- Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: isolate Place selection as the first funnel step. -->
  <section class="form-stack-sm">
    <PlaceSearchSection
      :show-confirm-button="false"
      @selected="emit('selected', $event)"
      @cleared="emit('cleared')"
    />

    <UAlert
      v-if="pending"
      color="neutral"
      variant="soft"
      icon="i-lucide-loader-circle"
      title="Confirming Place details"
      description="We are loading the full address and location before you continue."
    />

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Place details unavailable"
      :description="error"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-database"
      title="One shared Place"
      description="Existing Places are reused. New Google results are verified by the server before they are added."
    />
  </section>
</template>

<script setup lang="ts">
import type { PlaceOnboardingSelection } from '../../../composables/fireux/place/usePlacesOnboarding'

defineProps<{
  pending: boolean
  error: string
}>()

const emit = defineEmits<{
  (event: 'selected', selection: PlaceOnboardingSelection): void
  (event: 'cleared'): void
}>()
</script>
