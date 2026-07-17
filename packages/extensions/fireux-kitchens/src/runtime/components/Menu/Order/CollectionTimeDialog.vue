<template>
  <div class="menu-order-collection-time__host">
    <UModal
      v-model:open="openModel"
      description="Choose when you would like to collect your order."
      :portal="false"
      title="Collection time"
      :ui="modalUi"
      @after:leave="$emit('after-leave')"
    >
      <template #body>
        <div
          class="menu-order-collection-time"
          data-menu-collection-time="local"
          :data-menu-collection-time-state="timing.known ? 'ready' : 'unavailable'"
        >
          <button
            v-if="timing.queueAvailable"
            type="button"
            class="menu-order-collection-time__asap"
            :class="{
              'menu-order-collection-time__asap--active': selectedValue === 'queue',
            }"
            :aria-pressed="selectedValue === 'queue'"
            @click="selectedValue = 'queue'"
          >
            <span class="menu-order-collection-time__asap-icon" aria-hidden="true">
              <UIcon name="i-lucide-zap" />
            </span>
            <span>
              <strong>As soon as possible</strong>
              <small>Join the kitchen’s collection queue.</small>
            </span>
            <UIcon
              v-if="selectedValue === 'queue'"
              name="i-lucide-check"
              aria-hidden="true"
            />
          </button>

          <template v-if="timing.days.length">
            <div class="menu-order-collection-time__divider">
              <span>Choose a time</span>
            </div>

            <div
              class="menu-order-collection-time__days"
              aria-label="Collection dates"
            >
              <button
                v-for="day in timing.days"
                :key="day.date"
                type="button"
                :aria-pressed="activeDate === day.date"
                @click="activeDate = day.date"
              >
                {{ day.label }}
              </button>
            </div>

            <div
              class="menu-order-collection-time__slots"
              :aria-label="`Collection times for ${activeDay?.label || 'selected day'}`"
            >
              <button
                v-for="slot in activeDay?.slots || []"
                :key="slot.requestedFor"
                type="button"
                :class="{
                  'menu-order-collection-time__slot--active':
                    selectedValue === slot.requestedFor,
                }"
                :aria-pressed="selectedValue === slot.requestedFor"
                @click="selectedValue = slot.requestedFor"
              >
                {{ slot.label }}
              </button>
            </div>
          </template>

          <div
            v-if="!timing.known"
            class="menu-order-collection-time__unavailable"
            role="status"
          >
            <UIcon name="i-lucide-clock-alert" aria-hidden="true" />
            <div>
              <strong>Collection times unavailable</strong>
              <p>The kitchen has not published collection hours yet.</p>
            </div>
          </div>

          <p
            v-else-if="!timing.queueAvailable && !timing.days.length"
            class="menu-order-collection-time__empty"
            role="status"
          >
            No collection times are currently available.
          </p>
        </div>
      </template>

      <template #footer>
        <button
          type="button"
          class="menu-order-collection-time__confirm"
          data-menu-action="confirm-collection-time"
          :disabled="!selected"
          @click="confirmSelection"
        >
          <span>{{ selected ? selected.label : 'Choose a collection time' }}</span>
          <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
        </button>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model'
import {
  menuOrderCollectionTimeOptions,
  type MenuOrderCollectionTimeSelection,
} from '../../../utils/menu-order-collection-time'

const props = defineProps<{
  asapEnabled?: boolean
  hours?: WeekdayTimeWindowsConfig
  noticeHours?: number
  open: boolean
  scheduleHorizonDays?: number
  selection: MenuOrderCollectionTimeSelection | null
  slotIntervalMinutes?: number
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'select', selection: MenuOrderCollectionTimeSelection): void
  (event: 'after-leave'): void
}>()

const modalUi = {
  overlay: 'menu-order-collection-time__overlay',
  content: 'menu-order-collection-time__content',
  header: 'menu-order-collection-time__header',
  title: 'menu-order-collection-time__title',
  description: 'menu-order-collection-time__description',
  close: 'menu-order-collection-time__close',
  body: 'menu-order-collection-time__body',
  footer: 'menu-order-collection-time__footer',
}
const openModel = computed({
  get: () => props.open,
  set: (open: boolean) => emit('update:open', open),
})
const timing = computed(() => menuOrderCollectionTimeOptions({
  hours: props.hours,
  noticeHours: props.noticeHours,
  asapEnabled: props.asapEnabled,
  slotIntervalMinutes: props.slotIntervalMinutes,
  scheduleHorizonDays: props.scheduleHorizonDays,
}))
const selectedValue = ref('')
const activeDate = ref('')
const activeDay = computed(() =>
  timing.value.days.find(day => day.date === activeDate.value) ||
  timing.value.days[0] ||
  null
)
const selected = computed<MenuOrderCollectionTimeSelection | null>(() => {
  if (selectedValue.value === 'queue' && timing.value.queueAvailable) {
    return { mode: 'queue', label: 'As soon as possible' }
  }

  for (const day of timing.value.days) {
    const slot = day.slots.find(
      candidate => candidate.requestedFor === selectedValue.value
    )
    if (slot) {
      return {
        mode: 'scheduled',
        requestedFor: slot.requestedFor,
        label: `${day.label} at ${slot.label}`,
      }
    }
  }

  return null
})

function resetSelection() {
  const requestedFor = props.selection?.requestedFor || ''
  selectedValue.value = props.selection?.mode === 'queue'
    ? 'queue'
    : requestedFor
  activeDate.value = requestedFor.slice(0, 10) || timing.value.days[0]?.date || ''
}

function confirmSelection() {
  if (!selected.value) return

  emit('select', selected.value)
  emit('update:open', false)
}

watch(() => props.open, open => {
  if (open) resetSelection()
})
watch(timing, () => {
  if (props.open) resetSelection()
})
</script>

<style scoped src="../../../assets/styles/menu-order-collection-time.css"></style>
