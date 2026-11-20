<template>
  <UButton
    v-if="item && canWrite"
    label="Edit item"
    icon="i-lucide-pencil"
    color="neutral"
    variant="soft"
    @click="action = 'edit'"
  />
  <UDropdownMenu v-if="item && canWrite" :items="secondaryActions">
    <UButton
      aria-label="More item actions"
      icon="i-lucide-ellipsis"
      color="neutral"
      variant="ghost"
    />
  </UDropdownMenu>
  <USlideover
    :open="action !== null"
    :title="
      action === 'remove' ? `Delete ${item?.name || 'item'}?` : 'Edit item'
    "
    :description="
      action === 'remove' ? 'Deleting this item is permanent.' : item?.name
    "
    @update:open="close"
  >
    <template #body>
      <UTabs
        v-if="action === 'edit' && canWrite"
        :items="editTabs"
        :unmount-on-hide="false"
        variant="link"
        color="neutral"
        :ui="{ content: 'item-edit-panel' }"
      >
        <template #details><ItemEdit /></template>
        <template #pricing><ItemPricing /></template>
      </UTabs>
      <ItemDelete v-else-if="action === 'remove'" :remove="removeItem" />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useItemActions } from '../../../../../composables/items/useItemActions'
import { itemCatalogueReturn } from '../../../../../utils/item-catalogue-route'
import ItemDelete from '../Delete.vue'
import ItemEdit from '../Edit/Index.vue'
import ItemPricing from '../Pricing.vue'
import { useItemEditorScope } from '../../../../../composables/items/useItemEditorScope'
import { useKitchenItemContext } from '../../../../../composables/items/useKitchenItemContext'

const { item, kitchenId, itemId, canWrite } = useKitchenItemContext()
const route = useRoute()
const action = ref<'edit' | 'remove' | null>(null)
const editTabs = [
  { label: 'Details', slot: 'details' },
  { label: 'Default price & choices', slot: 'pricing' },
]
const secondaryActions = [
  {
    label: 'Delete item',
    icon: 'i-lucide-trash-2',
    onSelect: () => {
      action.value = 'remove'
    },
  },
]
const scopeSources = [kitchenId, itemId, () => route.fullPath]
const { deleteItem } = useItemActions([...scopeSources, canWrite])
const deleting = ref(false)
const captureScope = useItemEditorScope(scopeSources, () => {
  deleting.value = false
  close(false)
})

async function removeItem() {
  if (!item.value || !canWrite.value || deleting.value) return
  const isCurrent = captureScope()
  const destination = itemCatalogueReturn(route.query)
  deleting.value = true
  try {
    await deleteItem(itemId.value, { kitchenId: kitchenId.value })
    if (isCurrent()) await navigateTo(destination)
  } finally {
    if (isCurrent()) deleting.value = false
  }
}

function close(open: boolean) {
  if (!open) action.value = null
}
watch(
  canWrite,
  (allowed) => {
    if (!allowed) close(false)
  },
  { flush: 'sync' }
)
</script>

<style scoped>
:deep(.item-edit-panel) {
  padding-block-start: calc(var(--spacing) * 4);
}
</style>
