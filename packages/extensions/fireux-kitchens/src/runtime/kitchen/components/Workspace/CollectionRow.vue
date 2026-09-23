<template>
  <NuxtLink
    :to="to"
    class="flex min-w-0 items-center gap-3 rounded-xl border border-default bg-default p-4 transition hover:border-primary/40 hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
  >
    <UIcon :name="icon" class="size-5 shrink-0 text-muted" />
    <div class="min-w-0 flex-1">
      <h2 class="truncate text-base font-medium text-highlighted">
        {{ title }}
      </h2>
      <p v-if="description" class="mt-1 line-clamp-1 text-sm text-muted">
        {{ description }}
      </p>
      <p v-if="meta" class="mt-1 text-xs text-muted">{{ meta }}</p>
    </div>
    <slot />
    <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0 text-dimmed" />
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
