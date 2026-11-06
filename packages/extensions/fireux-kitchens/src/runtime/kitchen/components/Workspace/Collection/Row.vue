<template>
  <NuxtLink
    :to="to"
    class="flex min-w-0 items-center gap-3 rounded-xl border border-default bg-default p-4 transition hover:border-primary/40 hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
  >
    <UIcon :name="icon" class="shrink-0" />
    <div class="min-w-0 flex-1">
      <h2 class="truncate">
        {{ title }}
      </h2>
      <p v-if="description" class="mt-1 line-clamp-1">
        {{ description }}
      </p>
      <p v-if="meta" class="mt-1">{{ meta }}</p>
    </div>
    <slot />
    <UIcon name="i-lucide-chevron-right" class="shrink-0" />
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
