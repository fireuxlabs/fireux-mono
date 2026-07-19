<template>
  <section class="console-surface">
    <UBreadcrumb :items="breadcrumbItems" />

    <UAlert
      v-if="!dish"
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading dish' : 'Dish not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen dish.'
          : `No dish was found for ${dishId || 'this route'}.`
      "
    />

    <template v-else>
      <ConsoleKitchenOperationsDishesCardsProfile :dish="dish" />
      <ConsoleKitchenOperationsDishesEdit />
      <ConsoleKitchenOperationsDishesDelete />
    </template>

    <DevFireuxDebugPanel
      title="Kitchen dish detail"
      scope="console"
      :data="fireuxDebugData"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleDish } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDish'

const {
  dish,
  dishId,
  pending,
  debug,
} = useKitchenConsoleDish()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const breadcrumbItems = computed(() => [
  {
    label: 'Dishes',
    icon: 'i-lucide-utensils',
    to: '/console/kitchen/dishes',
  },
  {
    label: normalizeString(dish.value?.name) || 'Dish details',
    icon: 'i-lucide-circle-dot',
  },
])

const fireuxDebugData = computed(() => ({
  ...debug.value,
  dish: dish.value,
}))
</script>
