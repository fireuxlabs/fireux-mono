<template>
  <UModal
    :open="open"
    title="Read Suppliers"
    description="Open the current Supplier detail page."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <UButton
        v-if="state.supplier.id"
        :to="`/suppliers/${encodeURIComponent(state.supplier.id)}`"
        color="neutral"
        variant="soft"
        block
        class="justify-start"
        @click="emit('update:open', false)"
      >
        <UAvatar
          :src="state.supplier.url || undefined"
          :alt="state.supplier.name"
          icon="i-lucide-truck"
          size="md"
        />
        <span class="min-w-0 text-left">
          <span class="block truncate font-medium">
            {{ state.supplier.name || state.supplier.id }}
          </span>
          <span
            v-if="state.supplier.tagline"
            class="block truncate text-xs text-muted"
          >
            {{ state.supplier.tagline }}
          </span>
        </span>
      </UButton>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { SupplierWorkspaceIndexState } from '../../../composables/workspace/index/useSupplierWorkspaceIndex'

defineProps<{ open: boolean; state: SupplierWorkspaceIndexState }>()
const emit = defineEmits<{ 'update:open': [open: boolean] }>()
</script>
