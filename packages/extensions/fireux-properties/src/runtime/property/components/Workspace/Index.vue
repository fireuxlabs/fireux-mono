<template>
  <section aria-label="Current Property">
    <div v-if="derived.outcome === 'pending'" class="flex items-center gap-4">
      <USkeleton class="size-12 rounded-full" />
      <div class="grid gap-2">
        <USkeleton class="h-4 w-64" />
        <USkeleton class="h-4 w-48" />
      </div>
    </div>
    <UUser
      v-else-if="derived.hasSelection"
      :name="state.property.name"
      :description="state.property.tagline"
      :avatar="{
        src: state.property.url || undefined,
        alt: state.property.name,
        icon: 'i-lucide-house',
      }"
      size="lg"
    />
  </section>
</template>

<script setup lang="ts">
import type {
  PropertyWorkspaceIndexDerived,
  PropertyWorkspaceIndexState,
} from '../../composables/workspace/index/usePropertyWorkspaceIndex'

defineProps<{
  state: PropertyWorkspaceIndexState
  derived: PropertyWorkspaceIndexDerived
}>()
</script>
