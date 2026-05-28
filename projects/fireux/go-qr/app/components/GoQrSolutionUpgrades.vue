<template>
  <UCard
    v-if="items?.length"
    variant="subtle"
  >
    <template #header>
      <h2 class="text-lg font-semibold text-highlighted">
        Upgrades
      </h2>
    </template>

    <ul class="space-y-3 text-sm leading-6 text-muted">
      <li
        v-for="item in items"
        :key="item"
        class="flex gap-3"
      >
        <UIcon name="i-lucide-plus-circle" class="mt-0.5 size-4 shrink-0 text-primary" />
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
