<template>
  <section aria-label="Current Supplier">
    <div v-if="derived.outcome === 'pending'" class="flex items-center gap-4">
      <USkeleton class="size-12 rounded-full" />
      <div class="grid gap-2">
        <USkeleton class="h-4 w-64" />
        <USkeleton class="h-4 w-48" />
      </div>
    </div>
    <UUser
      v-else-if="derived.hasSelection"
      :name="state.supplier.name"
      :description="state.supplier.tagline"
      :avatar="{
        src: state.supplier.url || undefined,
        alt: state.supplier.name,
        icon: 'i-lucide-truck',
      }"
      size="lg"
    />
  </section>
</template>

<script setup lang="ts">
import type {
  SupplierWorkspaceIndexDerived,
  SupplierWorkspaceIndexState,
} from '../../composables/workspace/index/useSupplierWorkspaceIndex'

defineProps<{
  state: SupplierWorkspaceIndexState
  derived: SupplierWorkspaceIndexDerived
}>()
</script>
