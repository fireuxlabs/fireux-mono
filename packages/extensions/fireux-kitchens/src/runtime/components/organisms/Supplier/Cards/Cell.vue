<template>
  <div
    class="flex w-full items-start gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm dark:border-gray-800/60 dark:bg-gray-900/40"
  >
    <UAvatar
      :src="avatarUrl || undefined"
      icon="i-lucide-store"
      size="md"
      class="shrink-0"
    />

    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold">{{ name }}</div>
          <div v-if="subtitle" class="truncate text-xs text-dimmed">
            {{ subtitle }}
          </div>
        </div>
      </div>

      <code class="truncate text-[11px] text-dimmed">{{ id }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SupplierCard } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

defineProps<Pick<SupplierCard.Card, 'id' | 'name' | 'subtitle' | 'avatarUrl'>>()
</script>
