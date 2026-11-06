<template>
  <section class="space-y-4" :aria-label="title">
    <div class="p-5 sm:p-6">
      <div class="flex items-start gap-4">
        <UIcon :name="icon" class="mt-1 size-6 shrink-0" />
        <div class="max-w-2xl space-y-2">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
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
