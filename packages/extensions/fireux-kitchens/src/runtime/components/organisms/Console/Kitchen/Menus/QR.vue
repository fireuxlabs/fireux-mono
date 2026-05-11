<template>
  <section class="space-y-6">
    <UAlert
      v-if="!selectedKitchen"
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before creating a menu QR code."
    />

    <UAlert
      v-else-if="!kitchenSlug"
      color="warning"
      variant="soft"
      title="Missing kitchen slug"
      description="Add a public slug in Kitchen Identity before creating menu QR codes."
    />

    <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <UCard class="print-card">
        <template #header>
          <div class="console-card-header">
            <div>
              <div class="console-card-header__title">Menu QR</div>
              <p class="console-card-header__description">
                Print or download a QR code for the selected kitchen's public menu.
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-5">
          <UFormField label="Target menu">
            <select
              v-model="selectedMenuId"
              class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
            >
              <option value="">Default public menu</option>
              <option
                v-for="menu in menusSorted"
                :key="menu.id"
                :value="menu.id"
              >
                {{ menu.name }}
              </option>
            </select>
          </UFormField>

          <UFormField label="Public URL">
            <UInput
              :model-value="publicMenuUrl"
              readonly
            />
          </UFormField>

          <div class="flex flex-wrap gap-2 print:hidden">
            <UButton
              type="button"
              icon="i-lucide-printer"
              @click="printQr"
            >
              Print
            </UButton>

            <UButton
              type="button"
              variant="soft"
              icon="i-lucide-download"
              :disabled="!qrDataUrl"
              @click="downloadQr"
            >
              Download PNG
            </UButton>

            <UButton
              type="button"
              variant="ghost"
              icon="i-lucide-external-link"
              :to="publicMenuPath"
              target="_blank"
            >
              Open menu
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard class="qr-print-card">
        <div class="flex flex-col items-center gap-4 text-center">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
              {{ kitchenName }}
            </p>
            <h2 class="mt-1 text-xl font-semibold text-highlighted">
              {{ qrTitle }}
            </h2>
          </div>

          <div class="rounded-lg border border-default bg-white p-4">
            <img
              v-if="qrDataUrl"
              :src="qrDataUrl"
              alt="Public menu QR code"
              class="h-64 w-64"
            >
            <div
              v-else
              class="grid h-64 w-64 place-items-center rounded-md bg-elevated text-sm text-dimmed"
            >
              Creating QR code...
            </div>
          </div>

          <p class="max-w-xs break-all text-xs text-dimmed">
            {{ publicMenuUrl }}
          </p>
        </div>
      </UCard>
    </div>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Menu QR"
      scope="console"
      :data="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { toDataURL } from 'qrcode'
import { computed, ref, watch } from 'vue'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenus'

const {
  selectedKitchen,
  menus,
  selectedMode,
  kitchenId,
} = useKitchenConsoleMenus()

const PUBLIC_MENU_ORIGIN = 'http://misebox.app'
const selectedMenuId = ref('')
const qrDataUrl = ref('')
const isDev = import.meta.dev

const normalizeString = (value: unknown) => String(value ?? '').trim()

const kitchenName = computed(() =>
  normalizeString(selectedKitchen.value?.name)
)

const kitchenSlug = computed(() =>
  normalizeString((selectedKitchen.value as Record<string, unknown> | null)?.slug)
)

const menusSorted = computed(() =>
  [...menus.value].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      String(a.name).localeCompare(String(b.name))
  )
)

const selectedMenu = computed(() =>
  selectedMenuId.value
    ? menusSorted.value.find((menu) => menu.id === selectedMenuId.value) ?? null
    : null
)

const publicMenuPath = computed(() => {
  if (!kitchenSlug.value) return ''

  const kitchenPath = `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus`
  return selectedMenuId.value
    ? `${kitchenPath}/${encodeURIComponent(selectedMenuId.value)}`
    : kitchenPath
})

const publicMenuUrl = computed(() => {
  if (!publicMenuPath.value) return ''
  return new URL(publicMenuPath.value, PUBLIC_MENU_ORIGIN).toString()
})

const qrTitle = computed(() =>
  selectedMenu.value ? selectedMenu.value.name : 'Public menu'
)

const qrFileName = computed(() => {
  const suffix = selectedMenuId.value ? `-${selectedMenuId.value}` : ''
  return `${kitchenSlug.value}-menu${suffix}-qr.png`
})

const debug = computed(() => ({
  mode: selectedMode.value,
  kitchenId: kitchenId.value,
  kitchenSlug: kitchenSlug.value,
  selectedMenuId: selectedMenuId.value,
  publicMenuPath: publicMenuPath.value,
  publicMenuUrl: publicMenuUrl.value,
  menusCount: menus.value.length,
}))

watch(
  [publicMenuUrl, selectedKitchen],
  async ([url]) => {
    if (!import.meta.client) return

    if (!url) {
      qrDataUrl.value = ''
      return
    }

    try {
      qrDataUrl.value = await toDataURL(url, {
        width: 512,
        margin: 1,
        errorCorrectionLevel: 'M',
      })
    } catch {
      qrDataUrl.value = ''
    }
  },
  { immediate: true }
)

watch(
  menusSorted,
  (nextMenus) => {
    if (!selectedMenuId.value) return
    if (nextMenus.some((menu) => menu.id === selectedMenuId.value)) return
    selectedMenuId.value = ''
  },
  { immediate: true }
)

const printQr = () => {
  if (!import.meta.client || !publicMenuUrl.value) return
  window.print()
}

const downloadQr = () => {
  if (!import.meta.client || !qrDataUrl.value) return

  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = qrFileName.value
  link.click()
}
</script>

<style scoped>
@media print {
  :global(body) {
    background: white;
  }

  .print-card {
    display: none;
  }

  .qr-print-card {
    border: 0;
    box-shadow: none;
  }
}
</style>
