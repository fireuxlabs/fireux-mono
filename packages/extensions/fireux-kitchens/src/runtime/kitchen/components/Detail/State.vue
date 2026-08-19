<template>
  <MoleculesStateCard
    v-if="outcome === 'pending'"
    entity="kitchen"
    kind="document"
    loading
  />
  <MoleculesStateCard
    v-else-if="outcome === 'error'"
    entity="kitchen"
    kind="document"
    state="error"
    title="We couldn’t load this kitchen"
    description="There was a problem fetching the information. Please try again."
  >
    <UButton
      label="Retry"
      icon="i-lucide-refresh-cw"
      color="primary"
      size="sm"
      @click="emit('refresh')"
    />
  </MoleculesStateCard>
  <MoleculesStateCard
    v-else-if="!hasKitchen"
    entity="kitchen"
    kind="document"
    state="missing"
    title="Kitchen not found"
    description="We couldn’t find the kitchen you’re looking for. It may have been removed or the link is incorrect."
  >
    <UButton
      label="Back to all Kitchens"
      icon="i-lucide-arrow-left"
      to="/kitchens"
      color="primary"
      size="sm"
    />
  </MoleculesStateCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'KitchenDetailState' })
defineProps<{
  outcome: 'pending' | 'error' | 'missing' | 'ready'
  hasKitchen: boolean
}>()
const emit = defineEmits<{ refresh: [] }>()
</script>
