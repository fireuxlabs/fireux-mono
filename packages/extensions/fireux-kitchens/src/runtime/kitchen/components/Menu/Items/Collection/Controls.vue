<template>
  <WorkspacePageHeader
    title="Items"
    description="Manage items across your menus."
    variant="child"
  >
    <template #actions>
      <UButton
        v-if="!readOnly && ['ready', 'empty'].includes(outcome)"
        label="Add item"
        icon="i-lucide-plus"
        @click="emit('create', 'food')"
      />
    </template>
  </WorkspacePageHeader>

  <slot name="intro" />

  <WorkspaceKitchenCollectionToolbar
    v-if="outcome === 'ready' || outcome === 'empty'"
    v-model="query"
    :label="catalogue.plural"
    :singular="catalogue.singular"
    :count="visibleItems.length"
  >
    <template #controls>
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
import { useKitchenItemsContext } from '../../../../composables/workspace/items/useKitchenItemsContext'
import { useItemCatalogueContext } from '../../../../composables/workspace/items/useItemCatalogue'
const { catalogue, readOnly, outcome } = useKitchenItemsContext()
const { query, view, visibleItems } = useItemCatalogueContext()
const emit = defineEmits<{
  create: [kind: 'food' | 'drink']
}>()
</script>
