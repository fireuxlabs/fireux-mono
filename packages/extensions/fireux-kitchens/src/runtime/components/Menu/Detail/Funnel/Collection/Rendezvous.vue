<template>
  <div class="menu-order-dispatch">
    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-shopping-bag"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Collection rendezvous</strong>
        <span>{{ collectionStatus }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../models/kitchen/menu/menu-ordering.model'
import { useRendezvous } from '../../../../../composables/fireux/kitchen/order/funnel/Collection/useRendezvous'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const {
  ready,
  status: collectionStatus,
} = useRendezvous(() => props.order)

watchEffect(() => {
  emit('update:ready', ready.value)
})
</script>
