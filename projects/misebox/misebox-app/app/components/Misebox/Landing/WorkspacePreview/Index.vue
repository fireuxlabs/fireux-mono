<template>
  <LandingWorkspacePreviewFrame
    :model-value="selectedSurfaceId"
    :items="operations"
    label="Interactive Kitchen Workspace preview"
    navigation-label="Kitchen Operations"
    workspace-to="/"
    :open-workspace-aria-label="`Open the full ${workspaceKitchenPill.title} Kitchen Workspace`"
    @update:model-value="selectSurface"
    @open-workspace="openFullKitchenWorkspace"
  >
    <template #target>
      <UAvatar
        :src="workspaceKitchenPill.imageUrl || undefined"
        :alt="workspaceKitchenPill.title"
        icon="i-lucide-cooking-pot"
        size="md"
        :title="workspaceKitchenPill.title"
      />
    </template>

    <MiseboxLandingWorkspacePreviewMenus
      v-if="selectedSurface?.id === 'kitchen.menus'"
      :key="selectedSurface.id"
      :menus="productDemo?.workspace.menus || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingWorkspacePreviewDishes
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
    <MiseboxLandingWorkspacePreviewIngredients
      v-else-if="selectedSurface?.id === 'kitchen.ingredients'"
      :key="selectedSurface.id"
      :ingredients="productDemo?.workspace.ingredients || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingWorkspacePreviewRecipes
      v-else-if="selectedSurface?.id === 'kitchen.recipes'"
      :key="selectedSurface.id"
      :recipes="productDemo?.workspace.recipes || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingWorkspacePreviewMise
      v-else-if="selectedSurface?.id === 'kitchen.mise'"
      :key="selectedSurface.id"
      :kitchen-name="productDemo?.workspace.kitchenName || ''"
      :tasks="workspaceMiseTasks"
    />
    <MiseboxLandingWorkspacePreviewOrders
      v-else-if="selectedSurface?.id === 'kitchen.orders'"
      :key="selectedSurface.id"
      :kitchen-name="productDemo?.workspace.kitchenName || ''"
      :orders="productDemo?.workspace.orders || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingWorkspacePreviewStations
      v-else-if="selectedSurface?.id === 'kitchen.stations'"
      :key="selectedSurface.id"
      :stations="productDemo?.workspace.stations || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingWorkspacePreviewSuppliers
      v-else-if="selectedSurface?.id === 'kitchen.suppliers'"
      :key="selectedSurface.id"
      :suppliers="productDemo?.workspace.suppliers || []"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingWorkspacePreviewFinance
      v-else-if="selectedSurface?.id === 'kitchen.finance'"
      :key="selectedSurface.id"
      :finance="productDemo?.workspace.finance || emptyFinance"
      :error="Boolean(productDemoError)"
    />
    <MiseboxLandingWorkspacePreviewEmptyCanvas
      v-else-if="selectedSurface"
      :key="selectedSurface.id"
      :title="selectedSurface.title"
    />
  </LandingWorkspacePreviewFrame>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed, ref } from 'vue'
import { kitchenOperations } from 'fireux-kitchens/runtime/kitchen/models/operations'
import { useKitchenWorkspaceSelection } from 'fireux-kitchens/runtime/kitchen/composables/workspace/core/useKitchenWorkspaceSelection'
import { useKitchenMenuServiceSelection } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenMenuServiceSelection'
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'
import type { DishChildPage } from './Dishes/types'
import MiseboxLandingWorkspacePreviewFinance from './Finance.vue'
import MiseboxLandingWorkspacePreviewOrders from './Orders.vue'
import MiseboxLandingWorkspacePreviewStations from './Stations.vue'
import MiseboxLandingWorkspacePreviewSuppliers from './Suppliers.vue'

const operations = kitchenOperations
const emptyFinance: MiseboxProductDemo['workspace']['finance'] = {
  periods: [],
}
type ProductDemoMenu = MiseboxProductDemo['workspace']['menus'][number]
type ProductDemoDish = MiseboxProductDemo['workspace']['dishes'][number]
type ProductDemoMiseTask = MiseboxProductDemo['workspace']['miseTasks'][number]
const selectedSurfaceId = defineModel<string>('surfaceId', {
  default: 'kitchen.dishes',
})
const selectedDishId = ref('')
const selectedDishPage = ref<DishChildPage>('detail')
const selectedSurface = computed(() => {
  return (
    operations.find((operation) => operation.id === selectedSurfaceId.value) ||
    operations[0]
  )
})
const { data: productDemo, error: productDemoError } =
  await useMiseboxProductDemo()
const workspaceKitchenId = computed(
  () => productDemo.value?.workspace.kitchenId || 'deanos'
)
const { setKitchenWorkspaceSelection } = useKitchenWorkspaceSelection()
const { hasInServiceMenu } = useKitchenMenuServiceSelection(
  workspaceKitchenId,
  () =>
    (productDemo.value?.workspace.menus ?? []).map((menu: ProductDemoMenu) => ({
      id: menu.id,
      defaultInService: menu.defaultInService,
    }))
)
const workspaceMiseTasks = computed(() =>
  (productDemo.value?.workspace.miseTasks ?? []).filter(
    (task: ProductDemoMiseTask) =>
      !task.menuIds.length || hasInServiceMenu(task.menuIds)
  )
)
const previewDishes = computed(() =>
  (productDemo.value?.workspace.dishes ?? []).filter(
    (dish: ProductDemoDish) => dish.kind !== 'Drink'
  )
)
const workspaceKitchenPill = computed<
  MiseboxProductDemo['workspace']['kitchenPill']
>(
  () =>
    productDemo.value?.workspace.kitchenPill || {
      title: 'Deanos',
      subtitle: '',
      imageUrl: '',
      imageShade: 'none',
    }
)
const selectedDish = computed(
  () =>
    previewDishes.value.find(
      (dish: ProductDemoDish) => dish.id === selectedDishId.value
    ) || null
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
const openFullKitchenWorkspace = async (event: MouseEvent) => {
  event.preventDefault()
  setKitchenWorkspaceSelection({
    kitchenId: workspaceKitchenId.value,
    type: 'demo',
  })
  await navigateTo('/')
}
</script>
