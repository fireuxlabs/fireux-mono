<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">{{ title }}</div>
      </div>
    </template>

    <div class="space-y-2">
      <p class="console-card-header__description">
        {{ description }}
      </p>
      <p class="text-sm text-dimmed">
        Supplier catalogue grouping will live here.
      </p>
      <p class="text-sm text-dimmed">
        Collection path:
        <code>{{ collectionPath || 'none' }}</code>
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  collectionPath: string
  pending: boolean
}>()
</script>
