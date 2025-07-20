<template>
  <div v-if="data" class="text-section">
    <p class="profile-content-text">{{ data }}</p>
  </div>
  <div v-else class="empty-state">
    <p>{{ config?.emptyText || 'No information available' }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data?: string | null
  config?: {
    emptyText?: string
  }
}

defineProps<Props>()
</script>

<style scoped>
.text-section {
  margin: 0;
}

.profile-content-text {
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-secondary);
  font-style: italic;
}
</style>
