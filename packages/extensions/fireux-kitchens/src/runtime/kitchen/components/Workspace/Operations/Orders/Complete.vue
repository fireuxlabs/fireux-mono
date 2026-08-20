<template>
  <UButton
    v-if="recentOrders.length"
    color="neutral"
    variant="soft"
    icon="i-lucide-archive"
    :label="`Completed ${recentOrders.length}`"
    @click="completeOpen = true"
  />

  <WorkspaceKitchenOperationsOrdersWorkspaceModal
    v-model:open="completeOpen"
    title="Completed orders"
    :description="completeDescription"
  >
    <WorkspaceKitchenOperationsOrdersRail
      label="Completed"
      :count="recentOrders.length"
      empty-label="No completed orders yet"
    >
      <WorkspaceKitchenOperationsOrdersTicketPresentation
        v-for="order in recentOrders"
        :key="order.id"
        :order="order"
      />
    </WorkspaceKitchenOperationsOrdersRail>
  </WorkspaceKitchenOperationsOrdersWorkspaceModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenOrdersWorkspace } from '../../../../composables/workspace/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'WorkspaceKitchenOperationsOrdersComplete' })

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
