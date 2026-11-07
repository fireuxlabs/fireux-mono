<template>
  <div aria-label="Tables preview">
    <template v-if="tables.configuredCount">
      <div>
        <UBadge color="neutral" variant="soft" size="sm">
          {{ tables.configuredCount }} configured tables
        </UBadge>
        <UBadge color="neutral" variant="outline" size="sm">
          No open tabs
        </UBadge>
      </div>

      <div class="pagebody">
        <UCard
          as="article"
          v-for="tableNumber in tables.configuredCount"
          :key="tableNumber"
          :data-table-number="tableNumber"
        >
          <UIcon name="i-lucide-grid-2x2" />
          <p class="fx-type-caption">Table {{ tableNumber }}</p>
          <p class="fx-type-caption">Available</p>
        </UCard>
      </div>
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="error ? 'Tables preview unavailable' : 'No tables configured'"
      :description="
        error
          ? 'The Deanos table configuration could not be loaded.'
          : 'This Kitchen does not have table service configured.'
      "
    />
  </div>
</template>

<script setup lang="ts">
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

defineProps<{
  error: boolean
  tables: MiseboxProductDemo['workspace']['tables']
}>()
</script>
