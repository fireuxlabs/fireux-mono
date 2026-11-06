<template>
  <UCard :class="placeholder ? '' : undefined">
    <div class="flex min-h-7 items-center justify-between gap-3">
      <h2 class="flex items-center gap-2"><UIcon :name="icon" />{{ title }}</h2>
      <UButton
        v-if="to"
        :to="to"
        icon="i-lucide-arrow-up-right"
        :aria-label="`Open ${title}`"
        color="neutral"
        variant="ghost"
        size="xs"
      />
    </div>
    <p v-if="placeholder" class="mt-1 flex items-center gap-1.5">
      <span class="size-1.5" />{{ description || 'Summary coming soon' }}
    </p>
    <USkeleton v-else-if="pending" class="mt-2 h-8" />
    <div v-else-if="error" class="mt-2">
      <p>{{ title }} could not be loaded.</p>
      <FireCopyError :message="`${title} could not be loaded.`" />
    </div>
    <div v-else class="mt-2 flex flex-1 flex-col gap-1.5">
      <p class="tabular-nums">{{ value }}</p>
      <p v-if="description">{{ description }}</p>
      <slot />
    </div>
  </UCard>
</template>
<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  to?: string
  value?: string | number
  description?: string
  pending?: boolean
  error?: unknown
  placeholder?: boolean
}>()
</script>
