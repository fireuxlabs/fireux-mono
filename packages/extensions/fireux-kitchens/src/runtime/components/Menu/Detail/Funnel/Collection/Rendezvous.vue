<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Collection request
    </h2>

    <p class="menu-order-placeholder">
      {{ collectionStatus }}
    </p>

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
      <p class="menu-order-placeholder">
        Pick a collection time. These slots will come from kitchen opening times
        and menu operation times.
      </p>

      <div class="menu-order-schedule__slots">
        <button
          v-for="slot in scheduleSlots"
          :key="slot"
          type="button"
          class="menu-order-schedule__slot"
          :class="{ 'menu-order-schedule__slot--active': scheduledSlot === slot }"
          @click="scheduledSlot = slot"
        >
          {{ slot }}
        </button>
      </div>

      <dl class="menu-order-time-context">
        <div
          v-for="row in timingContext"
          :key="row.label"
          class="menu-order-time-context__row"
        >
          <dt>{{ row.label }}</dt>
          <dd>
            <strong>{{ row.value }}</strong>
            <span>{{ row.note }}</span>
          </dd>
        </div>
      </dl>
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
  scheduledSlot,
  scheduleSlots,
  status: collectionStatus,
  timingContext,
} = useRendezvous(() => props.order)

watchEffect(() => {
  emit('update:ready', ready.value)
})
</script>
