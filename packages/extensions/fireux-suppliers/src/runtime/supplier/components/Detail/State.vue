<template>
  <FireState v-if="outcome === 'pending'" entity="supplier" outcome="pending" />
  <UAlert
    v-else-if="outcome === 'error'"
    title="We couldn’t load this supplier"
    description="There was a problem fetching the information. Please try again."
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        message="We couldn’t load this supplier&#10;There was a problem fetching the information. Please try again."
      />
      <UButton
        label="Retry"
        icon="i-lucide-refresh-cw"
        color="primary"
        size="sm"
        @click="emit('refresh')"
      />
    </template>
  </UAlert>
  <UAlert
    v-else-if="!hasSupplier"
    title="Supplier not found"
    description="We couldn’t find the supplier you’re looking for. It may have been removed or the link is incorrect."
    color="neutral"
    variant="soft"
    role="status"
    aria-live="polite"
  >
    <template #actions>
      <UButton
        label="Back to all Suppliers"
        icon="i-lucide-arrow-left"
        to="/suppliers"
        color="primary"
        size="sm"
      />
    </template>
  </UAlert>
</template>

<script setup lang="ts">
defineOptions({ name: 'SupplierDetailState' })
defineProps<{
  outcome: 'pending' | 'error' | 'empty' | 'ready'
  hasSupplier: boolean
}>()
const emit = defineEmits<{ refresh: [] }>()
</script>
