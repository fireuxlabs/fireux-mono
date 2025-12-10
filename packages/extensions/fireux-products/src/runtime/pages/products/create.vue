<template>
  <UPage>
    <UPageHeader
      title="Create Product"
      description="Add a new product to the catalog for this runtime."
    />

    <UPageBody class="pagebody">
      <div v-if="isChecking" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <UAlert
        v-else-if="!isAllowed"
        color="amber"
        title="Admins only"
        description="Only admins can publish products for this runtime."
      />

      <OrganismsProductCreateSystem v-else />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'products-create',
    label: 'Create product',
    icon: 'i-lucide-plus',
    order: 21,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Create Product',
})

const { isAdmin, isLoading } = useUser()
const isChecking = computed(() => Boolean(isLoading.value))
const isAllowed = computed(() => isAdmin.value)

useHead({ title: 'Create Product' })
</script>
