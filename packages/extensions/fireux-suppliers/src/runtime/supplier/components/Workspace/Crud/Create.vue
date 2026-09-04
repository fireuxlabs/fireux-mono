<template>
  <UModal
    :open="open"
    title="Create Supplier"
    description="Create a Supplier identity and Workspace access together."
    :ui="{ content: 'sm:max-w-4xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <SupplierCreateSystem
        v-if="open"
        mode="workspace"
        return-to="/workspace/supplier"
        cancel-to="/workspace/supplier"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [open: boolean] }>()
</script>
