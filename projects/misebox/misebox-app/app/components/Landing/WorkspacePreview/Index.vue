<template>
  <LandingWorkspacePreviewFrame
    :model-value="selectedSurfaceId"
    :items="operations"
    label="Interactive Kitchen Workspace preview"
    navigation-label="Kitchen Operations"
    workspace-to="/workspace/kitchen"
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

    <LandingWorkspacePreviewMenus
      v-if="selectedSurface?.id === 'kitchen.menus'"
      :key="selectedSurface.id"
      :menus="productDemo?.workspace.menus || []"
      :error="Boolean(productDemoError)"
    />
    <LandingWorkspacePreviewDishes
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
    <LandingWorkspacePreviewIngredients
      v-else-if="selectedSurface?.id === 'kitchen.ingredients'"
      :key="selectedSurface.id"
      :ingredients="productDemo?.workspace.ingredients || []"
      :error="Boolean(productDemoError)"
    />
    <LandingWorkspacePreviewRecipes
      v-else-if="selectedSurface?.id === 'kitchen.recipes'"
      :key="selectedSurface.id"
      :recipes="productDemo?.workspace.recipes || []"
      :error="Boolean(productDemoError)"
    />
    <LandingWorkspacePreviewOrders
      v-else-if="selectedSurface?.id === 'kitchen.orders'"
      :key="selectedSurface.id"
      :kitchen-name="productDemo?.workspace.kitchenName || ''"
      :orders="productDemo?.workspace.orders || []"
      :error="Boolean(productDemoError)"
    />
    <LandingWorkspacePreviewStations
      v-else-if="selectedSurface?.id === 'kitchen.stations'"
      :key="selectedSurface.id"
      :stations="productDemo?.workspace.stations || []"
      :error="Boolean(productDemoError)"
    />
    <LandingWorkspacePreviewSuppliers
      v-else-if="selectedSurface?.id === 'kitchen.suppliers'"
      :key="selectedSurface.id"
      :suppliers="productDemo?.workspace.suppliers || []"
      :error="Boolean(productDemoError)"
    />
    <LandingWorkspacePreviewFinance
      v-else-if="selectedSurface?.id === 'kitchen.finance'"
      :key="selectedSurface.id"
      :finance="productDemo?.workspace.finance || emptyFinance"
      :error="Boolean(productDemoError)"
    />
    <LandingWorkspacePreviewEmptyCanvas
      v-else-if="selectedSurface"
      :key="selectedSurface.id"
      :title="selectedSurface.title"
    />
  </LandingWorkspacePreviewFrame>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed, ref } from 'vue'
import { kitchenCapabilities } from 'fireux-kitchens/runtime/kitchen/models/capabilities'
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'
import type { DishChildPage } from './Dishes/types'
import LandingWorkspacePreviewFinance from './Finance.vue'
import LandingWorkspacePreviewOrders from './Orders.vue'
import LandingWorkspacePreviewStations from './Stations.vue'
import LandingWorkspacePreviewSuppliers from './Suppliers.vue'

const operations = kitchenCapabilities
const emptyFinance: MiseboxProductDemo['workspace']['finance'] = {
  periods: [],
}
type ProductDemoDish = MiseboxProductDemo['workspace']['dishes'][number]
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
  await navigateTo('/workspace/kitchen')
}
</script>
