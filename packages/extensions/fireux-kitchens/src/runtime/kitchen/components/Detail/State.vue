<template>
  <FireState
    v-if="outcome === 'idle' || outcome === 'pending'"
    entity="kitchen"
    outcome="pending"
  />
  <UAlert
    v-else-if="outcome === 'error'"
    title="We couldn’t load this kitchen"
    description="There was a problem fetching the information. Please try again."
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        message="We couldn’t load this kitchen&#10;There was a problem fetching the information. Please try again."
      />
      <UButton
        label="Retry"
        icon="i-lucide-refresh-cw"
        color="primary"
        size="sm"
        @click="emit('refresh')"
      />
    </template>
  </UAlert>
  <UAlert
    v-else-if="!hasKitchen"
    title="Kitchen not found"
    description="We couldn’t find the kitchen you’re looking for. It may have been removed or the link is incorrect."
    color="neutral"
    variant="soft"
    role="status"
    aria-live="polite"
  >
    <template #actions>
      <UButton
        label="Back to all Kitchens"
        icon="i-lucide-arrow-left"
        to="/kitchens"
        color="primary"
        size="sm"
      />
    </template>
  </UAlert>
</template>

<script setup lang="ts">
import type { KitchenDetailOutcome } from '../../composables/useKitchenDetail'
defineOptions({ name: 'KitchenDetailState' })
defineProps<{
  outcome: KitchenDetailOutcome
  hasKitchen: boolean
}>()
const emit = defineEmits<{ refresh: [] }>()
</script>
