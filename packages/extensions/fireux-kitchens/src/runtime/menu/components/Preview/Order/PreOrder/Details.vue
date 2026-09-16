<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">Pre-order details</h2>

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-calendar-clock"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Pre-order details</strong>
        <span>{{ preOrderStatus }}</span>
      </div>
    </section>

    <section class="menu-order-schedule">
      <p
        v-if="serviceWindowLabel"
        class="menu-order-placeholder menu-order-placeholder--good"
      >
        Served {{ serviceWindowLabel }}
      </p>

      <div class="menu-order-schedule__fields">
        <label class="menu-order-field">
          Date
          <span class="menu-order-date-control">
            <span v-if="!dateInputOpen" class="menu-order-date-pill">
              {{ scheduledDateLabel }}
            </span>

            <input
              v-else
              ref="dateInput"
              v-model="scheduledDate"
              class="menu-order-schedule__input"
              type="date"
            />

            <button
              type="button"
              class="menu-order-date-button"
              aria-label="Choose pre-order date"
              @click="openCalendar"
            >
              <UIcon name="i-lucide-calendar" aria-hidden="true" />
            </button>
          </span>
        </label>

        <label class="menu-order-field">
          Time
          <input
            v-model="scheduledTime"
            class="menu-order-schedule__input"
            type="time"
          />
        </label>
      </div>

      <label class="menu-order-field">
        Party size
        <input
          v-model="partySize"
          class="menu-order-schedule__input"
          inputmode="numeric"
          min="1"
          type="number"
        />
      </label>

      <p
        v-if="scheduleSelection.complete"
        class="menu-order-placeholder"
        :class="{ 'menu-order-placeholder--good': scheduleSelection.available }"
      >
        {{ scheduleSelection.label }}
      </p>

      <p
        v-if="scheduleSelection.available && !noticeSelection.available"
        class="menu-order-placeholder"
      >
        {{
          noticeSelection.noticeHours > 0
            ? `Choose a time at least ${noticeSelection.noticeHours} hours from now.`
            : 'Choose a future date and time.'
        }}
      </p>
    </section>

    <div class="menu-order-dispatch__divider" />

    <section class="menu-order-dispatch__section">
      <UIcon
        name="i-lucide-credit-card"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>Deposit</strong>
        <span>{{ depositStatus }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watchEffect } from 'vue'
import type { MenuOrderPreviewController } from '../../../../models/menu-order-preview.model.ts'
import { useMenuPreviewPreOrderFunnel } from '../../../../composables/preview/useMenuPreviewPreOrderFunnel'
import {
  formatWeekdayTimeText,
  readWeekdayTimeNoticeState,
  readWeekdayTimeSelectionState,
} from '../../../../../utils/weekday-time'

const props = defineProps<{
  funnel: MenuOrderPreviewController
}>()

const emit = defineEmits<{
  (event: 'update:ready', value: boolean): void
}>()

const { depositStatus, detailsStatus: preOrderStatus } =
  useMenuPreviewPreOrderFunnel(() => props.funnel.order)

const todayDate = () => {
  const now = new Date()

  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}
const splitRequestedFor = (value: unknown) => {
  const text = String(value ?? '').trim()
  if (!text) return { date: '', time: '' }

  const [date = '', time = ''] = text.split('T')

  return {
    date,
    time: time.slice(0, 5),
  }
}
const savedRequestedFor = splitRequestedFor(
  props.funnel.incoming.pre_order?.requested_for
)
const dateInputOpen = ref(Boolean(savedRequestedFor.date))
const scheduledDate = ref(savedRequestedFor.date || todayDate())
const scheduledTime = ref(savedRequestedFor.time || '17:00')
const partySize = ref(
  props.funnel.incoming.pre_order?.party_size
    ? String(props.funnel.incoming.pre_order.party_size)
    : ''
)
const dateInput = ref<HTMLInputElement | null>(null)
const serviceHours = computed(
  () => props.funnel.order.serviceHours?.operation_hours
)
const serviceWindowLabel = computed(() =>
  formatWeekdayTimeText(serviceHours.value)
)
const scheduledDateLabel = computed(() =>
  scheduledDate.value === todayDate() ? 'Today' : scheduledDate.value
)
const scheduleSelection = computed(() =>
  readWeekdayTimeSelectionState(
    serviceHours.value,
    scheduledDate.value,
    scheduledTime.value
  )
)
const noticeSelection = computed(() =>
  readWeekdayTimeNoticeState(
    serviceHours.value,
    scheduleSelection.value.requested_for,
    props.funnel.order.policy?.notice_hours
  )
)
const requestedFor = computed(() =>
  scheduleSelection.value.available && noticeSelection.value.available
    ? scheduleSelection.value.requested_for
    : ''
)
const partySizeNumber = computed(() => {
  const value = Math.floor(Number(partySize.value || 0))

  return Number.isFinite(value) && value > 0 ? value : 0
})
const ready = computed(
  () =>
    scheduleSelection.value.available &&
    noticeSelection.value.available &&
    partySizeNumber.value > 0
)

async function openCalendar() {
  dateInputOpen.value = true
  await nextTick()
  dateInput.value?.focus()
  try {
    dateInput.value?.showPicker?.()
  } catch {
    // Some browsers only allow native pickers during the original click frame.
  }
}

watchEffect(() => {
  props.funnel.collect({
    pre_order: {
      requested_for: requestedFor.value,
      notice_hours: props.funnel.order.policy?.notice_hours,
      ...(partySizeNumber.value ? { party_size: partySizeNumber.value } : {}),
    },
  })
  emit('update:ready', ready.value)
})
</script>
