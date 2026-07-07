<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Collection
    </h2>

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
          <span class="menu-order-date-control">
            <span
              v-if="!dateInputOpen"
              class="menu-order-date-pill"
            >
              {{ scheduledDateLabel }}
            </span>

            <input
              v-else
              ref="dateInput"
              v-model="scheduledDate"
              class="menu-order-schedule__input"
              type="date"
            >

            <button
              type="button"
              class="menu-order-date-button"
              aria-label="Choose collection date"
              @click="openCalendar"
            >
              <UIcon
                name="i-lucide-calendar"
                aria-hidden="true"
              />
            </button>
          </span>
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
import { nextTick, ref } from 'vue'
import type { MenuOrderingCollectionFunnel } from '../../../../../composables/fireux/kitchen/order/funnel/Collection/useCollectionFunnel'

const props = defineProps<{
  state: MenuOrderingCollectionFunnel
}>()

const {
  dateInputOpen,
  mode,
  openDateInput,
  options,
  scheduleSelection,
  scheduledDate,
  scheduledDateLabel,
  scheduledTime,
} = props.state

const dateInput = ref<HTMLInputElement | null>(null)

async function openCalendar() {
  openDateInput()
  await nextTick()
  dateInput.value?.focus()
  try {
    dateInput.value?.showPicker?.()
  } catch {
    // Some browsers only allow native pickers during the original click frame.
  }
}

</script>
