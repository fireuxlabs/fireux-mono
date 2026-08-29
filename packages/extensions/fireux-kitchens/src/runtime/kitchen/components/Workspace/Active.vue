<template>
  <section aria-label="Active Kitchen">
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

    <UCard v-else variant="subtle">
      <div class="flex items-center gap-3">
        <UAvatar
          :src="kitchen.url || undefined"
          :alt="kitchen.name"
          size="lg"
        />
        <div class="min-w-0">
          <p class="m-0 truncate font-medium text-highlighted">
            {{ kitchen.name }}
          </p>
          <p class="m-0 truncate text-sm text-muted">
            {{ kitchen.tagline }}
          </p>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { KitchenWorkspaceIndexState } from '../../composables/workspace/index/useKitchenWorkspaceIndex'

defineProps<{
  kitchen: KitchenWorkspaceIndexState['kitchen']
}>()
</script>
