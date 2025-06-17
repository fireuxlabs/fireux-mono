<template>
  <div class="stock-fields">
    <!-- Stock management for Physical products (always required) -->
    <template v-if="product.product_type === 'physical'">
      <UInputNumber
        v-model="product.stock"
        placeholder="Enter quantity"
        label="Inventory Stock"
        description="Number of physical units available for sale"
        :min="0"
      />
      <!-- Physical products always track stock -->
    </template>

    <!-- Stock management for Digital products (optional) -->
    <template v-else-if="product.product_type === 'digital'">
      <UFormField label="License Management">
        <USwitch
          v-model="product.track_stock"
          label="Limit available licenses/downloads"
        />
      </UFormField>

      <UInputNumber
        v-if="product.track_stock"
        v-model="product.stock"
        placeholder="Enter limit"
        label="Available Licenses"
        description="Maximum number of licenses or downloads allowed"
        :min="1"
      />
    </template>

    <!-- Stock management for Service products (optional) -->
    <template v-else-if="product.product_type === 'service'">
      <UFormField label="Capacity Management">
        <USwitch v-model="product.track_stock" label="Limit service capacity" />
      </UFormField>

      <UInputNumber
        v-if="product.track_stock"
        v-model="product.stock"
        placeholder="Enter capacity"
        label="Service Capacity"
        description="Maximum number of service slots available (e.g., consultations, sessions)"
        :min="1"
      />
    </template>

    <!-- Subscription products typically don't need stock management -->
    <template v-else-if="product.product_type === 'subscription'">
      <UFormField label="Membership Limits">
        <USwitch
          v-model="product.track_stock"
          label="Limit total memberships"
        />
      </UFormField>

      <UInputNumber
        v-if="product.track_stock"
        v-model="product.stock"
        placeholder="Enter limit"
        label="Membership Limit"
        description="Maximum number of active subscriptions allowed"
        :min="1"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useCreateProductState } from '../../../../composables/firestore/objects/Product/useCreateProductState'

const { product } = await useCreateProductState()

// Automatically handle stock tracking based on product type
watch(
  () => product.value.product_type,
  (newType) => {
    if (newType === 'physical') {
      // Physical products always track stock
      product.value.track_stock = true
    } else if (
      newType === 'digital' ||
      newType === 'service' ||
      newType === 'subscription'
    ) {
      // Other types default to not tracking stock
      product.value.track_stock = false
      product.value.stock = null
    }
  },
  { immediate: true }
)

// When track_stock is disabled, reset stock to null
watch(
  () => product.value.track_stock,
  (tracking) => {
    if (!tracking && product.value.product_type !== 'physical') {
      product.value.stock = null
    }
  }
)
</script>

<style scoped>
.stock-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
