<template>
  <UCard variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Instructions</h2>
    </template>

    <div class="grid gap-3 md:grid-cols-3">
      <UCard v-for="item in items" :key="item.title">
        <UIcon :name="item.icon" />
        <h3 class="fx-type-card-heading">
          {{ item.title }}
        </h3>
        <p class="mt-2 fx-type-caption">
          {{ item.body }}
        </p>
      </UCard>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    title: string
    icon: string
    body: string
  }>
}>()
</script>
