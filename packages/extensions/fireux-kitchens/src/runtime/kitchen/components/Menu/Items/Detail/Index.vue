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
      :title="`${catalogue.singular} unavailable`"
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
              `${catalogue.singular} unavailable`,
              'This record could not be loaded. Please try again.',
            ]
              .filter(Boolean)
              .join('\n')
          "
        />
      </template>
    </UAlert>
    <p v-else-if="pending" role="status">Loading {{ catalogue.singular }}…</p>
    <UAlert
      v-else-if="!dish"
      color="neutral"
      :title="`${catalogue.singular} not found`"
    />
    <template v-else>
      <WorkspacePageHeader :title="dish.name" variant="child">
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
      v-if="dish && canWrite"
      title="Item AI context"
      :default-open="false"
    >
      <FireContextRecord
        v-if="dish && canWrite"
        :key="`${kitchenId}/${dishId}`"
        title="Item AI context"
        endpoint="/api/workspace/kitchen/context"
        :scope="{ kitchenId, subject: 'dish', recordId: dishId }"
      />
    </FireDisclosurePanel>
  </section>
</template>
<script setup lang="ts">
import { useKitchenWorkspace } from '../../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenItemsContext } from '../../../../composables/workspace/items/useKitchenItemsContext'
const workspace = useKitchenWorkspace()
const { catalogue } = useKitchenItemsContext()
import { computed, ref } from 'vue'
import { itemCatalogueReturn } from '../../../../utils/item-catalogue-route'
import { useRoute, navigateTo } from '#imports'
import { useItemDelete } from '../../../../composables/item/useItemDelete'
import { useItemEditorScope } from '../../../../composables/item/useItemEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import ItemMenus from '../Menus.vue'
import { provideKitchenItemContext } from '../../../../item/composables/useKitchenItemContext'
import { useKitchenItemRead } from '../../../../item/composables/useKitchenItemRead'
const {
  item: dish,
  itemId: dishId,
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
  dishId,
  () => route.fullPath,
  canWrite,
])
const toast = useToastify()
const captureIntent = useItemEditorScope(
  [kitchenId, dishId, () => route.fullPath],
  () => {
    manage.value = false
  }
)
async function removeItem() {
  if (!canWrite.value || !dish.value) throw new Error('This Item is read-only.')
  const isCurrent = captureIntent()
  const targetId = dishId.value,
    targetKitchen = kitchenId.value
  const destination = catalogue.path,
    label = catalogue.singular
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
      ? `/workspace/kitchen/menu/menus/${encodeURIComponent(route.query.menu)}?section=${encodeURIComponent(route.query.section)}`
      : `/workspace/kitchen/menu/menus/${encodeURIComponent(route.query.menu)}/${encodeURIComponent(route.query.section)}`
    : ''
)
const views = [
  { id: 'details', label: 'Details', icon: 'i-lucide-info' },
  { id: 'menus', label: 'Appears on', icon: 'i-lucide-calendar-days' },
]
const view = computed(() =>
  route.query.view === 'menus' ? 'menus' : 'details'
)
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
