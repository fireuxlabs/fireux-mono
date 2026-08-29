<template>
  <section aria-label="Kitchen">
    <div
      v-if="!kitchen.name && !kitchen.tagline && !kitchen.url"
      class="flex items-center gap-4"
    >
      <USkeleton class="size-12 rounded-full" />
      <div class="grid gap-2">
        <USkeleton class="h-4 w-[250px]" />
        <USkeleton class="h-4 w-[200px]" />
      </div>
    </div>

    <UUser
      v-else
      :name="kitchen.name"
      :description="kitchen.tagline"
      :avatar="{
        src: kitchen.url || undefined,
        alt: kitchen.name,
        icon: 'i-lucide-chef-hat',
      }"
      size="lg"
    />
  </section>
</template>

<script setup lang="ts">
import type { KitchenWorkspaceIndexState } from '../../composables/workspace/index/useKitchenWorkspaceIndex'

defineProps<{
  kitchen: Pick<
    KitchenWorkspaceIndexState['kitchen'],
    'name' | 'tagline' | 'url'
  >
}>()
</script>
