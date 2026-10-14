<template>
  <UCard data-testid="success-preview">
    <div class="space-y-4 text-center">
      <div
        class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <UIcon :name="view.icon" class="size-6" aria-hidden="true" />
      </div>
      <h3 class="text-xl font-semibold">{{ view.title }}</h3>
      <p class="text-sm leading-relaxed text-muted">{{ view.message }}</p>
      <UButton :label="view.action" block />
    </div>
  </UCard>
</template>
<script setup lang="ts">
defineProps<{
  view: { title: string; message: string; action: string; icon: string }
}>()
</script>
