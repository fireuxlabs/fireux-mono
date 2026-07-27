<template>
  <UCard
    as="section"
    aria-label="Interactive Kitchen Console preview"
    class="overflow-hidden"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <div
      class="grid min-h-[32rem] grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[12rem_minmax(0,1fr)]"
    >
      <aside class="border-r border-default bg-elevated/70 p-3">
        <div class="py-2">
          <KitchenCardsPill
            v-bind="consoleKitchenPill"
            :link="false"
            :show-badges="false"
            class="console-preview-kitchen-pill"
          />
        </div>

        <nav class="mt-3 grid gap-1" aria-label="Kitchen Operations">
          <button
            v-for="operation in operations"
            :key="operation.id"
            type="button"
            class="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-toned transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="operation.id === selectedSurfaceId
              ? 'bg-primary/10 text-primary'
              : ''"
            :aria-label="operation.title"
            :aria-current="operation.id === selectedSurfaceId ? 'page' : undefined"
            :title="operation.title"
            @click="selectSurface(operation.id)"
          >
            <UIcon :name="operation.icon" class="size-4 shrink-0" />
            <span class="hidden truncate sm:block">{{ operation.title }}</span>
          </button>
        </nav>

        <nav
          class="mt-3 border-t border-default pt-3"
          aria-label="Kitchen reports"
        >
          <p class="mb-1 hidden px-2 text-xs font-semibold text-muted sm:block">
            Reports
          </p>
          <button
            type="button"
            class="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-toned transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="financeSurface.id === selectedSurfaceId
              ? 'bg-primary/10 text-primary'
              : ''"
            :aria-label="financeSurface.title"
            :aria-current="financeSurface.id === selectedSurfaceId ? 'page' : undefined"
            :title="financeSurface.title"
            @click="selectSurface(financeSurface.id)"
          >
            <UIcon :name="financeSurface.icon" class="size-4 shrink-0" />
            <span class="hidden truncate sm:block">
              {{ financeSurface.title }}
            </span>
          </button>
        </nav>
      </aside>

      <div v-if="selectedSurface" class="min-w-0 bg-default p-4 sm:p-5">
        <header
          class="flex min-h-9 items-center gap-2 border-b border-default pb-4"
        >
          <p class="min-w-0 flex-1 truncate font-semibold text-highlighted">
            {{ selectedSurface.title }}
          </p>
          <UButton
            to="/console/kitchen"
            color="neutral"
            variant="soft"
            size="xs"
            trailing-icon="i-lucide-arrow-up-right"
            class="shrink-0"
            :aria-label="`Open the full ${consoleKitchenPill.title} Kitchen Console`"
            @click="openFullKitchenConsole"
          >
            <span class="hidden sm:inline">Open full Console</span>
            <span class="sm:hidden">Full Console</span>
          </UButton>
        </header>

        <MiseboxLandingConsolePreviewMenus
          v-if="selectedSurface.id === 'kitchen.menus'"
          :key="selectedSurface.id"
          :menus="productDemo?.console.menus || []"
          :error="Boolean(productDemoError)"
        />
        <MiseboxLandingConsolePreviewDishes
          v-else-if="selectedSurface.id === 'kitchen.dishes'"
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
          v-else-if="selectedSurface.id === 'kitchen.ingredients'"
          :key="selectedSurface.id"
          :ingredients="productDemo?.console.ingredients || []"
          :error="Boolean(productDemoError)"
        />
        <MiseboxLandingConsolePreviewRecipes
          v-else-if="selectedSurface.id === 'kitchen.recipes'"
          :key="selectedSurface.id"
          :recipes="productDemo?.console.recipes || []"
          :error="Boolean(productDemoError)"
        />
        <MiseboxLandingConsolePreviewMise
          v-else-if="selectedSurface.id === 'kitchen.mise'"
          :key="selectedSurface.id"
          :kitchen-name="productDemo?.console.kitchenName || ''"
          :tasks="consoleMiseTasks"
        />
        <MiseboxLandingConsolePreviewOrders
          v-else-if="selectedSurface.id === 'kitchen.orders'"
          :key="selectedSurface.id"
          :kitchen-name="productDemo?.console.kitchenName || ''"
          :orders="productDemo?.console.orders || []"
          :error="Boolean(productDemoError)"
        />
        <MiseboxLandingConsolePreviewStations
          v-else-if="selectedSurface.id === 'kitchen.stations'"
          :key="selectedSurface.id"
          :stations="productDemo?.console.stations || []"
          :error="Boolean(productDemoError)"
        />
        <MiseboxLandingConsolePreviewSuppliers
          v-else-if="selectedSurface.id === 'kitchen.suppliers'"
          :key="selectedSurface.id"
          :suppliers="productDemo?.console.suppliers || []"
          :error="Boolean(productDemoError)"
        />
        <MiseboxLandingConsolePreviewTables
          v-else-if="selectedSurface.id === 'kitchen.tables'"
          :key="selectedSurface.id"
          :tables="productDemo?.console.tables || emptyTables"
          :error="Boolean(productDemoError)"
        />
        <MiseboxLandingConsolePreviewFinance
          v-else-if="selectedSurface.id === financeSurface.id"
          :key="selectedSurface.id"
          :finance="productDemo?.console.finance || emptyFinance"
          :error="Boolean(productDemoError)"
        />
        <MiseboxLandingConsolePreviewEmptyCanvas
          v-else
          :key="selectedSurface.id"
          :title="selectedSurface.title"
        />
      </div>
    </div>
  </UCard>
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

<style scoped>
.console-preview-kitchen-pill.pill {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}
</style>
