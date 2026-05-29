<template>
  <a
    :href="brand.url"
    target="_blank"
    rel="noopener"
    class="ml-auto inline-flex w-fit items-center gap-3 rounded-md border border-default bg-default px-3 py-2 text-sm font-semibold text-highlighted shadow-sm transition hover:border-primary hover:text-primary"
    :aria-label="`Powered by ${brand.name}`"
  >
    <img
      v-if="brand.logo_url"
      :src="brand.logo_url"
      :alt="brand.name"
      class="size-7 rounded-md"
    >
    <span class="leading-tight">
      <span class="block text-[0.65rem] font-medium uppercase tracking-wide text-muted">
        Powered by
      </span>
      <span>{{ brand.name }}</span>
    </span>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  brand: {
    name: string
    url: string
    logo_url?: string
  }
}>()
</script>
