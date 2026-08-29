<template>
  <section aria-label="Current Portfolio">
    <div v-if="derived.outcome === 'pending'" class="flex items-center gap-4">
      <USkeleton class="size-12 rounded-full" />
      <div class="grid gap-2">
        <USkeleton class="h-4 w-64" />
        <USkeleton class="h-4 w-48" />
      </div>
    </div>
    <UUser
      v-else-if="derived.hasSelection"
      :name="state.portfolio.name"
      :description="state.portfolio.tagline"
      :avatar="{
        src: state.portfolio.url || undefined,
        alt: state.portfolio.name,
        icon: 'i-lucide-layout-dashboard',
      }"
      size="lg"
    />
  </section>
</template>

<script setup lang="ts">
import type {
  PortfolioWorkspaceIndexDerived,
  PortfolioWorkspaceIndexState,
} from '../../composables/workspace/index/usePortfolioWorkspaceIndex'

defineProps<{
  state: PortfolioWorkspaceIndexState
  derived: PortfolioWorkspaceIndexDerived
}>()
</script>
