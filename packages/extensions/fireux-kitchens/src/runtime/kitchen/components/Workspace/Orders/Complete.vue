<template>
  <UButton
    v-if="recentOrders.length && !embedded"
    color="neutral"
    variant="soft"
    icon="i-lucide-archive"
    :label="`Completed ${recentOrders.length}`"
    @click="completeOpen = true"
  />

  <component
    :is="embedded ? 'section' : WorkspaceModal"
    v-model:open="completeOpen"
    title="Completed orders"
    :description="completeDescription"
  >
    <WorkspaceKitchenOrdersRail
      label="History"
      :count="recentOrders.length"
      empty-label="No completed or cancelled orders."
    >
      <div v-for="order in recentOrders" :key="order.id" class="space-y-2">
        <UBadge color="neutral" variant="soft">{{
          order.status === 'completed'
            ? 'Completed'
            : order.status === 'cancelled'
              ? 'Cancelled'
              : 'Changes requested'
        }}</UBadge>
        <WorkspaceKitchenOrdersTicketPresentation
          :order="order"
          :interactive="false"
        />
      </div>
    </WorkspaceKitchenOrdersRail>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WorkspaceModal from './WorkspaceModal.vue'
withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false })
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrdersComplete' })

const { recentOrders: allRecentOrders } = useKitchenOrdersContext()
const recentOrders = computed(() =>
  allRecentOrders.value.filter((order) => order.status !== 'changes_requested')
)
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
