<template>
  <section class="space-y-6" :aria-label="title">
    <div class="rounded-2xl bg-elevated/50 p-5 sm:p-7">
      <div class="flex items-start gap-4">
        <UIcon :name="icon" class="mt-1 size-8 shrink-0 text-primary" />
        <div class="max-w-2xl space-y-3">
          <h2 class="text-xl font-semibold text-highlighted">{{ title }}</h2>
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
