<template>
  <div class="space-y-5">
    <div v-if="pending" class="grid min-h-64 place-items-center">
      <UIcon
        name="i-lucide-loader-circle"
        class="size-7 animate-spin text-dimmed"
      />
    </div>

    <UAlert
      v-else-if="outcome === 'denied'"
      color="warning"
      title="Reservation access unavailable"
    />

    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      variant="soft"
      title="Reservation unavailable"
    >
      <template #description
        ><MoleculesCopyError :message="String(error)"
      /></template>
    </UAlert>

    <UAlert
      v-else-if="!selected"
      color="neutral"
      variant="soft"
      title="Reservation not found"
      description="It may have been removed or does not belong to this property."
    />

    <template v-else>
      <section
        class="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]"
      >
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-xl font-semibold">
                    {{ selected.guest.display_name || 'Unnamed guest' }}
                  </h2>
                  <UBadge :color="sourceColor(selected.source)" variant="soft">
                    {{ sourceLabel(selected.source) }}
                  </UBadge>
                </div>
                <p class="mt-1 text-sm text-dimmed">
                  {{ formatDate(selected.arrival_date) }} →
                  {{ formatDate(selected.departure_date) }}
                </p>
              </div>

              <UBadge :color="statusColor(selected.status)" variant="soft">
                {{ statusLabel(selected.status) }}
              </UBadge>
            </div>
          </template>

          <dl class="grid gap-4 sm:grid-cols-2">
            <div class="fx-inset-panel">
              <dt class="text-xs text-dimmed">Stay</dt>
              <dd class="mt-1 font-medium">
                {{ nights(selected) }} nights · {{ selected.adults }} adults
                <template v-if="selected.children">
                  · {{ selected.children }} children
                </template>
              </dd>
            </div>
            <div class="fx-inset-panel">
              <dt class="text-xs text-dimmed">Value</dt>
              <dd class="mt-1 font-medium">{{ formattedTotal }}</dd>
            </div>
            <div class="fx-inset-panel">
              <dt class="text-xs text-dimmed">Channel reference</dt>
              <dd class="mt-1 font-medium">
                {{ selected.external_reference || 'Direct / none' }}
              </dd>
            </div>
            <div class="fx-inset-panel">
              <dt class="text-xs text-dimmed">Sync</dt>
              <dd class="mt-1">
                <UBadge
                  :color="syncColor(selected.sync.state)"
                  variant="subtle"
                >
                  {{ syncLabel(selected.sync.state) }}
                </UBadge>
              </dd>
            </div>
          </dl>

          <div class="mt-4">
            <p class="text-xs text-dimmed">Host notes</p>
            <p class="mt-1 whitespace-pre-wrap text-sm">
              {{ selected.notes || 'No private notes.' }}
            </p>
          </div>
        </UCard>

        <div class="space-y-4">
          <UCard>
            <template #header>
              <p class="font-semibold">Guest contact</p>
            </template>
            <div class="space-y-3 text-sm">
              <a
                v-if="selected.guest.email"
                :href="`mailto:${selected.guest.email}`"
                class="flex items-center gap-2 hover:text-primary"
              >
                <UIcon name="i-lucide-mail" class="size-4 text-dimmed" />
                {{ selected.guest.email }}
              </a>
              <a
                v-if="selected.guest.phone"
                :href="`tel:${selected.guest.phone}`"
                class="flex items-center gap-2 hover:text-primary"
              >
                <UIcon name="i-lucide-phone" class="size-4 text-dimmed" />
                {{ selected.guest.phone }}
              </a>
              <p
                v-if="!selected.guest.email && !selected.guest.phone"
                class="text-dimmed"
              >
                No contact details recorded.
              </p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <p class="font-semibold">Stay status</p>
            </template>
            <div class="grid gap-2">
              <UButton
                v-for="status in statusActions"
                :key="status.value"
                color="neutral"
                :variant="selected.status === status.value ? 'soft' : 'ghost'"
                :icon="status.icon"
                :disabled="
                  !canWrite || saving || selected.status === status.value
                "
                :loading="saving && pendingStatus === status.value"
                class="justify-start"
                @click="setStatus(status.value)"
              >
                {{ status.label }}
              </UButton>
            </div>
          </UCard>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { ReservationStatus } from '../../../models/reservation.model.ts'
import { usePropertyReservation } from '../../../composables/reservations/usePropertyReservation'
import { useReservationUpdate } from '../../../composables/reservations/useReservationUpdate'
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

const props = defineProps<{ reservationId: string }>()
const {
  runtimeProperty,
  reservation: selected,
  pending,
  error,
  outcome,
  canWrite,
} = usePropertyReservation(computed(() => props.reservationId))
const { updateReservation, captureIntent } = useReservationUpdate(runtimeProperty)
const toast = useToast()
const saving = ref(false)
const pendingStatus = ref<ReservationStatus | null>(null)
const statusActions: Array<{
  value: ReservationStatus
  label: string
  icon: string
}> = [
  { value: 'confirmed', label: 'Confirm stay', icon: 'i-lucide-circle-check' },
  { value: 'checked_in', label: 'Mark checked in', icon: 'i-lucide-log-in' },
  { value: 'checked_out', label: 'Mark checked out', icon: 'i-lucide-log-out' },
  {
    value: 'cancelled',
    label: 'Cancel reservation',
    icon: 'i-lucide-circle-x',
  },
]

const formattedTotal = computed(() => {
  const total = selected.value?.total
  if (!total) return 'Not recorded'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: total.currency_code,
  }).format(total.amount_minor / 100)
})

const formatDate = formatDateOnly
const nights = reservationNights
const sourceColor = reservationSourceColor
const sourceLabel = reservationSourceLabel
const statusColor = reservationStatusColor
const statusLabel = reservationStatusLabel
const syncColor = reservationSyncColor
const syncLabel = reservationSyncLabel

const captureRecord = useCommandScope([() => props.reservationId, () => runtimeProperty.id.value, canWrite])
watch([() => props.reservationId, () => runtimeProperty.id.value, canWrite], () => { saving.value = false; pendingStatus.value = null }, { flush: 'sync' })
async function setStatus(status: ReservationStatus) {
  if (!selected.value || !canWrite.value || saving.value) return
  const local = captureRecord()
  const owner = captureIntent()
  const isCurrent = () => local() && owner()
  saving.value = true
  pendingStatus.value = status
  try {
    await updateReservation({
      reservationId: selected.value.id,
      changes: { status },
    })
    if (!isCurrent()) return
    toast.add({
      title: 'Reservation updated',
      description: `Status changed to ${statusLabel(status)}.`,
      color: 'success',
    })
  } catch (cause) {
    if (!isCurrent()) return
    toast.add({
      title: 'Update failed',
      description: cause instanceof Error ? cause.message : 'Please try again.',
      color: 'error',
    })
  } finally {
    if (local()) { saving.value = false; pendingStatus.value = null }
  }
}
</script>
