<template>
  <div class="workspace-surface workspace-surface--compact">
    <p v-if="outcome === 'pending'" role="status">Loading reservations…</p>
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Reservations unavailable"
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
      <section class="grid gap-3 sm:grid-cols-3">
        <UCard>
          <p>Reservations</p>
          <p class="mt-1">{{ summary.total }}</p>
        </UCard>
        <UCard>
          <p>Confirmed</p>
          <p class="mt-1">
            {{ summary.statuses.confirmed }}
          </p>
        </UCard>
        <UCard>
          <p>Enquiries & holds</p>
          <p class="mt-1">
            {{ summary.statuses.inquiry + summary.statuses.hold }}
          </p>
        </UCard>
      </section>

      <UCard>
        <template #header>
          <div>
            <p>Stay ledger</p>
            <p>Channel provenance stays attached to every reservation.</p>
          </div>
        </template>

        <div v-if="pending" class="grid min-h-48 place-items-center">
          <UIcon name="i-lucide-loader-circle" class="animate-spin" />
        </div>

        <div v-else-if="collection.length" class="divide-y divide-default">
          <NuxtLink
            v-for="reservation in collection"
            :key="reservation.id"
            :to="`/workspace/property/reservations/${reservation.id}`"
            class="grid gap-4 py-4 transition first:pt-0 last:pb-0 hover:opacity-80 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="truncate">
                  {{ reservation.guest.display_name || 'Unnamed guest' }}
                </p>
                <UBadge
                  :color="sourceColor(reservation.source)"
                  variant="soft"
                  size="sm"
                >
                  {{ sourceLabel(reservation.source) }}
                </UBadge>
              </div>
              <p class="mt-1">
                {{ formatDate(reservation.arrival_date) }} →
                {{ formatDate(reservation.departure_date) }} ·
                {{ nights(reservation) }} nights ·
                {{ reservation.adults + reservation.children }} guests
              </p>
            </div>

            <div class="flex items-center">
              <UBadge
                :color="syncColor(reservation.sync.state)"
                variant="subtle"
                size="sm"
              >
                {{ syncLabel(reservation.sync.state) }}
              </UBadge>
            </div>

            <div class="flex items-center justify-between gap-3 sm:justify-end">
              <UBadge
                :color="statusColor(reservation.status)"
                variant="soft"
                size="sm"
              >
                {{ statusLabel(reservation.status) }}
              </UBadge>
              <UIcon name="i-lucide-chevron-right" />
            </div>
          </NuxtLink>
        </div>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No reservations yet"
          description="Add a direct booking or connect a booking channel when the channel adapter is enabled."
        />
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePropertyScope } from 'fireux-properties/runtime/property/composables/usePropertyScope'
import { usePropertyWorkspace } from 'fireux-properties/runtime/property/composables/workspace/usePropertyWorkspace'

import { usePropertyReservations } from '../../../composables/reservations/usePropertyReservations'
import {
  reservationSourceColor,
  reservationSourceLabel,
  reservationStatusColor,
  reservationStatusLabel,
  reservationSyncColor,
  reservationSyncLabel,
} from '../../../utils/reservation-interface'
import {
  formatDateOnly,
  reservationNights,
} from '../../../utils/reservation-date'

const { collection, summary, pending, error, outcome, truncated } =
  usePropertyReservations(usePropertyScope(usePropertyWorkspace().id))

const formatDate = formatDateOnly
const nights = reservationNights
const sourceColor = reservationSourceColor
const sourceLabel = reservationSourceLabel
const statusColor = reservationStatusColor
const statusLabel = reservationStatusLabel
const syncColor = reservationSyncColor
const syncLabel = reservationSyncLabel
</script>
