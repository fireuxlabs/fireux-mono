<template>
  <section class="grid gap-4 sm:grid-cols-2">
    <button
      type="button"
      class="rounded-xl border border-default bg-default p-5 text-left transition hover:border-primary hover:bg-primary/5"
      @click="emit('choose', 'search')"
    >
      <UIcon name="i-lucide-search" class="size-6 text-primary" />
      <span class="mt-4 block font-semibold text-highlighted"
        >Search for a Place</span
      >
      <span class="mt-2 block text-sm leading-6 text-muted">
        Find an existing FireUX or Google Place.
      </span>
    </button>
    <button
      type="button"
      class="rounded-xl border border-default bg-default p-5 text-left transition hover:border-primary hover:bg-primary/5"
      @click="emit('choose', 'manual')"
    >
      <UIcon name="i-lucide-pencil-line" class="size-6 text-primary" />
      <span class="mt-4 block font-semibold text-highlighted"
        >Enter manually</span
      >
      <span class="mt-2 block text-sm leading-6 text-muted">
        Create a Place that is not listed yet.
      </span>
    </button>
  </section>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (event: 'choose', method: 'search' | 'manual'): void
}>()
</script>
