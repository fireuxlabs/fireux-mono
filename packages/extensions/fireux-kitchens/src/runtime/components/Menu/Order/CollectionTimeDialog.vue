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
  hours?: WeekdayTimeWindowsConfig
  noticeHours?: number
  open: boolean
  selection: MenuOrderCollectionTimeSelection | null
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

<style scoped>
.menu-order-collection-time__host {
  display: contents;
}
:deep(.menu-order-collection-time__overlay) {
  z-index: 60;
  background: rgb(15 23 42 / 62%);
  backdrop-filter: blur(3px);
}
:deep(.menu-order-collection-time__content) {
  z-index: 61;
  width: min(calc(100vw - 2rem), 38rem);
  max-width: 38rem;
  max-height: min(48rem, calc(100dvh - 2rem));
  border: 1px solid color-mix(in srgb, var(--menu-primary) 28%, transparent);
  border-radius: var(--menu-radius);
  background: var(--menu-bg);
  color: var(--menu-text);
}
:deep(.menu-order-collection-time__header),
:deep(.menu-order-collection-time__footer) {
  border-color: color-mix(in srgb, var(--menu-text) 12%, transparent);
}
:deep(.menu-order-collection-time__title) {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: 1.4rem;
}
:deep(.menu-order-collection-time__description),
:deep(.menu-order-collection-time__close) {
  color: var(--menu-muted);
}
:deep(.menu-order-collection-time__body) {
  overflow-y: auto;
}
.menu-order-collection-time {
  display: grid;
  gap: 1rem;
}
.menu-order-collection-time__asap {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.8rem;
  align-items: center;
  padding: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: var(--menu-radius-control);
  background: transparent;
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.menu-order-collection-time__asap--active {
  border-color: color-mix(in srgb, var(--menu-primary) 48%, transparent);
  background: color-mix(in srgb, var(--menu-primary) 10%, var(--menu-bg));
}

.menu-order-collection-time__asap-icon {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-primary) 14%, var(--menu-bg));
  color: var(--menu-primary);
}

.menu-order-collection-time__asap span:nth-child(2) {
  display: grid;
  gap: 0.15rem;
}

.menu-order-collection-time__asap small {
  color: var(--menu-muted);
}

.menu-order-collection-time__divider {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  color: var(--menu-muted);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.menu-order-collection-time__divider::after {
  height: 1px;
  flex: 1;
  background: color-mix(in srgb, var(--menu-text) 14%, transparent);
  content: "";
}

.menu-order-collection-time__days {
  display: flex;
  gap: 0.45rem;
  padding-block-end: 0.2rem;
  overflow-x: auto;
}

.menu-order-collection-time__days button,
.menu-order-collection-time__slots button {
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--menu-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 850;
  white-space: nowrap;
}

.menu-order-collection-time__days button {
  padding: 0.5rem 0.7rem;
}

.menu-order-collection-time__days button[aria-pressed="true"] {
  border-color: var(--menu-primary);
  background: var(--menu-primary);
  color: var(--menu-bg);
}

.menu-order-collection-time__slots {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.45rem;
}

.menu-order-collection-time__slots button {
  padding: 0.55rem 0.4rem;
}

.menu-order-collection-time__slot--active {
  border-color: color-mix(in srgb, var(--menu-primary) 55%, transparent) !important;
  background: color-mix(in srgb, var(--menu-primary) 13%, var(--menu-bg)) !important;
  color: var(--menu-text) !important;
}

.menu-order-collection-time button:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 2px;
}

.menu-order-collection-time__unavailable {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: var(--menu-radius-control);
  color: var(--menu-muted);
}

.menu-order-collection-time__unavailable p,
.menu-order-collection-time__empty {
  margin: 0.25rem 0 0;
  color: var(--menu-muted);
  font-size: 0.85rem;
}

.menu-order-collection-time__confirm {
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--menu-primary);
  border-radius: var(--menu-radius-control);
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-weight: 900;
}

.menu-order-collection-time__confirm:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 35rem) {
  .menu-order-collection-time__slots {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
