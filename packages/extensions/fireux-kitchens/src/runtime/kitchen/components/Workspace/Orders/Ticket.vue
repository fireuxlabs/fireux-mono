<template>
  <WorkspaceKitchenOrdersPreparationTicket
    v-if="ticket"
    :order="ticket"
    :interactive="interactive"
    :selected="selected"
    :pending="statusActionPending"
    @ready="$emit('ready', $event)"
    @return="$emit('return', $event)"
    @toggle="$emit('toggle', $event)"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../models/order.model'
import { toKitchenPreparationOrder } from '../../../utils/preparation-order'
const props = withDefaults(defineProps<{
  order: KitchenOrder
  stage: 'pass' | 'queue'
  interactive: boolean
  selected?: boolean
  statusActionPending?: boolean
}>(), { selected: false, statusActionPending: false })
defineEmits<{ ready: [id: string]; return: [id: string]; toggle: [id: string] }>()
const ticket = computed(() => toKitchenPreparationOrder(props.order))
</script>
