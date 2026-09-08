<template>
  <UCard class="h-full" :class="placeholder ? 'bg-error/5 ring-error/20' : undefined" :ui="{ body: 'flex h-full flex-col p-3 sm:p-3' }">
    <div class="flex min-h-7 items-center justify-between gap-3">
      <h2 class="flex items-center gap-2 text-sm font-medium"><UIcon :name="icon" class="text-primary" />{{ title }}</h2>
      <UButton v-if="to" :to="to" icon="i-lucide-arrow-up-right" :aria-label="`Open ${title}`" color="neutral" variant="ghost" size="xs" />
    </div>
    <p v-if="placeholder" class="mt-1 flex items-center gap-1.5 text-xs text-muted"><span class="size-1.5 rounded-full bg-error/60" />{{ description || 'Summary coming soon' }}</p>
    <USkeleton v-else-if="pending" class="mt-2 h-8" />
    <div v-else-if="error" class="mt-2"><p class="text-sm text-error">{{ title }} could not be loaded.</p><MoleculesCopyError :message="`${title} could not be loaded.`" /></div>
    <div v-else class="mt-2 flex flex-1 flex-col gap-1.5"><p class="text-xl font-semibold tabular-nums leading-6 tracking-tight">{{ value }}</p><p v-if="description" class="text-xs text-muted">{{ description }}</p><slot /></div>
  </UCard>
</template>
<script setup lang="ts">
defineProps<{ title: string; icon: string; to?: string; value?: string | number; description?: string; pending?: boolean; error?: unknown; placeholder?: boolean }>()
</script>
