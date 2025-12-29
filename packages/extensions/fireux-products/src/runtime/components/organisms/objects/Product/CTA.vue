<template>
  <UPageCTA
    v-if="showCTA"
    title="Add a product"
    description="List new offerings or updates for this runtime."
    variant="naked"
  >
    <template #default>
      <p class="text-sm text-gray-600">
        People with publish permissions can keep the catalog current.
      </p>
    </template>

    <template #links>
      <UButton color="primary" size="lg" to="/products/create">
        Create product
      </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProductPermissions } from '../../../../composables/useProductPermissions'

const { canPublishProduct, pending } = useProductPermissions()
const showCTA = computed(() =>
  pending?.value ? false : canPublishProduct.value || import.meta.dev
)
</script>
