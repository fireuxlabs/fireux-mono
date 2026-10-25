<template>
  <FireStateCard
    v-if="outcome === 'pending'"
    entity="supplier"
    kind="document"
    loading
  />
  <FireStateCard
    v-else-if="outcome === 'error'"
    entity="supplier"
    kind="document"
    state="error"
    title="We couldn’t load this supplier"
    description="There was a problem fetching the information. Please try again."
  >
    <UButton
      label="Retry"
      icon="i-lucide-refresh-cw"
      color="primary"
      size="sm"
      @click="emit('refresh')"
    />
  </FireStateCard>
  <FireStateCard
    v-else-if="!hasSupplier"
    entity="supplier"
    kind="document"
    state="missing"
    title="Supplier not found"
    description="We couldn’t find the supplier you’re looking for. It may have been removed or the link is incorrect."
  >
    <UButton
      label="Back to all Suppliers"
      icon="i-lucide-arrow-left"
      to="/suppliers"
      color="primary"
      size="sm"
    />
  </FireStateCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'SupplierDetailState' })
defineProps<{
  outcome: 'pending' | 'error' | 'missing' | 'ready'
  hasSupplier: boolean
}>()
const emit = defineEmits<{ refresh: [] }>()
</script>
