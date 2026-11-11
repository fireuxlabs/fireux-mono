<template>
  <div v-if="section" class="workspace-surface workspace-surface--compact">
    <p class="fx-type-caption">
      Choose existing Items to add to this section. Their details and prices
      stay shared.
    </p>
    <div class="menu-editor-controls">
      <UInput
        v-model="query"
        aria-label="Search Items"
        placeholder="Search Items"
        icon="i-lucide-search"
        :disabled="busy"
      />
    </div>
    <FireState
      v-if="!catalogueReady"
      :outcome="catalogueOutcome"
      entity="Items"
      :error="catalogueError"
    />
    <FireState
      v-else-if="!['ready', 'empty'].includes(itemsOutcome)"
      :outcome="itemsOutcome"
      entity="Section Items"
      :error="itemsError"
    />
    <template v-else>
      <UCheckboxGroup
        v-if="visible.length"
        v-model="selected"
        :items="
          visible.map((item) => ({
            value: item.id,
            label: item.name,
            description: item.description || undefined,
          }))
        "
        legend="Items to add"
        :disabled="busy || !canWrite"
        class="menu-item-picker"
      />
      <p v-else>
        No matching Items available to add. Try another search or create a new
        Item.
      </p>
      <UButton
        :label="
          selectedIds.length
            ? `Add ${selectedIds.length} ${selectedIds.length === 1 ? 'Item' : 'Items'}`
            : 'Select Items to add'
        "
        icon="i-lucide-plus"
        :loading="busy"
        :disabled="!canAdd"
        @click="addSelected"
      />
    </template>
    <FireCopyError v-if="error" :message="error" />
  </div>
</template>
<script setup lang="ts">
import { useMenuSection } from '../../../../../../menu/composables/useMenuSection'
import { useMenuSectionItemSelection } from '../../../../../composables/workspace/menus/useMenuSectionItemSelection'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
const context = useMenuSection()
const { section, canWrite } = context
const {
  query,
  selected,
  busy,
  error,
  visible,
  selectedIds,
  canAdd,
  catalogueReady,
  catalogueOutcome,
  catalogueError,
  itemsOutcome,
  itemsError,
  add,
} = useMenuSectionItemSelection(context)
const toast = useToastify()
async function addSelected() {
  const count = await add()
  if (count)
    toast.add({
      title: `${count} ${count === 1 ? 'Item' : 'Items'} added to section`,
      color: 'success',
      icon: 'i-lucide-check',
    })
}
</script>
<style scoped>
.menu-item-picker {
  max-block-size: 22rem;
  overflow-y: auto;
  padding: calc(var(--spacing) * 2);
}
</style>
