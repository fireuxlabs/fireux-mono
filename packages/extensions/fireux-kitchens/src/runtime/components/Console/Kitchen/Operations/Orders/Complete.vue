<template>
  <UButton
    v-if="recentOrders.length"
    color="neutral"
    variant="soft"
    icon="i-lucide-archive"
    :label="`Completed ${recentOrders.length}`"
    @click="completeOpen = true"
  />

  <ConsoleKitchenOperationsOrdersWorkspaceModal
    v-model:open="completeOpen"
    title="Completed orders"
    :description="completeDescription"
  >
    <ConsoleKitchenOperationsOrdersRail
      label="Completed"
      :count="recentOrders.length"
      empty-label="No completed orders yet"
    >
      <ConsoleKitchenOperationsOrdersTicketPresentation
        v-for="order in recentOrders"
        :key="order.id"
        :order="order"
      />
    </ConsoleKitchenOperationsOrdersRail>
  </ConsoleKitchenOperationsOrdersWorkspaceModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenOrdersWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersComplete' })

const { recentOrders } = useKitchenOrdersWorkspace()
const completeOpen = ref(false)
const completeDescription = computed(() =>
  recentOrders.value.length === 1
    ? '1 order is in the completed archive.'
    : `${recentOrders.value.length} orders are in the completed archive.`
)

watch(
  () => recentOrders.value.length,
  (count: number) => {
    if (!count) completeOpen.value = false
  }
)
</script>
