<template>
  <div class="space-y-5">
    <section class="grid gap-3 sm:grid-cols-3">
      <UCard>
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
              Upcoming stays
            </p>
            <p class="mt-1 text-2xl font-semibold">{{ summary.upcoming }}</p>
          </div>
          <UIcon name="i-lucide-calendar-check-2" class="size-6 text-primary" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
              Booked nights
            </p>
            <p class="mt-1 text-2xl font-semibold">
              {{ summary.occupiedNights }}
            </p>
          </div>
          <UIcon name="i-lucide-moon-star" class="size-6 text-primary" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
              Needs attention
            </p>
            <p class="mt-1 text-2xl font-semibold">{{ attentionCount }}</p>
          </div>
          <UIcon
            name="i-lucide-refresh-cw"
            class="size-6"
            :class="attentionCount ? 'text-warning' : 'text-success'"
          />
        </div>
      </UCard>
    </section>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Calendar unavailable"
      :description="String(error)"
    />

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-lg font-semibold">{{ monthLabel }}</p>
            <p class="text-xs text-dimmed">
              {{ propertyName }} · one shared availability view
            </p>
          </div>

          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              aria-label="Previous month"
              @click="moveMonth(-1)"
            />
            <UButton
              color="neutral"
              variant="soft"
              size="sm"
              @click="showToday"
            >
              Today
            </UButton>
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              aria-label="Next month"
              @click="moveMonth(1)"
            />
          </div>
        </div>
      </template>

      <div v-if="pending" class="grid min-h-96 place-items-center">
        <UIcon name="i-lucide-loader-circle" class="size-7 animate-spin text-dimmed" />
      </div>

      <div v-else class="overflow-x-auto">
        <div class="min-w-[760px]">
          <div class="grid grid-cols-7 border-b border-default">
            <div
              v-for="weekday in weekdays"
              :key="weekday"
              class="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-dimmed"
            >
              {{ weekday }}
            </div>
          </div>

          <div class="grid grid-cols-7 overflow-hidden rounded-b-lg border-l border-default">
            <div
              v-for="day in calendarDays"
              :key="day.date"
              class="min-h-28 border-b border-r border-default p-2"
              :class="[
                day.inMonth ? 'bg-default' : 'bg-muted/30',
                day.isToday ? 'ring-1 ring-inset ring-primary' : '',
              ]"
            >
              <div class="mb-2 flex items-center justify-between">
                <span
                  class="grid size-6 place-items-center rounded-full text-xs font-medium"
                  :class="day.isToday ? 'bg-primary text-inverted' : day.inMonth ? '' : 'text-dimmed'"
                >
                  {{ day.day }}
                </span>
              </div>

              <div class="space-y-1">
                <NuxtLink
                  v-for="reservation in day.reservations"
                  :key="reservation.id"
                  :to="`/console/property/reservations/${reservation.id}`"
                  class="block truncate rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition hover:brightness-95"
                  :class="sourceClasses(reservation.source)"
                  :title="`${reservation.guest.display_name} · ${sourceLabel(reservation.source)}`"
                >
                  {{ reservation.guest.display_name || 'Guest' }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-dimmed">
          <span
            v-for="legend in sourceLegend"
            :key="legend.source"
            class="inline-flex items-center gap-1.5"
          >
            <span class="size-2.5 rounded-full" :class="legend.dot" />
            {{ legend.label }}
          </span>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  Reservation,
  ReservationSource,
} from '../../../../../models/reservation.model'
import { usePropertyReservations } from '../../../../../composables/fireux/console/property/operations/Reservations/usePropertyReservations'
import { reservationSourceLabel } from '../../../../../utils/reservation-interface'

const {
  runtimeProperty,
  collection,
  summary,
  pending,
  error,
} = usePropertyReservations()

const today = new Date()
const visibleMonth = ref(
  new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
)
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const propertyName = computed(
  () => runtimeProperty.entity.value?.identity?.name || runtimeProperty.id.value
)
const monthLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(visibleMonth.value)
)
const todayKey = [
  today.getUTCFullYear(),
  String(today.getUTCMonth() + 1).padStart(2, '0'),
  String(today.getUTCDate()).padStart(2, '0'),
].join('-')

const attentionCount = computed(
  () =>
    collection.value.filter(
      (reservation) =>
        reservation.status !== 'cancelled' &&
        (reservation.sync.state === 'pending' ||
          reservation.sync.state === 'stale' ||
          reservation.sync.state === 'error')
    ).length
)

const calendarDays = computed(() => {
  const first = visibleMonth.value
  const mondayOffset = (first.getUTCDay() + 6) % 7
  const start = new Date(first)
  start.setUTCDate(first.getUTCDate() - mondayOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    const dateKey = date.toISOString().slice(0, 10)

    return {
      date: dateKey,
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === first.getUTCMonth(),
      isToday: dateKey === todayKey,
      reservations: collection.value.filter(
        (reservation) =>
          reservation.status !== 'cancelled' &&
          reservation.arrival_date <= dateKey &&
          dateKey < reservation.departure_date
      ),
    }
  })
})

const sourceLegend = [
  { source: 'direct', label: 'Direct', dot: 'bg-success' },
  { source: 'airbnb', label: 'Airbnb', dot: 'bg-error' },
  { source: 'booking_com', label: 'Booking.com', dot: 'bg-info' },
  { source: 'other', label: 'Other', dot: 'bg-accented' },
] as const

const sourceClasses = (source: ReservationSource) => {
  if (source === 'airbnb') return 'bg-error/10 text-error ring-error/25'
  if (source === 'booking_com') return 'bg-info/10 text-info ring-info/25'
  if (source === 'direct') return 'bg-success/10 text-success ring-success/25'
  return 'bg-muted text-highlighted ring-default'
}

const sourceLabel = (source: ReservationSource) =>
  reservationSourceLabel(source)

function moveMonth(delta: number) {
  visibleMonth.value = new Date(Date.UTC(
    visibleMonth.value.getUTCFullYear(),
    visibleMonth.value.getUTCMonth() + delta,
    1
  ))
}

function showToday() {
  visibleMonth.value = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  )
}
</script>
