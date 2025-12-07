<template>
  <UPageCTA
    v-if="showCTA"
    title="Add a product"
    description="List new offerings or updates for this runtime."
    variant="naked"
  >
    <template #default>
      <p class="text-sm text-gray-600">
        Admins can publish products to keep the catalog current.
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
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const { isAdmin, isLoading } = useUser()
const showCTA = computed(() => !isLoading.value && isAdmin.value)
</script>
