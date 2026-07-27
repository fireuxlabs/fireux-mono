<template>
  <div class="mt-5" aria-label="Tables preview">
    <template v-if="tables.configuredCount">
      <div class="mb-3 flex flex-wrap justify-end gap-2">
        <UBadge color="neutral" variant="soft" size="sm">
          {{ tables.configuredCount }} configured tables
        </UBadge>
        <UBadge color="neutral" variant="outline" size="sm">
          No open tabs
        </UBadge>
      </div>

      <div class="grid max-h-[24rem] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-4">
        <article
          v-for="tableNumber in tables.configuredCount"
          :key="tableNumber"
          :data-table-number="tableNumber"
          class="flex aspect-square flex-col items-center justify-center rounded-xl border border-default bg-default p-3 text-center shadow-sm"
        >
          <UIcon name="i-lucide-grid-2x2" class="size-5 text-primary" />
          <p class="mt-2 text-sm font-semibold text-highlighted">
            Table {{ tableNumber }}
          </p>
          <p class="mt-1 text-xs text-muted">Available</p>
        </article>
      </div>
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="error ? 'Tables preview unavailable' : 'No tables configured'"
      :description="error
        ? 'The Deanos table configuration could not be loaded.'
        : 'This Kitchen does not have table service configured.'"
    />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

defineProps<{
  error: boolean
  tables: MiseboxProductDemo['console']['tables']
}>()
</script>
