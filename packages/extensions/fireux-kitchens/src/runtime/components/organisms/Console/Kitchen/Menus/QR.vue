<template>
  <section class="space-y-4">
    <UAlert
      v-if="!publishedMenus.length"
      color="warning"
      variant="soft"
      title="No published menu"
      description="Publish a valid menu before creating a QR code."
    />

    <UCard v-else>
      <template #header>
        <div>
          <h2 class="text-base font-semibold text-highlighted">Menu QR</h2>
          <p class="text-sm text-dimmed">QR codes point to one exact published menu URL.</p>
        </div>
      </template>

      <div class="grid gap-6 md:grid-cols-[1fr_260px]">
        <div class="space-y-4">
          <UFormField label="Published menu">
            <select
              v-model="selectedMenuId"
              class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
            >
              <option
                v-for="menu in publishedMenus"
                :key="menu.id"
                :value="menu.id"
              >
                {{ menu.name }}
              </option>
            </select>
          </UFormField>

          <UFormField label="Public URL">
            <UInput :model-value="publicMenuUrl" readonly />
          </UFormField>

          <div class="flex flex-wrap gap-2">
            <UButton icon="i-lucide-external-link" :to="publicMenuPath" target="_blank">
              Open menu
            </UButton>
            <UButton
              variant="soft"
              icon="i-lucide-download"
              :disabled="!qrDataUrl"
              @click="downloadQr"
            >
              Download
            </UButton>
          </div>
        </div>

        <div class="flex flex-col items-center gap-3 rounded-lg border border-default p-4 text-center">
          <img v-if="qrDataUrl" :src="qrDataUrl" alt="Menu QR code" class="h-48 w-48" />
          <div v-else class="grid h-48 w-48 place-items-center rounded-md bg-elevated text-sm text-dimmed">
            Creating QR...
          </div>
          <p class="break-all text-xs text-dimmed">{{ publicMenuUrl }}</p>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { toDataURL } from 'qrcode'
import { computed, ref, watch } from 'vue'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'

const { selectedKitchen, menus } = useKitchenConsoleMenus()
const selectedMenuId = ref('')
const qrDataUrl = ref('')

const clean = (value: unknown) => String(value ?? '').trim()
const kitchenSlug = computed(() => clean((selectedKitchen.value as any)?.slug))
const publishedMenus = computed(() =>
  menus.value.filter((menu) => menu.status === 'published' && clean(menu.id))
)
const selectedMenu = computed(() =>
  publishedMenus.value.find((menu) => menu.id === selectedMenuId.value) ?? publishedMenus.value[0] ?? null
)
const publicMenuPath = computed(() =>
  kitchenSlug.value && selectedMenu.value
    ? `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus/${encodeURIComponent(selectedMenu.value.id)}`
    : ''
)
const publicMenuUrl = computed(() => {
  if (!publicMenuPath.value || !import.meta.client) return publicMenuPath.value
  return new URL(publicMenuPath.value, window.location.origin).toString()
})

watch(
  publishedMenus,
  (next) => {
    if (next.some((menu) => menu.id === selectedMenuId.value)) return
    selectedMenuId.value = next[0]?.id ?? ''
  },
  { immediate: true }
)

watch(
  publicMenuUrl,
  async (url) => {
    if (!import.meta.client || !url) {
      qrDataUrl.value = ''
      return
    }
    qrDataUrl.value = await toDataURL(url, { width: 384, margin: 1 })
  },
  { immediate: true }
)

function downloadQr() {
  if (!import.meta.client || !qrDataUrl.value || !selectedMenu.value) return
  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = `${kitchenSlug.value}-${selectedMenu.value.id}-qr.png`
  link.click()
}
</script>
