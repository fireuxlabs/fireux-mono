<template>
  <section aria-labelledby="kitchen-activity-title">
    <h2 id="kitchen-activity-title" class="mb-3 text-lg font-semibold">
      Working areas
    </h2>
    <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      <Summary
        title="Orders"
        icon="i-lucide-receipt"
        to="/workspace/kitchen/orders"
        :value="value(orders, activeOrders)"
        :pending="pending(orders)"
        :error="failed(orders)"
        :description="
          settled(orders)
            ? `${incomingOrders} awaiting acceptance · active orders shown`
            : ''
        "
      />
      <Summary
        title="Menus"
        icon="i-lucide-book-open"
        to="/workspace/kitchen/menus"
        :value="value(menus, menus.activeMenus.value.length)"
        :pending="pending(menus)"
        :error="failed(menus)"
        :description="
          settled(menus)
            ? `${menus.publishedMenus.value.length} published · unarchived menus shown`
            : ''
        "
      />
      <Summary
        title="Food & drinks"
        icon="i-lucide-utensils"
        to="/workspace/kitchen/food/dishes"
        :value="value(dishes)"
        :pending="pending(dishes)"
        :error="failed(dishes)"
        description="Dish records"
      />
      <Summary
        title="Recipes"
        icon="i-lucide-notebook-pen"
        to="/workspace/kitchen/food/recipes"
        :value="value(recipes)"
        :pending="pending(recipes)"
        :error="failed(recipes)"
        description="Recipe records"
      />
      <Summary
        title="Ingredients"
        icon="i-lucide-carrot"
        to="/workspace/kitchen/food/ingredients"
        :value="value(ingredients)"
        :pending="pending(ingredients)"
        :error="failed(ingredients)"
        description="Kitchen ingredient associations"
      />
      <Summary
        title="Stations"
        icon="i-lucide-chef-hat"
        to="/workspace/kitchen/stations"
        :value="value(stations)"
        :pending="pending(stations)"
        :error="failed(stations)"
        description="Saved station definitions"
      />
      <Summary
        title="Suppliers"
        icon="i-lucide-truck"
        to="/workspace/kitchen/stock/suppliers"
        :value="value(suppliers)"
        :pending="pending(suppliers)"
        :error="failed(suppliers)"
        description="Kitchen supplier associations"
      />
      <Summary
        title="Waste observations"
        icon="i-lucide-trash-2"
        to="/workspace/kitchen/stock/waste"
        :value="value(waste)"
        :pending="pending(waste)"
        :error="failed(waste)"
        description="Recorded observations; not stock reconciliation"
      />
      <Summary
        title="Completed sales today"
        icon="i-lucide-chart-no-axes-combined"
        to="/workspace/kitchen/reports/finance"
        :value="sales.report.value?.sale_count ?? '—'"
        :pending="sales.outcome.value === 'pending'"
        :error="sales.outcome.value === 'error'"
        description="Completed sales, not payment receipts"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, type Ref } from 'vue'
import Summary from 'fireux-core/runtime/components/Workspace/Overview/Summary.vue'
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useKitchenOrderFetch } from '../../../composables/orders/useKitchenOrderFetch'
import { deriveKitchenOrderBoardStage } from '../../../models/order-lifecycle.model'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
import { useKitchenDishCollection } from '../../../composables/useKitchenDishCollection'
import { useKitchenRecipeCollection } from '../../../composables/useKitchenRecipeCollection'
import { useKitchenStationCollection } from '../../../composables/useKitchenStationCollection'
import { useKitchenChildCollection } from '../../../composables/useKitchenChildCollection'
import { KitchenIngredientStorage } from '../../../utils/kitchen-ingredient'
import { SupplierStorage } from 'fireux-suppliers/runtime/supplier/models/Supplier.model'
import { KitchenWasteEventStorage } from '../../../utils/waste-event'
import { useKitchenWorkspaceFinance } from '../../../composables/workspace/overview/useKitchenWorkspaceFinance'
const workspace = useKitchenWorkspace()
const id = computed(() =>
  workspace.outcome.value === 'ready' ? workspace.id.value : ''
)
const options = { kitchenCollectionPath: 'kitchens' }
const orders = useKitchenOrderFetch(id, options)
const menus = useKitchenMenuCollection(id, options)
const dishes = useKitchenDishCollection(id, options)
const recipes = useKitchenRecipeCollection(id, options)
const stations = useKitchenStationCollection(id, options)
const ingredients = useKitchenChildCollection(
  KitchenIngredientStorage.collection,
  id,
  options
)
const suppliers = useKitchenChildCollection(
  SupplierStorage.collection,
  id,
  options
)
const waste = useKitchenChildCollection(
  KitchenWasteEventStorage.collection,
  id,
  options
)
const sales = useKitchenWorkspaceFinance()
type CountSource = {
  count: Readonly<Ref<number>>
  outcome: Readonly<Ref<string>>
}
const outcome = (source: CountSource) =>
  workspace.outcome.value === 'ready'
    ? source.outcome.value
    : workspace.outcome.value
const settled = (source: CountSource) =>
  ['ready', 'empty'].includes(outcome(source))
const value = (source: CountSource, count = source.count.value) =>
  settled(source) ? count : '—'
const pending = (source: CountSource) => outcome(source) === 'pending'
const failed = (source: CountSource) => outcome(source) === 'error'
const activeOrders = computed(() =>
  settled(orders)
    ? orders.orders.value.filter((order) =>
        ['payment', 'incoming', 'scheduled', 'queue', 'pass'].includes(
          deriveKitchenOrderBoardStage(order)
        )
      ).length
    : 0
)
const incomingOrders = computed(() =>
  settled(orders)
    ? orders.orders.value.filter(
        (order) => deriveKitchenOrderBoardStage(order) === 'incoming'
      ).length
    : 0
)
</script>
