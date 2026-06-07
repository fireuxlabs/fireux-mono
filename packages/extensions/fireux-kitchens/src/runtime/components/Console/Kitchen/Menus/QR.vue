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

      <div class="grid gap-6 md:grid-cols-[1fr_320px]">
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
            <UButton
              icon="i-lucide-external-link"
              :to="publicMenuUrl"
              target="_blank"
            >
              Open menu
            </UButton>
            <UButton
              variant="soft"
              icon="i-lucide-download"
              :disabled="!qrArtworkDataUrl"
              @click="downloadQr"
            >
              Download
            </UButton>
          </div>
        </div>

        <div class="flex flex-col items-center gap-3 rounded-lg border border-default p-4 text-center">
          <div
            v-if="qrDataUrl"
            class="relative h-48 w-48 overflow-hidden rounded-2xl bg-white p-2"
          >
            <img
              :src="qrDataUrl"
              alt="Menu QR code"
              class="h-full w-full"
            />
            <div class="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white" />
            <ConsoleKitchenMenusCentreMark
              :logo="kitchenLogo"
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          <div v-else class="grid h-48 w-48 place-items-center rounded-2xl bg-elevated text-sm text-dimmed">
            Creating QR...
          </div>
          <p class="break-all text-xs text-dimmed">{{ publicMenuUrl }}</p>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { create } from 'qrcode'
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useKitchenConsoleMenus } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'
import ConsoleKitchenMenusCentreMark from './CentreMark.vue'

const { selectedKitchen, menus } = useKitchenConsoleMenus()
const fireuxConfig = useFireUXConfig()
const selectedMenuId = ref('')
const qrDataUrl = ref('')
const qrArtworkDataUrl = ref('')

const clean = (value: unknown) => String(value ?? '').trim()
const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const kitchenSlug = computed(() => clean(kitchen.value?.slug))
const kitchenLogo = computed(
  () => clean(kitchen.value?.display_image_url) || clean(kitchen.value?.image_url)
)
const canonicalOrigin = computed(() =>
  clean(fireuxConfig.siteUrl) ||
  (import.meta.client ? window.location.origin : '')
)
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
  if (!publicMenuPath.value || !canonicalOrigin.value) return publicMenuPath.value
  return new URL(publicMenuPath.value, canonicalOrigin.value).toString()
})

watch(
  publishedMenus,
  (next) => {
    if (next.some((menu) => menu.id === selectedMenuId.value)) return
    selectedMenuId.value =
      next.find((menu) => menu.id === 'main')?.id ??
      next[0]?.id ??
      ''
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
    qrDataUrl.value = buildRoundedQrDataUrl(url)
  },
  { immediate: true }
)

watch(
  [qrDataUrl, kitchenLogo],
  async ([qrUrl, logoUrl]) => {
    if (!import.meta.client || !qrUrl) {
      qrArtworkDataUrl.value = ''
      return
    }

    const logoSvgHref = await imageToSvgHref(logoUrl)
    qrArtworkDataUrl.value = buildQrArtwork(qrUrl, logoSvgHref)
  },
  { immediate: true }
)

function downloadQr() {
  if (!import.meta.client || !qrArtworkDataUrl.value || !selectedMenu.value) return
  const link = document.createElement('a')
  link.href = qrArtworkDataUrl.value
  link.download = `${kitchenSlug.value}-${selectedMenu.value.id}-qr.svg`
  link.click()
}

async function imageToSvgHref(src: string) {
  if (!src) return ''
  if (src.startsWith('data:')) return src

  try {
    const url = new URL(src, window.location.origin).toString()
    const blob = await fetch(url).then((response) => response.blob())
    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => resolve('')
      reader.readAsDataURL(blob)
    })
  } catch {
    return new URL(src, window.location.origin).toString()
  }
}

function buildQrArtwork(qrUrl: string, logoUrl: string) {
  const logo = logoUrl
    ? `<image href="${escapeSvg(logoUrl)}" x="412" y="392" width="200" height="118" preserveAspectRatio="xMidYMid meet" clip-path="url(#kitchen-logo-clip)" />`
    : `<path d="M470 430h84v74h-84z" fill="#ffffff" opacity=".82" />`
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 1024 1024">
  <defs>
    <clipPath id="kitchen-logo-clip">
      <rect x="412" y="392" width="200" height="118" rx="28" />
    </clipPath>
  </defs>
  <rect width="1024" height="1024" fill="#ffffff" />
  <image href="${escapeSvg(qrUrl)}" width="1024" height="1024" />
  <g>
    <rect x="256" y="256" width="512" height="512" rx="118" fill="#ffffff" />
    <rect x="320" y="320" width="384" height="384" rx="84" fill="#ffffff" />
    <rect x="362" y="350" width="302" height="192" rx="54" fill="#111827" />
    ${logo}
    <rect x="362" y="572" width="302" height="72" rx="36" fill="#111827" />
    <text x="500" y="618" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="900" fill="#ffffff" letter-spacing="2">
      FOOD MENU
    </text>
    <g transform="translate(602 594)" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m12 22-5-10-5 10" />
      <path d="M4 18h8" />
    </g>
  </g>
</svg>`.trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function buildRoundedQrDataUrl(value: string) {
  const qr = create(value, { errorCorrectionLevel: 'H' })
  const size = qr.modules.size
  const canvasSize = 1024
  const quiet = 72
  const moduleSize = (canvasSize - quiet * 2) / size
  const dotSize = moduleSize * 0.88
  const inset = (moduleSize - dotSize) / 2
  const radius = moduleSize * 0.32
  const modules = Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size)
    const column = index % size
    if (!qr.modules.data[index]) return ''

    const x = quiet + column * moduleSize + inset
    const y = quiet + row * moduleSize + inset

    return `<rect x="${round(x)}" y="${round(y)}" width="${round(dotSize)}" height="${round(dotSize)}" rx="${round(radius)}" fill="#111827" />`
  }).join('')
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 ${canvasSize} ${canvasSize}">
  <rect width="${canvasSize}" height="${canvasSize}" fill="#ffffff" />
  ${modules}
</svg>`.trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function round(value: number) {
  return Number(value.toFixed(2))
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
</script>
