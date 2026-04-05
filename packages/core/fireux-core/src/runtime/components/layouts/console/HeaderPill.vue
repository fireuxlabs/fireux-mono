<template>
  <div class="flex min-h-11 items-center gap-3 px-1">
    <UAvatar :src="imageUrl || undefined" :alt="title" size="sm" />

    <div class="min-w-0">
      <div class="truncate text-sm font-semibold text-highlighted">
        {{ title }}
      </div>
      <div v-if="subtitle" class="truncate text-xs text-toned">
        {{ subtitle }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  imageUrl?: string
  title: string
  subtitle?: string
}>()
</script>
