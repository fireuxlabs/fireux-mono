<template>
  <FireState
    v-if="outcome === 'pending' || outcome === 'idle'"
    entity="place"
    outcome="pending"
  />
  <UAlert
    v-else-if="outcome === 'error'"
    title="We couldn’t load this place"
    description="There was a problem fetching the information. Please try again."
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        message="We couldn’t load this place&#10;There was a problem fetching the information. Please try again."
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
    v-else-if="!hasPlace"
    title="Place not found"
    description="We couldn’t find the place you’re looking for. It may have been removed or the link is incorrect."
    color="neutral"
    variant="soft"
    role="status"
    aria-live="polite"
  >
    <template #actions>
      <UButton
        label="Back to all Places"
        icon="i-lucide-arrow-left"
        to="/places"
        color="primary"
        size="sm"
      />
    </template>
  </UAlert>
</template>

<script setup lang="ts">
defineOptions({ name: 'PlaceDetailState' })
defineProps<{
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  hasPlace: boolean
}>()
const emit = defineEmits<{ refresh: [] }>()
</script>
