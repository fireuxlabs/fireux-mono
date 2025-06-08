<!-- COMMENT: app/components/molecules/LoadingSpinner.vue -->
<template>
  <UContainer>
    <p class="loading-message">{{ message }}</p>
  </UContainer>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Loading...'
  }
})
</script>

<style scoped>

.loading-message {
  margin-top: var(--space-4);
  font-size: var(--font-size-m);
  color: var(--ui-text-muted);
}
</style>