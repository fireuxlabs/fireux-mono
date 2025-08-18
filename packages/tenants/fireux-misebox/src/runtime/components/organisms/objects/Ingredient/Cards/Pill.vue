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
