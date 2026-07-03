<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Collection request
    </h2>

    <p class="menu-order-placeholder">
      {{ collectionStatus }}
    </p>

    <ClientOnly>
      <UBadge
        v-if="serviceTimes.known"
        :color="serviceTimes.open ? 'success' : 'error'"
        variant="soft"
        class="justify-self-center"
      >
        {{ serviceTimes.label }}
      </UBadge>
    </ClientOnly>

    <div class="menu-order-choice-grid">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="menu-order-choice"
        :class="{ 'menu-order-choice--active': mode === option.value }"
        @click="mode = option.value"
      >
        <UIcon
          :name="option.icon"
          class="menu-order-dispatch__icon"
          aria-hidden="true"
        />

        <span>
          <strong>{{ option.label }}</strong>
          <small>{{ option.description }}</small>
        </span>
      </button>
    </div>

    <section
      v-if="mode === 'scheduled'"
      class="menu-order-schedule"
    >
      <div class="menu-order-schedule__fields">
        <label class="menu-order-field">
          Date
          <input
            v-model="scheduledDate"
            class="menu-order-schedule__input"
            type="date"
          >
        </label>

        <label class="menu-order-field">
          Time
          <input
            v-model="scheduledTime"
            class="menu-order-schedule__input"
            type="time"
          >
        </label>
      </div>

      <p
        v-if="scheduleSelection.complete"
        class="menu-order-placeholder"
        :class="{ 'menu-order-placeholder--good': scheduleSelection.available }"
      >
        {{ scheduleSelection.label }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import type { MenuOrderingFunnelState } from '../../../../../models/kitchen/menu/menu-ordering.model'
import { useRendezvous } from '../../../../../composables/fireux/kitchen/order/funnel/Collection/useRendezvous'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const {
  mode,
  options,
  ready,
  scheduleSelection,
  scheduledDate,
  scheduledTime,
  serviceTimes,
  status: collectionStatus,
} = useRendezvous(() => props.order)

watchEffect(() => {
  emit('update:ready', ready.value)
})
</script>
