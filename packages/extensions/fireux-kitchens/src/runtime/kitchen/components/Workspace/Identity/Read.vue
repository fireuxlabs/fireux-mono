<template>
  <div class="space-y-6">
    <UPageCard
      v-if="!kitchenId"
      title="No kitchen selected"
      description="Select a kitchen to view its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="outcome === 'pending'"
      title="Loading kitchen identity"
      description="Reading the selected kitchen."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!selectedKitchen"
      title="Kitchen unavailable"
      description="The selected kitchen could not be read."
      variant="subtle"
    />

    <UCard v-else>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div class="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-default bg-muted text-2xl font-semibold text-muted">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="name || 'Kitchen'"
            class="size-full object-cover"
          />
          <span v-else>{{ initials }}</span>
        </div>

        <div class="min-w-0">
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ name || 'Untitled kitchen' }}
          </h2>
          <p v-if="tagline" class="mt-1 text-sm text-dimmed">{{ tagline }}</p>
          <p v-if="address" class="mt-2 text-sm text-toned">{{ address }}</p>
          <p v-if="slug" class="mt-2 text-xs text-muted">{{ slug }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceIdentity } from '../../../composables/workspace/identity/useKitchenWorkspaceIdentity'

const {
  selectedKitchen,
  kitchenId,
  outcome,
  name,
  tagline,
  imageUrl,
  slug,
  address,
} = useKitchenWorkspaceIdentity()

const initials = computed(() => {
  const parts = name.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'K'
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
})
</script>
