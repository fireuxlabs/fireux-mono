<template>
  <div class="workspace-surface workspace-surface--compact">
    <p v-if="outcome === 'pending'" role="status">Loading reservations…</p>
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Calendar unavailable"
      :description="error"
    >
      <template #actions><FireCopyError :message="error" /></template>
    </UAlert>
    <p v-else-if="outcome !== 'ready' && outcome !== 'empty'">
      Select an available Property to view reservations.
    </p>
    <template v-else>
      <UAlert
        v-if="truncated"
        color="warning"
        title="Showing a limited set of reservations"
        description="These totals and dates cover only the loaded records. This view does not prove availability."
      />
      <UPageGrid as="section">
        <UCard>
          <div class="card__header">
            <div>
              <p>Upcoming stays</p>
              <p>{{ summary.upcoming }}</p>
            </div>
            <UIcon name="i-lucide-calendar-check-2" />
          </div>
        </UCard>

        <UCard>
          <div class="card__header">
            <div>
              <p>Recorded nights</p>
              <p>
                {{ summary.occupiedNights }}
              </p>
            </div>
            <UIcon name="i-lucide-moon-star" />
          </div>
        </UCard>

        <UCard>
          <div class="card__header">
            <div>
              <p>Needs attention</p>
              <p>{{ attentionCount }}</p>
            </div>
            <UIcon name="i-lucide-refresh-cw" />
          </div>
        </UCard>
      </UPageGrid>

      <UCard>
        <template #header>
          <div class="card__header">
            <div>
              <p>{{ monthLabel }}</p>
              <p>{{ propertyName }} · Recorded stays</p>
            </div>

            <div>
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

        <FireState v-if="pending" outcome="pending" entity="reservations" />

        <div v-else class="overflow-x-auto">
          <div class="min-w-[760px]">
            <div class="grid grid-cols-7">
              <UCard v-for="weekday in weekdays" :key="weekday">
                {{ weekday }}
              </UCard>
            </div>

            <div class="grid grid-cols-7">
              <UCard
                v-for="day in calendarDays"
                :key="day.date"
                :ui="{ body: 'fx-card-body-stack' }"
              >
                <UBadge
                  :color="day.isToday ? 'primary' : 'neutral'"
                  :variant="day.inMonth ? 'soft' : 'outline'"
                >
                  {{ day.day }}
                </UBadge>

                <div class="fx-card-body-stack">
                  <UButton
                    v-for="reservation in day.reservations"
                    :key="reservation.id"
                    :to="`/workspace/property/reservations/${reservation.id}`"
                    block
                    size="xs"
                    variant="soft"
                    :color="sourceColor(reservation.source)"
                    :label="reservation.guest.display_name || 'Guest'"
                    :title="`${reservation.guest.display_name} · ${sourceLabel(reservation.source)}`"
                  />
                </div>
              </UCard>
            </div>
          </div>
        </div>

        <template #footer>
          <UBadge
            v-for="legend in sourceLegend"
            :key="legend.source"
            :color="legend.color"
            :label="legend.label"
            variant="soft"
          />
        </template>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePropertyScope } from 'fireux-properties/runtime/property/composables/usePropertyScope'
import { usePropertyWorkspace } from 'fireux-properties/runtime/property/composables/workspace/usePropertyWorkspace'

import { computed, ref } from 'vue'
import type {
  Reservation,
  ReservationSource,
} from '../../../models/reservation.model.ts'
import { usePropertyReservations } from '../../../composables/reservations/usePropertyReservations'
import { reservationSourceLabel } from '../../../utils/reservation-interface'

const {
  runtimeProperty,
  collection,
  summary,
  pending,
  error,
  outcome,
  truncated,
} = usePropertyReservations(usePropertyScope(usePropertyWorkspace().id))

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
  { source: 'direct', label: 'Direct', color: 'success' },
  { source: 'airbnb', label: 'Airbnb', color: 'error' },
  { source: 'booking_com', label: 'Booking.com', color: 'info' },
  { source: 'other', label: 'Other', color: 'neutral' },
] as const

const sourceColor = (source: ReservationSource) => {
  if (source === 'airbnb') return 'error'
  if (source === 'booking_com') return 'info'
  if (source === 'direct') return 'success'
  return 'neutral'
}

const sourceLabel = (source: ReservationSource) =>
  reservationSourceLabel(source)

function moveMonth(delta: number) {
  visibleMonth.value = new Date(
    Date.UTC(
      visibleMonth.value.getUTCFullYear(),
      visibleMonth.value.getUTCMonth() + delta,
      1
    )
  )
}

function showToday() {
  visibleMonth.value = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  )
}
</script>
