<template>
  <div class="workspace-surface workspace-surface--compact">
    <FireState v-if="pending" outcome="pending" />

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
        ><FireCopyError :message="String(error)"
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
      <UPageGrid as="section">
        <UCard>
          <template #header>
            <div class="card__header">
              <div>
                <div>
                  <h2 class="fx-type-card-heading">
                    {{ selected.guest.display_name || 'Unnamed guest' }}
                  </h2>
                  <UBadge :color="sourceColor(selected.source)" variant="soft">
                    {{ sourceLabel(selected.source) }}
                  </UBadge>
                </div>
                <p>
                  {{ formatDate(selected.arrival_date) }} →
                  {{ formatDate(selected.departure_date) }}
                </p>
              </div>

              <UBadge :color="statusColor(selected.status)" variant="soft">
                {{ statusLabel(selected.status) }}
              </UBadge>
            </div>
          </template>

          <dl class="workspace-surface__grid workspace-surface__grid--2">
            <div class="fx-inset-panel">
              <dt>Stay</dt>
              <dd>
                {{ nights(selected) }} nights · {{ selected.adults }} adults
                <template v-if="selected.children">
                  · {{ selected.children }} children
                </template>
              </dd>
            </div>
            <div class="fx-inset-panel">
              <dt>Value</dt>
              <dd>{{ formattedTotal }}</dd>
            </div>
            <div class="fx-inset-panel">
              <dt>Channel reference</dt>
              <dd>
                {{ selected.external_reference || 'Direct / none' }}
              </dd>
            </div>
            <div class="fx-inset-panel">
              <dt>Sync</dt>
              <dd>
                <UBadge
                  :color="syncColor(selected.sync.state)"
                  variant="subtle"
                >
                  {{ syncLabel(selected.sync.state) }}
                </UBadge>
              </dd>
            </div>
          </dl>

          <div>
            <p>Host notes</p>
            <p class="whitespace-pre-wrap">
              {{ selected.notes || 'No private notes.' }}
            </p>
          </div>
        </UCard>

        <div class="workspace-surface workspace-surface--compact">
          <UCard>
            <template #header>
              <p>Guest contact</p>
            </template>
            <div class="fx-card-body-stack">
              <ULink
                v-if="selected.guest.email"
                :to="`mailto:${selected.guest.email}`"
              >
                <UIcon name="i-lucide-mail" />
                {{ selected.guest.email }}
              </ULink>
              <ULink
                v-if="selected.guest.phone"
                :to="`tel:${selected.guest.phone}`"
              >
                <UIcon name="i-lucide-phone" />
                {{ selected.guest.phone }}
              </ULink>
              <p v-if="!selected.guest.email && !selected.guest.phone">
                No contact details recorded.
              </p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <p>Stay status</p>
            </template>
            <div class="fx-card-body-stack">
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
                @click="setStatus(status.value)"
              >
                {{ status.label }}
              </UButton>
            </div>
          </UCard>
        </div>
      </UPageGrid>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePropertyScope } from 'fireux-properties/runtime/property/composables/usePropertyScope'
import { usePropertyWorkspace } from 'fireux-properties/runtime/property/composables/workspace/usePropertyWorkspace'

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
} = usePropertyReservation(
  computed(() => props.reservationId),
  usePropertyScope(usePropertyWorkspace().id)
)
const { updateReservation, captureIntent } =
  useReservationUpdate(runtimeProperty)
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

const captureRecord = useCommandScope([
  () => props.reservationId,
  () => runtimeProperty.id.value,
  canWrite,
])
watch(
  [() => props.reservationId, () => runtimeProperty.id.value, canWrite],
  () => {
    saving.value = false
    pendingStatus.value = null
  },
  { flush: 'sync' }
)
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
    if (local()) {
      saving.value = false
      pendingStatus.value = null
    }
  }
}
</script>
