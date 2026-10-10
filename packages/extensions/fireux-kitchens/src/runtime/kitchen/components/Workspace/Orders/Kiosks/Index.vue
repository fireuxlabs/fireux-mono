<template>
  <section class="workspace-surface">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <h1 class="text-lg font-semibold text-highlighted">Open a kiosk</h1>
          <p class="text-sm text-dimmed">
            Choose what guests can order on this device.
          </p>
        </div>
      </template>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <UFormField label="Kitchen" required>
          <USelect
            :model-value="kitchenId"
            :items="kitchenOptions"
            value-key="value"
            label-key="label"
            placeholder="Choose a Kitchen"
            :disabled="kitchensPending || !kitchenOptions.length || activating"
            class="w-full"
            @update:model-value="chooseKitchen"
          />
        </UFormField>
        <UFormField label="Service" required>
          <USelect
            v-model="selectedOfferingId"
            :items="serviceOptions"
            value-key="value"
            label-key="label"
            placeholder="Choose a service"
            :disabled="!canManage || !serviceOptions.length || activating"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Menu" required>
          <USelect
            v-model="selectedMenuId"
            :items="menuOptions"
            value-key="value"
            label-key="label"
            placeholder="Choose a published Menu"
            :disabled="
              !canManage ||
              !selectedOfferingId ||
              pendingMenus ||
              !['ready', 'empty'].includes(offeringsOutcome) ||
              !menuOptions.length ||
              activating
            "
            class="w-full"
          />
        </UFormField>
      </div>
      <div class="mt-5 flex justify-end">
        <UButton
          icon="i-lucide-monitor-up"
          label="Open kiosk"
          :loading="activating"
          :disabled="!canActivate || activating || cookieCommandPending"
          @click="activate"
        />
      </div>

      <MoleculesStateCard
        v-if="ownerOutcome === 'error'"
        state="error"
        title="Kiosk setup unavailable"
        description="Your Kitchen access could not be loaded. Please try again."
      />
      <MoleculesStateCard
        v-else-if="ownerOutcome === 'pending'"
        state="loading"
        title="Loading Kitchen"
      />
      <UAlert
        v-else-if="!canManage"
        title="Select an available Kitchen"
        color="neutral"
      />
      <MoleculesStateCard
        v-else-if="offeringsOutcome === 'error'"
        state="error"
        title="Kiosk offerings unavailable"
      />
      <UAlert
        v-else-if="menusOutcome === 'error'"
        class="mt-4"
        color="error"
        variant="soft"
        title="Menus unavailable"
        description="Published Menus could not be read for this Kitchen. Try again or check your Kitchen Team access."
      />
      <MoleculesStateCard
        v-else-if="pendingMenus || offeringsOutcome === 'pending'"
        state="loading"
        title="Loading kiosk setup"
      />
      <UAlert
        v-else-if="!serviceOptions.length"
        class="mt-4"
        color="neutral"
        variant="soft"
        title="Set up a kiosk service"
        description="Enable a service with serving hours and an unpaused Eat in or Takeaway option."
      >
        <template #actions>
          <UButton
            to="/workspace/kitchen/offerings"
            label="Manage offerings"
            color="neutral"
            variant="outline"
          />
        </template>
      </UAlert>
      <UAlert
        v-else-if="selectedOfferingId && !pendingMenus && !menuOptions.length"
        class="mt-4"
        color="warning"
        variant="soft"
        title="No published Menu"
        description="Add a published Menu with items and prices to this service."
      />
    </UCard>

    <UCard v-if="devicesOutcome !== 'idle' && devicesOutcome !== 'missing'">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="font-semibold text-highlighted">Kiosk devices</h2>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-refresh-cw"
            aria-label="Refresh kiosks"
            :loading="refreshing || devicesPending"
            :disabled="!canManage || devicesPending || refreshing"
            @click="refresh"
          />
        </div>
      </template>

      <MoleculesStateCard
        v-if="devicesOutcome === 'error'"
        state="error"
        title="Kiosks unavailable"
        description="Devices could not be loaded. Please try again."
      />
      <div v-else-if="devicesPending" class="py-6 text-sm text-dimmed">
        Loading Kiosks…
      </div>
      <MoleculesStateCard
        v-else-if="devicesOutcome === 'empty'"
        state="empty"
        title="No kiosks activated"
        description="Open a kiosk on a trusted tablet to add it here."
      />
      <div v-else class="divide-y divide-default">
        <div
          v-for="device in devices"
          :key="device.id"
          class="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-medium text-highlighted">{{ device.label }}</p>
              <UBadge
                :color="device.status === 'active' ? 'success' : 'neutral'"
                variant="soft"
              >
                {{ statusLabel(device.status) }}
              </UBadge>
              <UBadge v-if="device.current" color="primary" variant="soft">
                This tablet
              </UBadge>
            </div>
            <p class="text-sm text-dimmed">
              {{ device.serviceName || 'Service not assigned' }} ·
              {{ menuLabel(device.menuId) }} ·
              {{ expiryLabel(device.expiresAt) }}
            </p>
            <p
              v-if="device.status === 'reactivation-required'"
              class="text-sm text-dimmed"
            >
              Revoke this old activation, then open a kiosk with a service on
              that device.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="
                device.current && device.status === 'active' && device.livePath
              "
              :to="device.livePath"
              color="primary"
              variant="soft"
              icon="i-lucide-external-link"
              label="Open live"
            />
            <UButton
              v-if="device.status !== 'revoked'"
              color="error"
              variant="ghost"
              icon="i-lucide-monitor-x"
              label="Revoke"
              :loading="revokingId === device.id"
              :disabled="
                !canManage ||
                Boolean(revokingId) ||
                activating ||
                cookieCommandPending
              "
              @click="revoke(device.id)"
            />
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { navigateTo, useState } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenAccess } from '../../../../composables/useKitchenAccess'
import type { KitchenKioskDeviceSummary } from '../../../../models/kiosk-device.model.ts'
import {
  kitchenOfferingSupportsKiosk,
  readKitchenKioskActivationPath,
} from '../../../../utils/kiosk-device'
import { useKitchenWorkspaceMenus } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenus'

