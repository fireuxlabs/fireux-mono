<template>
  <UCard v-if="items?.length" variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Upgrades</h2>
    </template>

    <ul class="space-y-3">
      <li v-for="item in items" :key="item" class="flex gap-3">
        <UIcon name="i-lucide-plus-circle" />
        <span>{{ item }}</span>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  items?: string[]
}>()
</script>
