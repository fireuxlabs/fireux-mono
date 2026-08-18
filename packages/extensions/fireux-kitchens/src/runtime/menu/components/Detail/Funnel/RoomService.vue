<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Room service destination
    </h2>

    <UFormField label="Room, suite, or villa" required>
      <UInput
        v-model="room"
        maxlength="64"
        placeholder="Suite A"
        size="lg"
      />
    </UFormField>

    <UFormField label="Guest name">
      <UInput
        v-model="guestName"
        autocomplete="name"
        maxlength="120"
        placeholder="Guest name"
        size="lg"
      />
    </UFormField>
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

const room = computed({
  get: () => String(props.funnel.incoming.room_service?.room || ''),
  set: (room: string) => props.funnel.collect({ room_service: { room } }),
})
const guestName = computed({
  get: () => String(props.funnel.incoming.customer?.name || ''),
  set: (name: string) => props.funnel.collect({
    customer: {
      ...props.funnel.incoming.customer,
      name,
    },
  }),
})

watchEffect(() => {
  emit('update:ready', Boolean(room.value.trim()))
})
</script>
