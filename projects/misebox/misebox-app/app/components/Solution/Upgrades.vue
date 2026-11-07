<template>
  <UCard variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Upgrades</h2>
    </template>

    <ul class="fx-list-stack">
      <li v-for="item in items" :key="item">
        <UIcon name="i-lucide-plus-circle" />
        <span>{{ item }}</span>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  items: string[]
}>()
</script>
