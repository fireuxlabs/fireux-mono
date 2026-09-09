<template>
  <section class="workspace-surface">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <h1 class="text-lg font-semibold text-highlighted">Open a kiosk</h1>
          <p class="text-sm text-dimmed">
            Choose the Kitchen for this device.
          </p>
        </div>
      </template>

      <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <UFormField label="Kitchen" required>
          <USelect
            :model-value="kitchenId"
            :items="kitchenOptions"
            value-key="value"
            label-key="label"
            placeholder="Choose a Kitchen"
            :disabled="kitchensPending || !kitchenOptions.length"
            class="w-full"
            @update:model-value="chooseKitchen"
          />
        </UFormField>
        <UFormField v-if="menuOptions.length > 1" label="Menu" required>
          <USelect
            v-model="selectedMenuId"
            :items="menuOptions"
            value-key="value"
            label-key="label"
            placeholder="Choose a published Menu"
            class="w-full"
          />
        </UFormField>
        <UButton
          icon="i-lucide-monitor-up"
          label="Open kiosk"
          :loading="activating"
          :disabled="!kitchenId || !selectedMenuId || pendingMenus || activating"
          @click="activate"
        />
      </div>

      <UAlert
        v-if="menusOutcome === 'error'"
        class="mt-4"
        color="error"
        variant="soft"
        title="Menus unavailable"
        description="Published Menus could not be read for this Kitchen. Try again or check your Kitchen Team access."
      />

      <UAlert
        v-else-if="menusOutcome === 'empty'"
        class="mt-4"
        color="warning"
        variant="soft"
        title="No published Menu"
        :description="`Publish a Menu for ${selectedKitchenLabel || 'this Kitchen'} before activating a Kiosk device.`"
      />
    </UCard>

    <UCard v-if="loading || devices.length">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="font-semibold text-highlighted">Active kiosks</h2>
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
              {{ menuLabel(device.menuId) }} ·
              {{ expiryLabel(device.expiresAt) }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="device.current && device.status === 'active'"
              :to="device.livePath"
              color="primary"
              variant="soft"
              icon="i-lucide-external-link"
              label="Open live"
            />
            <UButton
              v-if="device.status === 'active'"
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
import { computed, ref, watch } from 'vue'
import { navigateTo } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import type { KitchenKioskDeviceSummary } from '../../../../models/kiosk-device.model.ts'
import { useKitchenWorkspaceMenus } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenus'

defineOptions({ name: 'WorkspaceKitchenOrdersKiosks' })

const text = (value: unknown) => String(value ?? '').trim()
const { currentUser } = useAuth()
const toast = useToastify()
const {
  availableKitchens,
  kitchensPending,
  kitchenId,
  menus,
  pending: pendingMenus,
  outcome: menusOutcome,
  selectKitchen,
} = useKitchenWorkspaceMenus()
const devices = ref<KitchenKioskDeviceSummary[]>([])
const selectedMenuId = ref('')
const loading = ref(false)
const activating = ref(false)
const revokingId = ref('')
const kitchenOptions = computed(() =>
  availableKitchens.value.map((kitchen) => ({
    label: text(kitchen.identity?.display_name) || text(kitchen.id),
    value: text(kitchen.id),
  }))
)
const selectedKitchenLabel = computed(
  () =>
    kitchenOptions.value.find((item) => item.value === text(kitchenId.value))
      ?.label || ''
)
type KioskMenuOption = { label: string; value: string }
const menuOptions = computed<KioskMenuOption[]>(() =>
  menus.value
    .filter((menu) => text(menu.status) === 'published')
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
      selectedMenuId.value = options[0]?.value || ''
    }
  },
  { immediate: true }
)

watch(
  () => `${text(kitchenId.value)}|${currentUser.value?.uid || ''}`,
  () => {
    const nextKitchenId = text(kitchenId.value)
    const uid = currentUser.value?.uid || ''
    devices.value = []
    if (nextKitchenId && uid) void refresh()
  },
  { immediate: true }
)

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
    const response = await $fetch<{
      ok: true
      devices: KitchenKioskDeviceSummary[]
    }>('/api/workspace/kitchen/kiosks', {
      headers: await authHeaders(),
      query: { kitchen_id: requestedKitchenId },
    })
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
  if (!requestedKitchenId || !requestedMenuId || activating.value) return
  activating.value = true
  try {
    const response = await $fetch<{
      ok: true
      device: KitchenKioskDeviceSummary
    }>('/api/workspace/kitchen/kiosks', {
      method: 'POST',
      headers: await authHeaders(),
      body: {
        kitchen_id: requestedKitchenId,
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
  menuOptions.value.find((item) => item.value === menuId)?.label || menuId
const statusLabel = (status: KitchenKioskDeviceSummary['status']) =>
  status === 'active' ? 'Active' : status === 'expired' ? 'Expired' : 'Revoked'
const expiryLabel = (value: string) => {
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? `expires ${date.toLocaleDateString()}`
    : 'expiry unavailable'
}
</script>