defineOptions({ name: 'WorkspaceKitchenOrdersKiosks' })

const text = (value: unknown) => String(value ?? '').trim()
const { currentUser } = useAuth()
const config = useFireUXConfig()
const session = useAppSession()
const access = useKitchenAccess()
const toast = useToastify()
const {
  availableKitchens,
  kitchensPending,
  kitchenId,
  storageKitchenId,
  selectedKitchen,
  canWrite,
  menus,
  pending: pendingMenus,
  outcome: menusOutcome,
  offerings,
  offeringsOutcome,
  selectKitchen,
} = useKitchenWorkspaceMenus()
const selectedMenuId = ref('')
const selectedOfferingId = ref('')
const refreshing = ref(false)
const activating = ref(false)
const revokingId = ref('')
// Serialize this app instance's cookie writers across owner resets and remounts.
const cookieCommandPending = useState<boolean>(
  'kitchen-kiosk-cookie-command',
  () => false
)
const surfaceActive = ref(true)
onScopeDispose(() => {
  surfaceActive.value = false
})
const canManage = computed(() =>
  Boolean(
    surfaceActive.value &&
      currentUser.value &&
      session.appUser.value &&
      !session.pending.value &&
      !session.error.value &&
      canWrite.value &&
      storageKitchenId.value &&
      storageKitchenId.value === kitchenId.value &&
      access.outcome.value === 'ready' &&
      access.ids.value.includes(storageKitchenId.value)
  )
)
const ownerOutcome = computed(() => {
  if (!surfaceActive.value || !currentUser.value) return 'idle'
  if (session.error.value || access.outcome.value === 'error') return 'error'
  if (session.pending.value || access.outcome.value === 'pending')
    return 'pending'
  if (!storageKitchenId.value)
    return kitchenId.value ? menusOutcome.value : 'idle'
  return canManage.value ? 'ready' : 'idle'
})
const kitchenOptions = computed(() =>
  availableKitchens.value.map((kitchen) => ({
    label: text(kitchen.presentation?.display_name) || text(kitchen.id),
    value: text(kitchen.id),
  }))
)
const serviceOptions = computed(() =>
  canManage.value && offeringsOutcome.value === 'ready'
    ? offerings.value
        .filter((service) => kitchenOfferingSupportsKiosk(service))
        .map((service) => ({ label: service.name, value: service.id }))
    : []
)
const selectedService = computed(() =>
  serviceOptions.value.some(
    (option) => option.value === selectedOfferingId.value
  )
    ? offerings.value.find((service) => service.id === selectedOfferingId.value)
    : undefined
)
type KioskMenuOption = { label: string; value: string }
const menuOptions = computed<KioskMenuOption[]>(() =>
  canManage.value && menusOutcome.value === 'ready'
    ? menus.value
        .filter(
          (menu) =>
            text(menu.status) === 'published' &&
            !text(menu.doc?.url) &&
            selectedService.value?.menu_ids.includes(text(menu.id))
        )
        .map((menu) => ({
          label: text(menu.name) || text(menu.id),
          value: text(menu.id),
        }))
        .filter((item) => item.value)
    : []
)
const activationPath = computed(() => {
  if (!menuOptions.value.some((menu) => menu.value === selectedMenuId.value))
    return ''
  const menu = menus.value.find((row) => row.id === selectedMenuId.value)
  const kitchenSlug = text(selectedKitchen.value?.slug)
  const menuSlug = text(menu?.slug)
  return kitchenSlug && menuSlug && selectedOfferingId.value
    ? `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(menuSlug)}.kiosk?offering=${encodeURIComponent(selectedOfferingId.value)}`
    : ''
})
const canActivate = computed(() =>
  Boolean(canManage.value && selectedService.value && activationPath.value)
)

