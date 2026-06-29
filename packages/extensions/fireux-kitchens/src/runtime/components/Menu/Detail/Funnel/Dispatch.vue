<template>
  <div class="menu-order-dispatch">
    <UIcon
      name="i-lucide-radio"
      class="menu-order-dispatch__icon"
      aria-hidden="true"
    />

    <div class="menu-order-dispatch__copy">
      <p>
        We have the basket and delivery address. This is where the order starts
        moving.
      </p>

      <ul>
        <li v-for="stage in stages" :key="stage">
          {{ stage }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderingFunnelState } from '../../../../models/menu/menu-ordering.model'
import { useFunnelDispatch } from '../../../../composables/fireux/public/menu/useFunnelDispatch'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const {
  stages,
} = useFunnelDispatch(() => props.order)
</script>
