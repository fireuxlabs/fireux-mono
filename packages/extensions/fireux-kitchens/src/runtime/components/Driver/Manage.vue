<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <h2>Manage drivers</h2>
          <p>
            Temporary dispatch workbench for editing driver profile details.
          </p>
        </div>

        <UBadge color="neutral" variant="soft">
          {{ drivers.length }} drivers
        </UBadge>
      </div>
    </template>

    <ClientOnly>
      <div v-if="drivers.length" class="grid gap-4">
        <UPageCard
          v-for="driver in drivers"
          :key="driverId(driver)"
          variant="subtle"
        >
          <template #title>
            <span>{{ displayName(driver) }}</span>
          </template>

          <template #description>
            <span>{{ driverHandle(driver) || driverId(driver) }}</span>
          </template>

          <div class="grid gap-3">
            <UFormField label="Driver name">
              <UInput
                :model-value="draft(driver).driver_name"
                placeholder="Driver name"
                @update:model-value="draft(driver).driver_name = String($event ?? '')"
                @blur="saveDriver(driver)"
                @keydown.enter.prevent="saveDriver(driver)"
              />
            </UFormField>

            <UFormField label="Coverage radius">
              <div class="flex items-center gap-2">
                <UInput
                  :model-value="draft(driver).coverage_radius_m"
                  type="number"
                  min="0"
                  inputmode="numeric"
                  placeholder="1500"
                  @update:model-value="draft(driver).coverage_radius_m = String($event ?? '')"
                  @blur="saveDriver(driver)"
                  @keydown.enter.prevent="saveDriver(driver)"
                />
                <span class="text-sm text-dimmed">metres</span>
              </div>
            </UFormField>

            <DeliveryCoverageMap
              :key="coverageMapKey(driver)"
              compact
              :zones="coverageZones(driver)"
            />

            <p v-if="savingId === driverId(driver)" class="text-xs text-dimmed">
              Saving driver...
            </p>
          </div>
        </UPageCard>
      </div>

      <p v-else class="text-sm text-dimmed">
        No drivers found.
      </p>
    </ClientOnly>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { reactive, ref, watchEffect } from 'vue'
import { useDriverFetch } from '../../composables/fireux/firestore/profiles/Driver/fetch/useDriverFetch'
import { useDriverUpdate } from '../../composables/fireux/firestore/profiles/Driver/mutations/useDriverUpdate'
import type { Driver } from '../../models/driver.model'

type DriverEntry = Driver & { user?: any }
type DriverDraft = {
  driver_name: string
  coverage_radius_m: string
}

const { drivers } = useDriverFetch()
const { commitUpdate } = useDriverUpdate()
const toast = useToastify()
const drafts = reactive<Record<string, DriverDraft>>({})
const savingId = ref('')

watchEffect(() => {
  for (const driver of drivers.value as DriverEntry[]) {
    const id = driverId(driver)
    if (!id || drafts[id]) continue
    drafts[id] = makeDraft(driver)
  }
})

function draft(driver: DriverEntry): DriverDraft {
  const id = driverId(driver)
  if (!drafts[id]) drafts[id] = makeDraft(driver)
  return drafts[id]
}

function makeDraft(driver: DriverEntry): DriverDraft {
  return {
    driver_name: text(driver.driver_name || driver.user?.display_name),
    coverage_radius_m: numberText((driver as any).coverage?.radius_m) || '1500',
  }
}

async function saveDriver(driver: DriverEntry) {
  const id = driverId(driver)
  if (!id || savingId.value) return

  const next = draft(driver)
  const current = makeDraft(driver)
  if (
    next.driver_name.trim() === current.driver_name.trim() &&
    next.coverage_radius_m.trim() === current.coverage_radius_m.trim()
  ) {
    return
  }

  savingId.value = id
  const patch = {
    driver_name: next.driver_name.trim(),
    coverage: {
      radius_m: nonNegativeNumber(next.coverage_radius_m),
    },
  }

  try {
    await commitUpdate(patch, { id, scope: 'core' })
    toast.add({
      title: 'Driver saved',
      description: `${displayName(driver)} has been updated.`,
      icon: 'i-lucide-check',
    })
  } catch (error) {
    toast.add({
      title: 'Failed to save driver',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    })
  } finally {
    savingId.value = ''
  }
}

function displayName(driver: DriverEntry): string {
  return (
    text(draft(driver).driver_name) ||
    text(driver.user?.display_name) ||
    text(driver.driver_name) ||
    driverId(driver)
  )
}

function driverHandle(driver: DriverEntry): string {
  const handle = text(driver.user?.handle)
  return handle ? `@${handle}` : ''
}

function driverId(driver: DriverEntry): string {
  return text(driver.id || driver.user?.id)
}

function coverageZones(driver: DriverEntry) {
  return [
    {
      id: `${driverId(driver)}-coverage`,
      label: 'Driver coverage',
      radius_m: nonNegativeNumber(draft(driver).coverage_radius_m) || 1500,
      color: '#2fb7a0',
    },
  ]
}

function coverageMapKey(driver: DriverEntry): string {
  return [
    driverId(driver),
    nonNegativeNumber(draft(driver).coverage_radius_m) || 1500,
  ].join(':')
}

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function numberText(value: unknown): string {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? String(Math.round(number)) : ''
}

function nonNegativeNumber(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.round(number) : 0
}
</script>