const ownerEpoch = ref(0)
const settledEpoch = ref(-1)
const selectionEpoch = ref(0)
const ownerSources = [
  currentUser,
  () => config.appId,
  () => JSON.stringify(session.appUser.value),
  session.pending,
  session.error,
  kitchenId,
  storageKitchenId,
  () => JSON.stringify(access.ids.value),
  access.outcome,
  canManage,
]
const captureOwnerIntent = useCommandScope(ownerSources)
watch(
  ownerSources,
  () => {
    ownerEpoch.value += 1
    selectedOfferingId.value = ''
    selectedMenuId.value = ''
  },
  { flush: 'sync' }
)
const actionSources = [
  ...ownerSources,
  selectedOfferingId,
  selectedMenuId,
  activationPath,
  selectionEpoch,
]
const captureActionIntent = useCommandScope(actionSources)
watch(
  actionSources,
  () => {
    refreshing.value = false
    activating.value = false
    revokingId.value = ''
  },
  { flush: 'sync' }
)
watch(
  menuOptions,
  (options) => {
    if (!options.some((option) => option.value === selectedMenuId.value))
      selectedMenuId.value = ''
  },
  { immediate: true, flush: 'sync' }
)
watch(
  serviceOptions,
  (options) => {
    if (!options.some((option) => option.value === selectedOfferingId.value))
      selectedOfferingId.value = ''
  },
  { flush: 'sync' }
)
watch(
  selectedOfferingId,
  () => {
    selectedMenuId.value = ''
  },
  { flush: 'sync' }
)

const liveDevices = useLiveAsyncData<{
  epoch: number
  devices: KitchenKioskDeviceSummary[]
} | null>(
  computed(
    () =>
      `kitchen-kiosks:${config.appId}:${currentUser.value?.uid || ''}:${storageKitchenId.value}:${ownerEpoch.value}`
  ),
  async (liveFetch) => {
    const readEpoch = ownerEpoch.value
    const isCurrent = captureOwnerIntent()
    const requestedKitchenId = storageKitchenId.value
    if (!canManage.value || !requestedKitchenId) return null
    try {
      const headers = await authHeaders(isCurrent)
      if (!isCurrent()) return null
      const response = await liveFetch<{
        ok: true
        devices: KitchenKioskDeviceSummary[]
      }>('/api/workspace/kitchen/kiosks', {
        headers,
        query: { kitchen_id: requestedKitchenId },
      })
      if (!isCurrent()) return null
      if (response?.ok !== true || !Array.isArray(response.devices))
        throw new Error('Kiosk devices could not be read.')
      settledEpoch.value = readEpoch
      return { epoch: readEpoch, devices: response.devices }
    } catch (error) {
      if (!isCurrent()) return null
      settledEpoch.value = readEpoch
      throw error
    }
  },
  { server: false }
)
const devicesOutcome = computed(() => {
  if (ownerOutcome.value !== 'ready') return ownerOutcome.value
  return resolveReadOutcome({
    active: canManage.value,
    current:
      settledEpoch.value === ownerEpoch.value &&
      (Boolean(liveDevices.error.value) ||
        liveDevices.data.value?.epoch === ownerEpoch.value),
    pending: liveDevices.pending.value,
    error: liveDevices.error.value,
    kind: 'collection',
    present: Boolean(liveDevices.data.value?.devices.length),
  })
})
const devicesPending = computed(() => devicesOutcome.value === 'pending')
const devices = computed(() =>
  devicesOutcome.value === 'ready' ? liveDevices.data.value?.devices || [] : []
)

