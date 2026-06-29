<template>
  <div class="menu-order-allergen">
    <UIcon
      :name="icon"
      class="menu-order-allergen__icon"
      aria-hidden="true"
    />

    <div class="menu-order-allergen__copy">
      <p class="menu-order-placeholder">
        {{ notice }}
      </p>

      <p>
        {{ acknowledgement }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFunnelAllergen } from '../../../../composables/fireux/public/menu/useFunnelAllergen'

const { icon, notice, acknowledgement } = useFunnelAllergen()
</script>
