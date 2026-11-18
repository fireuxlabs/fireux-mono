<template>
  <section class="item-workspace">
    <UAlert
      v-if="outcome === 'idle'"
      color="neutral"
      title="Select a kitchen"
      description="Choose a Kitchen before viewing its Items."
    />
    <UAlert
      v-else-if="error"
      title="Item unavailable"
      description="This record could not be loaded. Please try again."
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          :message="
            [
              `Item unavailable`,
              'This record could not be loaded. Please try again.',
            ]
              .filter(Boolean)
              .join('\n')
          "
        />
      </template>
    </UAlert>
    <p v-else-if="pending" role="status">Loading Item…</p>
    <UAlert v-else-if="!item" color="neutral" title="Item not found" />
    <template v-else>
      <WorkspacePageHeader :title="item.name" variant="child">
        <template #actions>
          <UButton
            :to="menuReturn || catalogueReturn"
            :label="menuReturn ? 'Back to Menu section' : 'Back to Items'"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
          />
          <UButton
            v-if="canWrite"
            icon="i-lucide-ellipsis"
            aria-label="Item actions"
            color="neutral"
            variant="ghost"
            @click="manage = true"
          />
        </template>
      </WorkspacePageHeader>
      <WorkspaceKitchenAIFocus
        focus="kitchen-ai.menu.items"
        label="Items"
        context-label="Menu"
      />
      <nav aria-label="Item views" class="item-tabs">
        <UButton
          v-for="item in views"
          :key="item.id"
          :to="{ query: { ...route.query, view: item.id } }"
          :icon="item.icon"
          :label="item.label"
          :color="view === item.id ? 'primary' : 'neutral'"
          :variant="view === item.id ? 'soft' : 'ghost'"
          :aria-current="view === item.id ? 'page' : undefined"
        />
      </nav>
      <div
        v-if="view === 'details'"
        class="workspace-surface__grid workspace-surface__grid--2 item-details-panels"
      >
        <KitchenMenuItemsEdit />
        <KitchenMenuItemsPricing />
      </div>
      <ItemMenus v-if="view === 'menus'" />
      <UModal v-model:open="manage" title="Item actions">
        <template #body
          ><KitchenMenuItemsDelete :remove="removeItem" />
        </template>
      </UModal>
    </template>
    <FireDisclosurePanel
      v-if="item && canWrite"
      title="Item AI context"
      :default-open="false"
    >
      <FireContextRecord
        v-if="item && canWrite"
        :key="`${kitchenId}/${itemId}`"
        title="Item AI context"
        endpoint="/api/workspace/kitchen/context"
        :scope="{ kitchenId, subject: 'dish', recordId: itemId }"
      />
    </FireDisclosurePanel>
  </section>
</template>
<script setup lang="ts">
import { useKitchenWorkspace } from '../../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const workspace = useKitchenWorkspace()
import { computed, ref, watchEffect } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { itemCatalogueReturn } from '../../../../utils/item-catalogue-route'
import { useRoute, navigateTo } from '#imports'
import { useItemDelete } from '../../../../composables/items/useItemDelete'
import { useItemEditorScope } from '../../../../composables/items/useItemEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import ItemMenus from '../Menus.vue'
import { provideKitchenItemContext } from '../../../../composables/items/useKitchenItemContext'
import { useKitchenItemRead } from '../../../../composables/items/useKitchenItemRead'
const {
  item,
  itemId,
  offer,
  offerError,
  kitchenId,
  pending,
  error,
  outcome,
  canWrite,
} = provideKitchenItemContext(
  useKitchenItemRead(
    () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
    useRouteParam('dishId')
  )
)
const route = useRoute()
const manage = ref(false)
const { deleteItem } = useItemDelete([
  kitchenId,
  itemId,
  () => route.fullPath,
  canWrite,
])
const toast = useToastify()
const captureIntent = useItemEditorScope(
  [kitchenId, itemId, () => route.fullPath],
  () => {
    manage.value = false
  }
)
async function removeItem() {
  if (!canWrite.value || !item.value) throw new Error('This Item is read-only.')
  const isCurrent = captureIntent()
  const targetId = itemId.value,
    targetKitchen = kitchenId.value
  const destination = '/workspace/kitchen/menu/items',
    label = 'Item'
  await deleteItem(targetId, { kitchenId: targetKitchen })
  if (!isCurrent()) return
  toast.add({ title: `${label} deleted`, icon: 'i-heroicons-check-circle' })
  await navigateTo(destination)
}
const catalogueReturn = computed(() => itemCatalogueReturn(route.query))
const menuReturn = computed(() =>
  typeof route.query.menu === 'string' &&
  typeof route.query.section === 'string'
    ? route.query.inline === '1'
      ? `/workspace/kitchen/menu/${encodeURIComponent(route.query.menu)}?section=${encodeURIComponent(route.query.section)}`
      : `/workspace/kitchen/menu/${encodeURIComponent(route.query.menu)}/${encodeURIComponent(route.query.section)}`
    : ''
)
const views = [
  { id: 'details', label: 'Details', icon: 'i-lucide-info' },
  { id: 'menus', label: 'Appears on', icon: 'i-lucide-calendar-days' },
]
const view = computed(() =>
  route.query.view === 'menus' ? 'menus' : 'details'
)
const pageState = useWorkspacePageState('kitchen')
watchEffect(() => {
  pageState.publish({
    item: item.value,
    selling: offer.value,
    derived: {
      outcome: outcome.value,
      canWrite: canWrite.value,
      view: view.value,
      sellingReadable: !offerError.value,
    },
  })
})
</script>
<style scoped>
.item-workspace {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
}
.item-details-panels {
  align-items: start;
}
.item-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing);
}
</style>
