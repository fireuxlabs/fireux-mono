<template>
  <UCard>
    <div class="flex items-center justify-between gap-3">
      <h2 class="flex items-center gap-2 font-semibold"><UIcon :name="icon" class="text-primary" />{{ title }}</h2>
      <UButton v-if="to" :to="to" icon="i-lucide-arrow-up-right" :aria-label="`Open ${title}`" color="neutral" variant="ghost" size="xs" />
    </div>
    <USkeleton v-if="pending" class="mt-5 h-20" />
    <div v-else-if="error" class="mt-5"><p class="text-sm text-error">{{ title }} could not be loaded.</p><MoleculesCopyError :message="`${title} could not be loaded.`" /></div>
    <div v-else class="mt-5 space-y-3"><p class="text-3xl font-semibold tracking-tight">{{ value }}</p><p v-if="description" class="text-sm text-muted">{{ description }}</p><slot /></div>
  </UCard>
</template>
<script setup lang="ts">
defineProps<{ title: string; icon: string; to?: string; value?: string | number; description?: string; pending?: boolean; error?: unknown }>()
</script>
