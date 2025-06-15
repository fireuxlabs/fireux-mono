<template>
  <div class="stock-fields">
    <!-- Stock Quantity (always shown) -->
    <UInputNumber
      v-model="product.stock"
      placeholder="∞"
      label="Stock Quantity"
      description="Leave blank or zero for unlimited stock"
    />

    <!-- Track Stock toggle (digital only) -->
    <UFormField v-if="product.product_type === 'digital'" label="Track Stock">
      <USwitch
        v-model="product.track_stock"
        label="Track stock for this digital product"
      />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import { useCreateProductState } from '../../../../composables/firestore/objects/Product/useCreateProductState'

const { product } = await useCreateProductState()
</script>

<style scoped>
.stock-fields {
  display: flex;
  flex-direction: column;
}
</style>
