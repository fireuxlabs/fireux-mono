<template>
  <LandingConsolePreviewFrame
    :model-value="selectedSurfaceId"
    :items="operations"
    :secondary-items="[financeSurface]"
    label="Interactive Kitchen Console preview"
    navigation-label="Kitchen Operations"
    secondary-label="Reports"
    secondary-navigation-label="Kitchen reports"
    console-to="/console/kitchen"
    :open-console-aria-label="`Open the full ${consoleKitchenPill.title} Kitchen Console`"
    @update:model-value="selectSurface"
    @open-console="openFullKitchenConsole"
  >
    <template #target>
      <UAvatar
        :src="consoleKitchenPill.imageUrl || undefined"
        :alt="consoleKitchenPill.title"
        icon="i-lucide-cooking-pot"
        size="md"
        :title="consoleKitchenPill.title"
      />
    </template>

    <MiseboxLandingConsolePreviewMenus
      v-if="selectedSurface?.id === 'kitchen.menus'"
      :key="selectedSurface.id"
      :menus="productDemo?.console.menus || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingConsolePreviewDishes
      v-else-if="selectedSurface?.id === 'kitchen.dishes'"
      :key="selectedSurface.id"
      :dishes="previewDishes"
      :dish="selectedDish"
      :page="selectedDishPage"
      :error="Boolean(productDemoError)"
      @select="selectDish"
      @select-page="selectedDishPage = $event"
      @show-collection="clearSelectedDish"
      @show-detail="selectedDishPage = 'detail'"
    />
    <MiseboxLandingConsolePreviewIngredients
      v-else-if="selectedSurface?.id === 'kitchen.ingredients'"
      :key="selectedSurface.id"
      :ingredients="productDemo?.console.ingredients || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingConsolePreviewRecipes
      v-else-if="selectedSurface?.id === 'kitchen.recipes'"
      :key="selectedSurface.id"
      :recipes="productDemo?.console.recipes || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingConsolePreviewMise
      v-else-if="selectedSurface?.id === 'kitchen.mise'"
      :key="selectedSurface.id"
      :kitchen-name="productDemo?.console.kitchenName || ''"
      :tasks="consoleMiseTasks"
    />
    <MiseboxLandingConsolePreviewOrders
      v-else-if="selectedSurface?.id === 'kitchen.orders'"
      :key="selectedSurface.id"
      :kitchen-name="productDemo?.console.kitchenName || ''"
      :orders="productDemo?.console.orders || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingConsolePreviewStations
      v-else-if="selectedSurface?.id === 'kitchen.stations'"
      :key="selectedSurface.id"
      :stations="productDemo?.console.stations || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingConsolePreviewSuppliers
      v-else-if="selectedSurface?.id === 'kitchen.suppliers'"
      :key="selectedSurface.id"
      :suppliers="productDemo?.console.suppliers || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingConsolePreviewTables
      v-else-if="selectedSurface?.id === 'kitchen.tables'"
      :key="selectedSurface.id"
      :tables="productDemo?.console.tables || emptyTables"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingConsolePreviewFinance
      v-else-if="selectedSurface?.id === financeSurface.id"
      :key="selectedSurface.id"
      :finance="productDemo?.console.finance || emptyFinance"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingConsolePreviewEmptyCanvas
      v-else-if="selectedSurface"
      :key="selectedSurface.id"
      :title="selectedSurface.title"
    />
  </LandingConsolePreviewFrame>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed, ref } from 'vue'
import { kitchenOperations } from 'fireux-kitchens/runtime/content/operations'
import { useKitchenConsoleSelection } from 'fireux-kitchens/runtime/composables/fireux/console/kitchen/core/useKitchenConsoleSelection'
import { useKitchenMenuServiceSelection } from 'fireux-kitchens/runtime/composables/fireux/kitchen/useKitchenMenuServiceSelection'
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'
import type { DishChildPage } from './Dishes/types'
import MiseboxLandingConsolePreviewFinance from './Finance.vue'
import MiseboxLandingConsolePreviewOrders from './Orders.vue'
import MiseboxLandingConsolePreviewStations from './Stations.vue'
import MiseboxLandingConsolePreviewSuppliers from './Suppliers.vue'
import MiseboxLandingConsolePreviewTables from './Tables.vue'

const operations = kitchenOperations
const financeSurface = {
  id: 'kitchen.finance',
  title: 'Finance',
  icon: 'i-lucide-chart-line',
} as const
const emptyFinance: MiseboxProductDemo['console']['finance'] = {
  periods: [],
}
const emptyTables: MiseboxProductDemo['console']['tables'] = {
  configuredCount: 0,
}
type ProductDemoMenu = MiseboxProductDemo['console']['menus'][number]
type ProductDemoDish = MiseboxProductDemo['console']['dishes'][number]
type ProductDemoMiseTask = MiseboxProductDemo['console']['miseTasks'][number]
const selectedSurfaceId = defineModel<string>('surfaceId', {
  default: 'kitchen.dishes',
})
const selectedDishId = ref('')
const selectedDishPage = ref<DishChildPage>('detail')
const selectedSurface = computed(() => {
  if (selectedSurfaceId.value === financeSurface.id) return financeSurface

  return operations.find(
    operation => operation.id === selectedSurfaceId.value
  ) || operations[0]
})
const {
  data: productDemo,
  error: productDemoError,
} = await useMiseboxProductDemo()
const consoleKitchenId = computed(() =>
  productDemo.value?.console.kitchenId || 'deanos'
)
const {
  setKitchenConsoleSelection,
} = useKitchenConsoleSelection()
const {
  hasInServiceMenu,
} = useKitchenMenuServiceSelection(
  consoleKitchenId,
  () => (productDemo.value?.console.menus ?? []).map(
    (menu: ProductDemoMenu) => ({
      id: menu.id,
      defaultInService: menu.defaultInService,
    })
  )
)
const consoleMiseTasks = computed(() =>
  (productDemo.value?.console.miseTasks ?? []).filter(
    (task: ProductDemoMiseTask) =>
    !task.menuIds.length || hasInServiceMenu(task.menuIds)
  )
)
const previewDishes = computed(() =>
  (productDemo.value?.console.dishes ?? []).filter(
    (dish: ProductDemoDish) => dish.kind !== 'Drink'
  )
)
const consoleKitchenPill = computed<
  MiseboxProductDemo['console']['kitchenPill']
>(() =>
  productDemo.value?.console.kitchenPill || {
    title: 'Deanos',
    subtitle: '',
    imageUrl: '',
    imageShade: 'none',
  }
)
const selectedDish = computed(() =>
  previewDishes.value.find(
    (dish: ProductDemoDish) => dish.id === selectedDishId.value
  )
  || null
)
const selectDish = (dishId: string) => {
  selectedDishId.value = dishId
  selectedDishPage.value = 'detail'
}
const clearSelectedDish = () => {
  selectedDishId.value = ''
  selectedDishPage.value = 'detail'
}
const selectSurface = (surfaceId: string) => {
  selectedSurfaceId.value = surfaceId
  clearSelectedDish()
}
const openFullKitchenConsole = async (event: MouseEvent) => {
  event.preventDefault()
  setKitchenConsoleSelection({
    kitchenId: consoleKitchenId.value,
    type: 'demo',
  })
  await navigateTo('/console/kitchen')
}
</script>
