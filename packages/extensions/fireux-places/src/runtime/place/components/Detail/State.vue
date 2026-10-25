<template>
  <FireStateCard
    v-if="outcome === 'pending' || outcome === 'idle'"
    entity="place"
    kind="document"
    loading
  />
  <FireStateCard
    v-else-if="outcome === 'error'"
    entity="place"
    kind="document"
    state="error"
    title="We couldn’t load this place"
    description="There was a problem fetching the information. Please try again."
  >
    <UButton
      label="Retry"
      icon="i-lucide-refresh-cw"
      color="primary"
      size="sm"
      @click="emit('refresh')"
    />
  </FireStateCard>
  <FireStateCard
    v-else-if="!hasPlace"
    entity="place"
    kind="document"
    state="missing"
    title="Place not found"
    description="We couldn’t find the place you’re looking for. It may have been removed or the link is incorrect."
  >
    <UButton
      label="Back to all Places"
      icon="i-lucide-arrow-left"
      to="/places"
      color="primary"
      size="sm"
    />
  </FireStateCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'PlaceDetailState' })
defineProps<{
  outcome: 'idle' | 'pending' | 'error' | 'missing' | 'ready'
  hasPlace: boolean
}>()
const emit = defineEmits<{ refresh: [] }>()
</script>
