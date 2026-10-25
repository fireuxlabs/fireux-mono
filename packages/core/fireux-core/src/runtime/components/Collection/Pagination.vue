<template>
  <div v-if="hasMore || error" class="collection-pagination">
    <FireState
      v-if="error"
      outcome="error"
      entity="more records"
      :error="error"
    />
    <UButton
      v-if="hasMore"
      label="Load more"
      variant="soft"
      color="neutral"
      :loading="loading"
      :disabled="loading"
      @click="$emit('load-more')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hasMore: boolean
  loading?: boolean
  error?: unknown
}>()

defineEmits<{
  'load-more': []
}>()
</script>

<style scoped>
.collection-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: calc(var(--spacing) * 3);
}
</style>
