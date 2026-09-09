<template>
  <UButton
    v-if="recentOrders.length"
    color="neutral"
    variant="soft"
    icon="i-lucide-archive"
    :label="`Completed ${recentOrders.length}`"
    @click="completeOpen = true"
  />

  <WorkspaceKitchenOrdersWorkspaceModal
    v-model:open="completeOpen"
    title="Completed orders"
    :description="completeDescription"
  >
    <WorkspaceKitchenOrdersRail
      label="Completed"
      :count="recentOrders.length"
      empty-label="No completed orders yet"
    >
      <WorkspaceKitchenOrdersTicketPresentation
        v-for="order in recentOrders"
        :key="order.id"
        :order="order"
      />
    </WorkspaceKitchenOrdersRail>
  </WorkspaceKitchenOrdersWorkspaceModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrdersComplete' })

const { recentOrders } = useKitchenOrdersContext()
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
