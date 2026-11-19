<template>
  <WorkspaceKitchenCollectionToolbar
    v-if="ready"
    v-model="query"
    :label="catalogue.plural"
    :singular="catalogue.singular"
    :count="visibleItems.length"
  >
    <template #filters>
      <USelect
        v-model="kind"
        :items="kindFilters"
        value-key="value"
        label-key="label"
        aria-label="Item type"
      />
    </template>
    <template #controls>
      <UButton
        v-if="canCreate"
        label="Add item"
        icon="i-lucide-plus"
        @click="openCreate()"
      />
      <UTooltip :text="view === 'grid' ? 'Show list' : 'Show image grid'">
        <UButton
          icon="i-lucide-layout-grid"
          color="neutral"
          :variant="view === 'grid' ? 'soft' : 'ghost'"
          aria-label="Image grid"
          :aria-pressed="view === 'grid'"
          @click="view = view === 'grid' ? 'list' : 'grid'"
        />
      </UTooltip>
    </template>
  </WorkspaceKitchenCollectionToolbar>
</template>

<script setup lang="ts">
import { useItemCatalogueContext } from '../../../../../composables/workspace/menu/items/useItemCatalogue'
const {
  catalogue,
  ready,
  canCreate,
  openCreate,
  query,
  kind,
  kindFilters,
  view,
  visibleItems,
} = useItemCatalogueContext()
</script>
