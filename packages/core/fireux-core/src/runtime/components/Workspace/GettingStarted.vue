<template>
  <section class="space-y-4" :aria-label="title">
    <div class="rounded-2xl bg-elevated/50 p-5 ring-1 ring-default sm:p-6">
      <div class="flex items-start gap-4">
        <UIcon :name="icon" class="mt-1 size-6 shrink-0 text-primary" />
        <div class="max-w-2xl space-y-2">
          <h2 class="text-lg font-semibold text-highlighted">{{ title }}</h2>
          <p class="text-sm leading-6 text-muted">{{ description }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </div>
    <slot />
  </section>
</template>
<script setup lang="ts">
defineProps<{ title: string; description: string; icon: string }>()
</script>
