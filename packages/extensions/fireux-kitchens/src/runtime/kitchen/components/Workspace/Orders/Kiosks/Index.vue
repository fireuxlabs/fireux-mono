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
            :disabled="kitchensPending || !serviceOptions.length || activating"
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
          :disabled="
            !kitchenId ||
            !selectedOfferingId ||
            !selectedMenuId ||
            pendingMenus ||
            !['ready', 'empty'].includes(offeringsOutcome) ||
            activating
          "
          @click="activate"
        />
      </div>

      <MoleculesStateCard
        v-if="!['ready', 'empty'].includes(offeringsOutcome)"
        :state="
          offeringsOutcome === 'pending'
            ? 'loading'
            : offeringsOutcome === 'error'
              ? 'error'
              : 'empty'
        "
        :title="
          offeringsOutcome === 'pending'
            ? 'Loading kiosk offerings'
            : 'Kiosk offerings unavailable'
        "
      />
      <UAlert
        v-else-if="menusOutcome === 'error'"
        class="mt-4"
        color="error"
        variant="soft"
        title="Menus unavailable"
        description="Published Menus could not be read for this Kitchen. Try again or check your Kitchen Team access."
      />

      <UAlert
        v-else-if="!kitchensPending && kitchenId && !serviceOptions.length"
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

    <UCard v-if="loading || devices.length">
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
            :loading="loading"
            @click="refresh"
          />
        </div>
      </template>

      <div v-if="loading && !devices.length" class="py-6 text-sm text-dimmed">
        Loading Kiosks…
      </div>
      <div v-else-if="devices.length" class="divide-y divide-default">
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
import { computed, ref, watch } from 'vue'
import { navigateTo } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import type { KitchenKioskDeviceSummary } from '../../../../models/kiosk-device.model.ts'
import { kitchenOfferingSupportsKiosk } from '../../../../utils/kiosk-device'
import { useKitchenWorkspaceMenus } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenus'

defineOptions({ name: 'WorkspaceKitchenOrdersKiosks' })

const text = (value: unknown) => String(value ?? '').trim()
const { currentUser } = useAuth()
const toast = useToastify()
const {
  availableKitchens,
  kitchensPending,
  kitchenId,
  selectedKitchen,
  menus,
  pending: pendingMenus,
  outcome: menusOutcome,
  offerings,
  offeringsOutcome,
  selectKitchen,
} = useKitchenWorkspaceMenus()
const devices = ref<KitchenKioskDeviceSummary[]>([])
const selectedMenuId = ref('')
const selectedOfferingId = ref('')
const loading = ref(false)
const activating = ref(false)
const revokingId = ref('')
const kitchenOptions = computed(() =>
  availableKitchens.value.map((kitchen) => ({
    label: text(kitchen.presentation?.display_name) || text(kitchen.id),
    value: text(kitchen.id),
  }))
)
const serviceOptions = computed(() =>
  offerings.value
    .filter((service) => kitchenOfferingSupportsKiosk(service))
    .map((service) => ({ label: service.name, value: service.id }))
)
const selectedService = computed(() =>
  offerings.value.find((service) => service.id === selectedOfferingId.value)
)
type KioskMenuOption = { label: string; value: string }
const menuOptions = computed<KioskMenuOption[]>(() =>
  menus.value
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
)

watch(
  menuOptions,
  (options: KioskMenuOption[]) => {
    if (
      !options.some(
        (option: KioskMenuOption) => option.value === selectedMenuId.value
      )
    ) {
      selectedMenuId.value = ''
    }
  },
  { immediate: true }
)
watch(serviceOptions, (options) => {
  if (!options.some((option) => option.value === selectedOfferingId.value))
    selectedOfferingId.value = ''
})
watch(kitchenId, () => {
  selectedOfferingId.value = ''
  selectedMenuId.value = ''
})
watch(selectedOfferingId, () => {
  selectedMenuId.value = ''
})

const liveDevices = useLiveAsyncData<{
  ok: true
  devices: KitchenKioskDeviceSummary[]
}>(
  computed(
    () =>
      `kitchen-kiosks:${currentUser.value?.uid || ''}:${text(kitchenId.value)}`
  ),
  async (liveFetch) => {
    if (!kitchenId.value || !currentUser.value) return { ok: true, devices: [] }
    return liveFetch('/api/workspace/kitchen/kiosks', {
      headers: await authHeaders(),
      query: { kitchen_id: text(kitchenId.value) },
    })
  },
  { server: false }
)
watch(liveDevices.data, (value) => {
  devices.value = value?.devices || []
})

async function authHeaders() {
  const user = await useRequireUser()
  return { Authorization: `Bearer ${await user.getIdToken()}` }
}

function chooseKitchen(value: string | number) {
  const requestedKitchenId = text(value)
  const kitchen = availableKitchens.value.find(
    (item) => text(item.id) === requestedKitchenId
  )
  if (!kitchen || requestedKitchenId === text(kitchenId.value)) return

  selectedMenuId.value = ''
  selectKitchen(requestedKitchenId)
}

async function refresh() {
  const requestedKitchenId = text(kitchenId.value)
  if (!requestedKitchenId || loading.value) return
  loading.value = true
  try {
    await liveDevices.refresh()
    if (liveDevices.error.value) throw liveDevices.error.value
    const response = liveDevices.data.value || { devices: [] }
    if (requestedKitchenId === text(kitchenId.value)) {
      devices.value = response.devices
    }
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Kiosks could not be loaded.'
    )
  } finally {
    loading.value = false
  }
}

async function activate() {
  const requestedKitchenId = text(kitchenId.value)
  const requestedMenuId = text(selectedMenuId.value)
  const requestedServiceId = text(selectedOfferingId.value)
  if (
    !requestedKitchenId ||
    !requestedServiceId ||
    !requestedMenuId ||
    activating.value
  )
    return
  activating.value = true
  try {
    const headers = await authHeaders()
    if (
      requestedKitchenId !== text(kitchenId.value) ||
      requestedServiceId !== selectedOfferingId.value ||
      requestedMenuId !== selectedMenuId.value
    )
      return
    const response = await $fetch<{
      ok: true
      device: KitchenKioskDeviceSummary
    }>('/api/workspace/kitchen/kiosks', {
      method: 'POST',
      headers,
      body: {
        kitchen_id: requestedKitchenId,
        kitchen_offering_id: requestedServiceId,
        menu_id: requestedMenuId,
      },
    })
    toast.success('This tablet is now an active Kiosk.')
    await navigateTo(response.device.livePath)
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Kiosk could not be activated.'
    )
  } finally {
    activating.value = false
  }
}

async function revoke(kioskId: string) {
  const requestedKitchenId = text(kitchenId.value)
  if (!requestedKitchenId || !kioskId || revokingId.value) return
  revokingId.value = kioskId
  try {
    await $fetch(
      `/api/workspace/kitchen/kiosks/${encodeURIComponent(kioskId)}`,
      {
        method: 'DELETE',
        headers: await authHeaders(),
        query: { kitchen_id: requestedKitchenId },
      }
    )
    toast.success('Kiosk access revoked.')
    await refresh()
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Kiosk could not be revoked.'
    )
  } finally {
    revokingId.value = ''
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