async function authHeaders(isCurrent: () => boolean) {
  const user = currentUser.value
  if (!user || !canManage.value)
    throw new Error('Select a Kitchen you can manage.')
  const token = await user.getIdToken()
  if (!token || !isCurrent() || currentUser.value !== user || !canManage.value)
    throw new Error(
      'The selected Kitchen or account changed. Please try again.'
    )
  return { Authorization: `Bearer ${token}` }
}

function chooseKitchen(value: string | number) {
  const requestedKitchenId = text(value)
  if (
    !availableKitchens.value.some(
      (kitchen) => kitchen.id === requestedKitchenId
    )
  )
    return
  selectionEpoch.value += 1
  if (requestedKitchenId === kitchenId.value) return
  selectedOfferingId.value = ''
  selectedMenuId.value = ''
  return selectKitchen(requestedKitchenId)
}

async function refresh() {
  if (!canManage.value || refreshing.value) return
  const isCurrent = captureActionIntent()
  refreshing.value = true
  try {
    await liveDevices.refresh()
    if (!isCurrent()) return
    if (liveDevices.error.value) throw liveDevices.error.value
  } catch (error) {
    if (isCurrent())
      toast.error(
        error instanceof Error ? error.message : 'Kiosks could not be loaded.'
      )
  } finally {
    if (isCurrent()) refreshing.value = false
  }
}

async function activate() {
  if (!canActivate.value || activating.value || cookieCommandPending.value)
    return
  const requestedKitchenId = storageKitchenId.value
  const requestedMenuId = selectedMenuId.value
  const requestedOfferingId = selectedOfferingId.value
  const requestedPath = activationPath.value
  const isCurrent = captureActionIntent()
  activating.value = true
  cookieCommandPending.value = true
  try {
    const headers = await authHeaders(isCurrent)
    if (!isCurrent() || !canActivate.value) return
    const response = await $fetch('/api/workspace/kitchen/kiosks', {
      method: 'POST',
      headers,
      retry: 0,
      body: {
        kitchen_id: requestedKitchenId,
        kitchen_offering_id: requestedOfferingId,
        menu_id: requestedMenuId,
      },
    })
    if (!isCurrent()) return
    const path = readKitchenKioskActivationPath(response, {
      menuId: requestedMenuId,
      kitchenOfferingId: requestedOfferingId,
      livePath: requestedPath,
    })
    toast.success('This tablet is now an active Kiosk.')
    await navigateTo(path)
  } catch (error) {
    if (isCurrent())
      toast.error(
        error instanceof Error ? error.message : 'Kiosk could not be activated.'
      )
  } finally {
    cookieCommandPending.value = false
    if (isCurrent()) activating.value = false
  }
}

async function revoke(kioskId: string) {
  const device = devices.value.find((row) => row.id === kioskId)
  if (
    !canManage.value ||
    !device ||
    device.status === 'revoked' ||
    revokingId.value ||
    cookieCommandPending.value
  )
    return
  const requestedKitchenId = storageKitchenId.value
  const isCurrent = captureActionIntent()
  revokingId.value = kioskId
  cookieCommandPending.value = true
  try {
    const headers = await authHeaders(isCurrent)
    if (
      !isCurrent() ||
      !devices.value.some(
        (row) => row.id === kioskId && row.status !== 'revoked'
      )
    )
      return
    const response = await $fetch<{ ok: true; kioskId: string }>(
      `/api/workspace/kitchen/kiosks/${encodeURIComponent(kioskId)}`,
      {
        method: 'DELETE',
        headers,
        query: { kitchen_id: requestedKitchenId },
        retry: 0,
      }
    )
    if (!isCurrent()) return
    if (response?.ok !== true || response.kioskId !== kioskId)
      throw new Error('Kiosk revocation did not match the requested device.')
    toast.success('Kiosk access revoked.')
    await refresh()
  } catch (error) {
    if (isCurrent())
      toast.error(
        error instanceof Error ? error.message : 'Kiosk could not be revoked.'
      )
  } finally {
    cookieCommandPending.value = false
    if (isCurrent() && revokingId.value === kioskId) revokingId.value = ''
  }
}

const menuLabel = (menuId: string) =>
  text(menus.value.find((item) => text(item.id) === menuId)?.name) || menuId
const statusLabel = (status: KitchenKioskDeviceSummary['status']) =>
  status === 'active'
    ? 'Active'
    : status === 'expired'
      ? 'Expired'
      : status === 'reactivation-required'
        ? 'Reactivate'
        : 'Revoked'
const expiryLabel = (value: string) => {
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? `expires ${date.toLocaleDateString()}`
    : 'expiry unavailable'
}
</script>
