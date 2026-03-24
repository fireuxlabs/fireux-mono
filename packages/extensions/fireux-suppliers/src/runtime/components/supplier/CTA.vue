<template>
  <UPageCTA
    class="cta"
    title="Supplier workspace"
    :description="ctaDescription"
    variant="subtle"
    orientation="horizontal"
  >
    <div v-if="supplierCard" class="cta__body space-y-4">
      <SupplierCardsPreview v-bind="supplierCard" :link="false" />

      <div class="flex flex-wrap gap-2">
        <UButton color="primary" @click="openProfile">View supplier</UButton>
        <UButton color="neutral" variant="soft" @click="openConsole">Manage supplier</UButton>
      </div>
    </div>

    <div v-else class="cta__body space-y-2">
      <SupplierCreateSystem />
    </div>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSupplier } from '../../composables/supplier/ops/useSupplier'

const { interface: supplierInterface } = useSupplier()
const router = useRouter()

const supplierCard = computed(() => supplierInterface())
const ctaDescription = computed(() =>
  supplierCard.value
    ? 'Your supplier record is live. Public discovery and supplier management are separate surfaces.'
    : 'Create a supplier record so kitchens and buyers can discover your business.'
)

const openProfile = () => {
  const to = String(supplierCard.value?.to || '').trim()
  if (!to) return
  router.push(to)
}

const openConsole = () => {
  router.push('/dashboard/supplier')
}
</script>
