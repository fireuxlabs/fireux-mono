<template>
  <div class="write-system">
    <!-- Basic Info -->
    <OrganismsProductCreateBasic />

    <!-- Product Type -->
    <USelect
      v-model="product.product_type"
      :items="productTypeOptions"
      placeholder="Select product type"
    />

    <!-- Pricing -->
    <OrganismsProductCreatePrices />

    <!-- Stock -->
    <OrganismsProductCreateStock />

    <!-- Shiping -->
    <!-- <OrganismsProductCreateShipping /> -->

    <!-- Images -->
    <OrganismsProductCreateImages />
  </div>
</template>

<script setup lang="ts">
const { product } = useCreateProductState()

const productTypeOptions = [
  { label: 'Service', value: 'service' },
  { label: 'Digital', value: 'digital' },
  { label: 'Physical', value: 'physical' }
]
</script>

<style scoped>
.write-system {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
