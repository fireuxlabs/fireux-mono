<template>
  <UCard class="object card pill">
    <div class="header">
      <div class="icon small">🥬</div>
      <div class="info">
        <h4 v-if="ingredient?.name" class="title">
          {{ ingredient.name }}
        </h4>
        <p v-if="ingredient?.category" class="subtitle">
          {{ ingredient.category }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Temporary relaxed typing to prevent build errors during UI wiring
defineProps<{
  ingredient?: Record<string, any>
}>()
</script>

<style scoped>
.pill {
  align-self: flex-start;
  max-height: var(--fireux-pill-height, 3.5rem);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.title,
.subtitle {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: 0.8rem;
  opacity: 0.75;
}
</style>
