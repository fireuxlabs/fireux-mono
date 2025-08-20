<template>
  <div>
    <UCard>
      <h1>Misebox Suppliers</h1>
      <p>Current Supplier: {{ supplier?.supplier_name || 'None' }}</p>
    </UCard>

    <UCard v-if="supplier">
      <h2>Components</h2>

      <h3>Pill</h3>
      <MiseOrganismsProfilesSupplierCardsPill :supplier="supplier" />

      <USeparator />

      <h3>Cell</h3>
      <MiseOrganismsProfilesSupplierCardsCell :supplier="supplier" />

      <USeparator />

      <h3>Profile</h3>
      <MiseOrganismsProfilesSupplierCardsProfile :supplier="supplier" />
    </UCard>

    <UCard>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        "
      >
        <h2 style="margin: 0">JSON Snapshot</h2>
        <UButton
          icon="i-heroicons-clipboard-document"
          size="sm"
          variant="outline"
          @click="copyToClipboard(jsonSnapshot)"
        >
          Copy JSON
        </UButton>
      </div>
      <pre>{{ jsonSnapshot }}</pre>
    </UCard>

    <UCard>
      <h2>All Suppliers ({{ suppliers?.length || 0 }})</h2>

      <div v-if="suppliers?.length">
        <MiseOrganismsProfilesSupplierCardsCell
          v-for="supplierItem in suppliers"
          :key="supplierItem.id"
          :supplier="supplierItem"
        />
      </div>

      <p v-else>No suppliers found</p>
    </UCard>
  </div>
</template>

<script setup>
// Note: These composables might not exist yet, but following the pattern
// const { supplier, suppliers, ...computedProps } = await useSupplier()

// For now, create mock data structure matching the pattern
const supplier = ref(null)
const suppliers = ref([])

// Mock computed props (would come from useSupplierComputed)
const isActiveSupplier = computed(() => !!supplier.value)
const hasProducts = computed(() => supplier.value?.products?.length > 0)
const isVerified = computed(() => supplier.value?.verified === true)

// JSON snapshot for copy functionality
const jsonSnapshot = computed(() => {
  return JSON.stringify(
    {
      currentSupplier: supplier.value,
      computedProps: {
        isActiveSupplier: isActiveSupplier.value,
        hasProducts: hasProducts.value,
        isVerified: isVerified.value,
      },
      collection: {
        total: suppliers.value?.length || 0,
        suppliers: suppliers.value,
      },
    },
    null,
    2
  )
})

// Copy to clipboard function
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Supplier JSON copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy Supplier JSON:', err)
  }
}
</script>
