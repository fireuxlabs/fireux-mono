<template>
  <UCard v-if="items?.length" variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Instructions</h2>
    </template>

    <div class="pagebody">
      <UCard v-for="item in items" :key="item.title">
        <UIcon :name="item.icon" />
        <h3 class="fx-type-card-heading">
          {{ item.title }}
        </h3>
        <p class="fx-type-caption">
          {{ item.body }}
        </p>
      </UCard>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  items?: {
    title: string
    icon: string
    body: string
  }[]
}>()
</script>
