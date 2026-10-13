<template>
  <div v-if="policy" class="flex flex-wrap items-center gap-2">
    <USelect
      :model-value="policy.pause"
      :items="modes"
      aria-label="Order intake"
      :disabled="!canWrite || pending"
      @update:model-value="(pause) => save({ pause })"
    />
    <USelect
      :model-value="policy.off_site_acceptance"
      :items="acceptance"
      aria-label="Off-site acceptance"
      title="Applies to new collection and delivery orders. Pre-orders always need manual review."
      :disabled="!canWrite || pending || policy.pause !== 'open'"
      @update:model-value="
        (off_site_acceptance) => save({ off_site_acceptance })
      "
    />
    <USelect
      v-if="policy.off_site_acceptance === 'automatic'"
      :model-value="policy.preparation_minutes"
      :items="estimates"
      aria-label="Preparation estimate"
      :disabled="!canWrite || pending"
      @update:model-value="
        (preparation_minutes) => save({ preparation_minutes })
      "
    />
    <UBadge v-if="policy.pause !== 'open'" color="warning" variant="soft">{{
      policy.pause === 'all'
        ? 'All new orders paused'
        : 'Off-site orders paused'
    }}</UBadge>
    <UButton
      v-if="policy.pause !== 'open'"
      label="Resume orders"
      color="warning"
      :disabled="!canWrite || pending"
      @click="save({ pause: 'open' })"
    />
    <UBadge
      v-else-if="policy.off_site_acceptance === 'automatic'"
      color="success"
      variant="soft"
      >Auto-accept on</UBadge
    >
  </div>
  <UAlert v-else color="warning" title="Order intake settings unavailable" />
  <UAlert
    v-if="error"
    color="error"
    title="Could not save service settings"
    :description="error"
    ><template #actions><MoleculesCopyError :message="error" /></template
  ></UAlert>
</template>
<script setup lang="ts">
import { useKitchenOrderIntake } from '../../../composables/workspace/orders/useKitchenOrderIntake'
const { policy, canWrite, pending, error, save } = useKitchenOrderIntake()
const modes = [
  { label: 'Taking orders', value: 'open' as const },
  { label: 'Pause off-site', value: 'off_site' as const },
  { label: 'Pause all', value: 'all' as const },
]
const acceptance = [
  { label: 'Off-site: Manual', value: 'manual' as const },
  { label: 'Off-site: Auto-accept', value: 'automatic' as const },
]
const estimates = Array.from({ length: 18 }, (_, i) => ({
  label: `${(i + 1) * 5} min prep`,
  value: (i + 1) * 5,
}))
</script>
