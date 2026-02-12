<template>
  <div
    class="rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm dark:border-gray-800/60 dark:bg-gray-900/40"
  >
    <UUser
      :name="title"
      :description="subtitle || undefined"
      :avatar="{ icon: 'i-lucide-store', alt: title || '' }"
      size="sm"
    />

    <div class="mt-2 flex items-center justify-end gap-2">
      <code class="truncate text-[11px] text-dimmed">{{ id }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

defineProps<Pick<SupplierCard.Card, 'id' | 'title' | 'subtitle'>>()
</script>
