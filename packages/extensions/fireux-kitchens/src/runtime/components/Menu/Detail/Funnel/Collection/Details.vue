<template>
  <div class="menu-order-dispatch">
    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-shopping-bag"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Collection details</strong>
        <span>{{ collectionStatus }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const collectionStatus = computed(() =>
  props.order.policy?.message ||
  'The kitchen will confirm when your collection order is accepted.'
)

watchEffect(() => {
  emit('update:ready', true)
})
</script>
