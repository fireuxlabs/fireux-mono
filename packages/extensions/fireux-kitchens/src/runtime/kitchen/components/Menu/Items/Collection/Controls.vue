<template>
  <WorkspacePageHeader
    title="Items"
    description="Manage items across your menus."
    variant="child"
  >
    <template #actions>
      <WorkspaceKitchenAICapabilityInfo capability="dishes" />
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
    :count="visibleDishes.length"
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
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
import { useDishCatalogueContext } from '../../../../composables/workspace/dishes/useDishCatalogue'
const { catalogue, readOnly, outcome } = useKitchenDishesContext()
const { query, view, visibleDishes } = useDishCatalogueContext()
const emit = defineEmits<{
  create: [kind: 'food' | 'drink']
}>()
</script>
