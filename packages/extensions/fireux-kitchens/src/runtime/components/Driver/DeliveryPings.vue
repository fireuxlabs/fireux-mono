<!-- Concurrent edit — 2026-07-20 13:12 CEST — Driver dispatch privacy: render server-projected beacons without order PII. -->
<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <h2>Delivery beacons</h2>
          <p>Open delivery work without customer or payment details.</p>
        </div>

        <UBadge color="neutral" variant="soft">
          {{ dispatches.length }} open
        </UBadge>
      </div>
    </template>

    <div v-if="dispatches.length" class="grid gap-3">
      <UPageCard
        v-for="dispatch in dispatches"
        :key="`${dispatch.kitchen.id}:${dispatch.id}`"
        variant="subtle"
      >
        <template #title>
          <span>
            {{ dispatch.item_count }} item{{ dispatch.item_count === 1 ? '' : 's' }}
          </span>
        </template>

        <template #description>
          <span>{{ statusLabel(dispatch.status) }}</span>
        </template>

        <KitchenCardsPill
          :title="dispatch.kitchen.name || prettySlug(dispatch.kitchen.slug) || 'Kitchen'"
          subtitle="Delivery pickup"
          :show-badges="false"
        />

        <UAlert
          color="neutral"
          variant="soft"
          title="Private until assignment"
          description="Customer, destination, and payment details are not part of this dispatch beacon."
        />

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            size="sm"
            color="neutral"
            :variant="dispatch.watching ? 'solid' : 'soft'"
            icon="i-lucide-eye"
            :loading="watchingPendingId === dispatchKey(dispatch)"
            :disabled="dispatch.watching || Boolean(watchingPendingId)"
            @click="watchBeacon(dispatch)"
          >
            {{ dispatch.watching ? 'Watching' : 'Watch' }}
          </UButton>

          <span
            v-if="dispatch.watcher_count"
            class="text-xs font-medium text-dimmed"
          >
            {{ dispatch.watcher_count }} watching
          </span>
        </div>
      </UPageCard>
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      title="Dispatches unavailable"
      :description="error.message"
    />

    <div v-else-if="pending" class="grid gap-3">
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-32 w-full" />
    </div>

    <p v-else class="text-sm text-dimmed">
      No delivery beacons right now.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useDriverDispatches } from '../../composables/fireux/driver/useDriverDispatches'
import { useDriver } from '../../composables/fireux/driver/useDriver'
import type { DriverDispatchBeacon } from '../../models/driver/dispatch'

const { appProfile } = useDriver()
const { dispatches, pending, error, load, watchDispatch } = useDriverDispatches()
const toast = useToastify()
const watchingPendingId = ref('')

watch(
  () => String(appProfile.value?.id || '').trim(),
  (driverId: string) => {
    if (driverId) void load()
  },
  { immediate: true }
)

async function watchDispatchBeacon(dispatch: DriverDispatchBeacon) {
  if (watchingPendingId.value || dispatch.watching) return
  watchingPendingId.value = dispatchKey(dispatch)
  try {
    await watchDispatch(dispatch)
  } catch (watchError) {
    toast.add({
      title: 'Could not watch delivery',
      description:
        watchError instanceof Error ? watchError.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    })
  } finally {
    watchingPendingId.value = ''
  }
}

const watchBeacon = watchDispatchBeacon

function dispatchKey(dispatch: DriverDispatchBeacon) {
  return `${dispatch.kitchen.id}:${dispatch.id}`
}

function statusLabel(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function prettySlug(value: string) {
  return statusLabel(value.replaceAll('-', '_'))
}
</script>
