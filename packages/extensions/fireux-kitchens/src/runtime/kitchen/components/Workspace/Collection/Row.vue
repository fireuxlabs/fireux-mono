<template>
  <NuxtLink :to="to">
    <UIcon :name="icon" />
    <div>
      <h2 class="fx-truncate">
        {{ title }}
      </h2>
      <p v-if="description">
        {{ description }}
      </p>
      <p v-if="meta">{{ meta }}</p>
    </div>
    <slot />
    <UIcon name="i-lucide-chevron-right" />
  </NuxtLink>
</template>
<script setup lang="ts">
defineProps<{
  to: string
  title: string
  icon: string
  description?: string
  meta?: string
}>()
</script>
