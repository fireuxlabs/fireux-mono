<template>
  <section class="dish-workspace">
    <NuxtLink v-if="!menuReturn" :to="catalogueReturn"
      ><UIcon name="i-lucide-arrow-left" />Items</NuxtLink
    >
    <NuxtLink v-if="menuReturn" :to="menuReturn"
      >← Back to Menu section</NuxtLink
    >
    <UAlert
      v-if="outcome === 'idle'"
      color="neutral"
      title="Select a kitchen"
      description="Choose a Kitchen before viewing its Items."
    />
    <FireStateCard
      v-else-if="error"
      state="error"
      :title="`${catalogue.singular} unavailable`"
      description="This record could not be loaded. Please try again."
    />
    <p v-else-if="pending" role="status">Loading {{ catalogue.singular }}…</p>
    <UAlert
      v-else-if="!dish"
      color="neutral"
      :title="`${catalogue.singular} not found`"
    />
    <template v-else>
      <header class="dish-header">
        <KitchenMenuItemsPhoto
          :src="dish.image"
          :alt="dish.name"
          class="dish-image"
        />
        <div>
          <p>{{ selectedKitchen?.name }}</p>
          <h1>
            {{ dish.name }}
          </h1>
        </div>
        <UButton
          v-if="canWrite"
          icon="i-lucide-settings-2"
          label="Item actions"
          color="neutral"
          variant="outline"
          @click="manage = true"
        />
      </header>
      <nav aria-label="Item views" class="dish-tabs">
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
      <template v-if="view === 'details'">
        <KitchenMenuItemsEdit />
        <KitchenMenuItemsPricing />
      </template>
      <template v-if="view === 'preparation' && dish">
        <KitchenMenuItemsPreparationStations
          :dish="dish"
          :kitchen-id="kitchenId"
          :can-write="canWrite"
        />
      </template>
      <DishMenus v-if="view === 'menus'" />
      <UModal
        v-model:open="manage"
        title="Item actions"
        description="Manage this item record."
      >
        <template #body
          ><KitchenMenuItemsDelete :remove="removeDish"
        /></template>
      </UModal>
    </template>
    <DishSpec
      v-if="
        view === 'preparation' &&
        storageKitchenId &&
        dishId &&
        outcome !== 'empty'
      "
    />
    <FireDisclosurePanel
      v-if="view === 'preparation' && dish"
      title="Preparation requirements"
      :default-open="false"
      ><DishPreparation
    /></FireDisclosurePanel>
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
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
const workspace = useKitchenWorkspace()
const { catalogue } = useKitchenDishesContext()
const selectedKitchen = workspace.data
import { computed, ref } from 'vue'
import { dishCatalogueReturn } from '../../../../utils/dish-catalogue-route'
import { useRoute, navigateTo } from '#imports'
import { useDishDelete } from '../../../../composables/dish/useDishDelete'
import { useDishEditorScope } from '../../../../composables/dish/useDishEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import DishSpec from '../Spec.vue'
import DishMenus from '../Menus.vue'
import DishPreparation from '../Preparation.vue'
import { provideKitchenItemDetail } from '../../../../composables/dish/useKitchenItemDetailContext'
import { useKitchenDishDetail } from '../../../../composables/dish/useKitchenDishDetail'
const {
  dish,
  dishId,
  kitchenId,
  storageKitchenId,
  pending,
  error,
  outcome,
  canWrite,
} = provideKitchenItemDetail(
  useKitchenDishDetail(
    () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
    useRouteParam('dishId')
  )
)
const route = useRoute()
const manage = ref(false)
const { deleteDish } = useDishDelete([
  kitchenId,
  dishId,
  () => route.fullPath,
  canWrite,
])
const toast = useToastify()
const captureIntent = useDishEditorScope(
  [kitchenId, dishId, () => route.fullPath],
  () => {
    manage.value = false
  }
)
async function removeDish() {
  if (!canWrite.value || !dish.value) throw new Error('This Dish is read-only.')
  const isCurrent = captureIntent()
  const targetId = dishId.value,
    targetKitchen = kitchenId.value
  const destination = catalogue.path,
    label = catalogue.singular
  await deleteDish(targetId, { kitchenId: targetKitchen })
  if (!isCurrent()) return
  toast.add({ title: `${label} deleted`, icon: 'i-heroicons-check-circle' })
  await navigateTo(destination)
}
const catalogueReturn = computed(() => dishCatalogueReturn(route.query))
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
  { id: 'preparation', label: 'Preparation', icon: 'i-lucide-list-checks' },
  { id: 'menus', label: 'Appears on', icon: 'i-lucide-calendar-days' },
]
const view = computed(() =>
  route.query.view === 'pricing'
    ? 'details'
    : route.query.view === 'spec'
      ? 'preparation'
      : views.some((item) => item.id === route.query.view)
        ? String(route.query.view)
        : 'details'
)
</script>
<style scoped>
.dish-workspace {
  display: grid;
  gap: 1.75rem;
  max-width: 80rem;
  margin-inline: auto;
  padding-bottom: 2rem;
}
.dish-header {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}
.dish-image {
  width: 5rem;
  height: 5rem;
  border-radius: 1.25rem;
  flex-shrink: 0;
}
.dish-tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  border-bottom: 1px solid var(--ui-border);
  padding-bottom: 0.75rem;
}
.dish-tabs > * {
  flex-shrink: 0;
}
@media (max-width: 640px) {
  .dish-header {
    gap: 1rem;
  }
  .dish-image {
    width: 3.5rem;
    height: 3.5rem;
  }
}
</style>
