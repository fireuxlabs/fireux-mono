<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">Where are you sitting?</h2>

    <UFormField label="Table, terrace, or bar position" required>
      <UInput
        v-model="tableNumber"
        maxlength="64"
        placeholder="Table 7"
        size="lg"
      />
    </UFormField>

    <p class="menu-order-placeholder">
      This destination is printed on the kitchen ticket.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type { MenuOrderingFunnelController } from '../../../models/menu-ordering.model.ts'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const tableNumber = computed({
  get: () => String(props.funnel.incoming.table?.number || ''),
  set: (number: string) => props.funnel.collect({ table: { number } }),
})

watchEffect(() => {
  emit('update:ready', Boolean(tableNumber.value.trim()))
})
</script>
