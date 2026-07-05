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
          <p class="text-sm text-dimmed">QR codes point to a menu or a locked ordering funnel.</p>
        </div>
      </template>

      <div class="grid gap-6 md:grid-cols-[1fr_320px]">
        <div class="space-y-4">
          <UFormField label="URL">
            <UInput :model-value="menuUrl" readonly />
          </UFormField>

          <div class="space-y-2">
            <p class="text-sm font-semibold text-highlighted">
              Menus and QR targets
            </p>

            <div class="grid gap-3">
              <div
                v-if="menuPickerTarget"
                class="qr-menu-group"
              >
                <div class="qr-menu-group__header">
                  <span>
                    <strong>Menu picker</strong>
                    <small>Kitchen-level index for all published menus.</small>
                  </span>
                  <UBadge color="neutral" variant="soft">
                    1 QR
                  </UBadge>
                </div>

                <button
                  type="button"
                  class="qr-target"
                  :class="{ 'qr-target--active': menuPickerTarget.id === selectedTargetId }"
                  :aria-pressed="menuPickerTarget.id === selectedTargetId"
                  @click="selectedTargetId = menuPickerTarget.id"
                >
                  <span class="qr-target__copy">
                    <strong>{{ menuPickerTarget.label }}</strong>
                    <small>{{ menuPickerTarget.description }}</small>
                  </span>

                  <code>{{ menuPickerTarget.path }}</code>
                </button>
              </div>

              <div
                v-for="group in qrMenuGroups"
                :key="group.id"
                class="qr-menu-group"
              >
                <div class="qr-menu-group__header">
                  <span>
                    <strong>{{ group.label }}</strong>
                    <small>{{ group.description }}</small>
                  </span>
                  <UBadge color="neutral" variant="soft">
                    {{ group.targets.length }} QR{{ group.targets.length === 1 ? '' : 's' }}
                  </UBadge>
                </div>

                <div class="grid gap-2">
                  <button
                    v-for="target in group.targets"
                    :key="target.id"
                    type="button"
                    class="qr-target"
                    :class="{ 'qr-target--active': target.id === selectedTargetId }"
                    :aria-pressed="target.id === selectedTargetId"
                    @click="selectedTargetId = target.id"
                  >
                    <span class="qr-target__copy">
                      <strong>{{ target.label }}</strong>
                      <small>{{ target.description }}</small>
                    </span>

                    <code>{{ target.path }}</code>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              icon="i-lucide-external-link"
              :to="menuUrl"
              target="_blank"
            >
              Open target
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
            <div class="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-white" />
            <ConsoleKitchenOperationsMenusQRCentreMark
              :label="kitchenName"
              :logo="kitchenLogo"
              class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          <div v-else class="grid h-48 w-48 place-items-center rounded-2xl bg-elevated text-sm text-dimmed">
            Creating QR...
          </div>
          <p class="break-all text-xs text-dimmed">{{ menuUrl }}</p>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { create } from 'qrcode'
import { computed, ref, watch } from 'vue'
import { useKitchenConsoleMenus } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import { useKitchenMenuUrl } from '../../../../../../composables/fireux/kitchen/menu/useKitchenMenuUrl'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'
import type { Menu } from '../../../../../../models/kitchen/menu/menu.model'
import type { MenuRouteContext } from '../../../../../../models/kitchen/menu/menu-context.model'
import { menuOrderTypeLabel } from '../../../../../../utils/menu-ordering-ui'
import ConsoleKitchenOperationsMenusQRCentreMark from './CentreMark.vue'

const { selectedKitchen, menus, activeKitchenAppId } = useKitchenConsoleMenus()
const qrDataUrl = ref('')
const qrArtworkDataUrl = ref('')
const selectedTargetId = ref('')

const clean = (value: unknown) => String(value ?? '').trim()
const orderTypes = new Set<KitchenOrderType>([
  'dine_in',
  'eat_in',
  'takeaway',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
])
const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const kitchenSlug = computed(() => clean(kitchen.value?.slug))
const kitchenName = computed(
  () => clean(kitchen.value?.display_name) || clean(kitchen.value?.name) || kitchenSlug.value
)
const kitchenLogo = computed(
  () => clean(kitchen.value?.display_image_url) || clean(kitchen.value?.image_url)
)
const menuUrlResolver = useKitchenMenuUrl({
  appId: activeKitchenAppId,
  kitchenSlug,
})
const publishedMenus = computed(() =>
  menus.value.filter((menu) => menu.status === 'published' && clean(menu.id))
)
const menuPickerTarget = computed(() =>
  publishedMenus.value.length > 1
    ? makeMenuPickerTarget()
    : null
)
const qrMenuGroups = computed(() => buildQrMenuGroups(publishedMenus.value))
const qrTargets = computed(() => [
  ...(menuPickerTarget.value ? [menuPickerTarget.value] : []),
  ...qrMenuGroups.value.flatMap((group) => group.targets),
])
const selectedQrTarget = computed(() =>
  qrTargets.value.find((target) => target.id === selectedTargetId.value) ||
    qrTargets.value[0] ||
    null
)
const menuPath = computed(() => selectedQrTarget.value?.path || '')
const menuUrl = computed(() => selectedQrTarget.value?.url || '')

watch(
  menuUrl,
  async (url: string) => {
    if (!import.meta.client || !url) {
      qrDataUrl.value = ''
      return
    }
    qrDataUrl.value = buildRoundedQrDataUrl(url)
  },
  { immediate: true }
)

watch(
  [qrDataUrl, kitchenLogo, kitchenName],
  async ([qrUrl, logoUrl, label]: [string, string, string]) => {
    if (!import.meta.client || !qrUrl) {
      qrArtworkDataUrl.value = ''
      return
    }

    const logoSvgHref = await imageToSvgHref(logoUrl)
    qrArtworkDataUrl.value = buildQrArtwork(qrUrl, logoSvgHref, label)
  },
  { immediate: true }
)

watch(
  qrTargets,
  (targets: QrTarget[]) => {
    if (targets.some((target) => target.id === selectedTargetId.value)) return

    selectedTargetId.value = targets[0]?.id || ''
  },
  { immediate: true }
)

function downloadQr() {
  if (!import.meta.client || !qrArtworkDataUrl.value || !menuPath.value) return
  const link = document.createElement('a')
  link.href = qrArtworkDataUrl.value
  link.download = `${downloadSlug(kitchenSlug.value)}-${downloadSlug(selectedQrTarget.value?.id || 'menu')}-qr.svg`
  link.click()
}

type QrTarget = {
  id: string
  label: string
  description: string
  path: string
  url: string
}

type QrMenuGroup = {
  id: string
  label: string
  description: string
  targets: QrTarget[]
}

function buildQrMenuGroups(sourceMenus: Menu[]): QrMenuGroup[] {
  return sourceMenus.map((menu) => {
    const menuId = clean(menu.id)
    const menuName = clean(menu.name) || menuId
    const targets: QrTarget[] = []

    addTarget(targets, {
      id: `${menuId}:browse`,
      label: 'Readable menu',
      description: 'Readable menu.',
      path: menuUrlResolver.menuPath(menuId),
      url: menuUrlResolver.menuUrl(menuId),
    })

    const enabledTypes = enabledOrderTypes(menu)

    if (enabledTypes.includes('delivery') || enabledTypes.includes('collection')) {
      const homeModes = enabledTypes
        .filter((type) => type === 'delivery' || type === 'collection')
        .map((type) => menuOrderTypeLabel(type))
        .join(', ')

      addMenuContextTarget(targets, {
        menuId,
        menuName,
        context: 'home',
        label: 'Home Delivery',
        description: homeModes || 'Delivery and collection.',
      })
    }

    ;([
      'dine_in',
      'eat_in',
      'takeaway',
      'pre_order',
      'room_service',
    ] as const).forEach((type) => {
      if (!enabledTypes.includes(type)) return

      addMenuContextTarget(targets, {
        menuId,
        menuName,
        context: type,
        label: menuOrderTypeLabel(type),
        description: `${menuOrderTypeLabel(type)} funnel.`,
      })
    })

    return {
      id: menuId,
      label: menuName,
      description: enabledTypes.length
        ? `${enabledTypes.length} order mode${enabledTypes.length === 1 ? '' : 's'} plus readable menu.`
        : 'Readable menu only.',
      targets,
    }
  }).filter((group) => Boolean(group.id && group.targets.length))
}

function makeMenuPickerTarget(): QrTarget | null {
  const target = {
    id: 'menu-picker',
    label: 'Menu picker',
    description: 'Let guests choose from the published menus.',
    path: menuUrlResolver.menuIndexPath.value,
    url: menuUrlResolver.menuIndexUrl.value,
  }

  return target.path && target.url ? target : null
}

function enabledOrderTypes(menu: Menu): KitchenOrderType[] {
  if (!menu.ordering?.enabled) return []

  return (menu.ordering.order_types || [])
    .map((config) => clean(config?.type))
    .filter((type): type is KitchenOrderType =>
      orderTypes.has(type as KitchenOrderType)
    )
}

function addMenuContextTarget(targets: QrTarget[], options: {
  menuId: string
  menuName: string
  context: MenuRouteContext
  label: string
  description: string
}) {
  const contextualMenuId = `${options.menuId}.${options.context}`

  addTarget(targets, {
    id: `${options.menuId}:${options.context}`,
    label: options.label,
    description: `${options.menuName} · ${options.description}`,
    path: menuUrlResolver.menuPath(contextualMenuId),
    url: menuUrlResolver.menuUrl(contextualMenuId),
  })
}

function addTarget(targets: QrTarget[], target: QrTarget) {
  if (!target.path || !target.url) return
  if (targets.some((existing) => existing.id === target.id)) return

  targets.push(target)
}

function downloadSlug(value: unknown) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'menu'
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

function buildQrArtwork(qrUrl: string, logoUrl: string, label: string) {
  const fallbackLabel = qrFallbackLabel(label)
  const logo = logoUrl
    ? `<image href="${escapeSvg(logoUrl)}" x="390" y="378" width="244" height="132" preserveAspectRatio="xMidYMid meet" clip-path="url(#kitchen-logo-clip)" />`
    : `<text x="512" y="456" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="900" fill="#ffffff" letter-spacing="4">${escapeSvg(fallbackLabel)}</text>`
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 1024 1024">
  <defs>
    <clipPath id="kitchen-logo-clip">
      <rect x="390" y="378" width="244" height="132" rx="30" />
    </clipPath>
  </defs>
  <rect width="1024" height="1024" fill="#ffffff" />
  <image href="${escapeSvg(qrUrl)}" width="1024" height="1024" />
  <g>
    <rect x="348" y="334" width="328" height="356" rx="84" fill="#ffffff" />
    <rect x="376" y="360" width="272" height="188" rx="52" fill="#111827" />
    ${logo}
    <rect x="378" y="574" width="268" height="72" rx="36" fill="#111827" />
    <text x="498" y="619" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="900" fill="#ffffff" letter-spacing="1.8">
      FOOD MENU
    </text>
    <g transform="translate(596 592)" fill="none" stroke="#ffffff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">
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

function qrFallbackLabel(label: string) {
  const words = clean(label).split(/\s+/).filter(Boolean)
  const primaryWord = words.find((word) => word.length > 2) ?? words[0] ?? 'Menu'

  return primaryWord.slice(0, 5).toUpperCase()
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
</script>

<style scoped>
.qr-target {
  display: grid;
  gap: 0.45rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}

.qr-target:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 42%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-primary) 5%, var(--ui-bg));
  transform: translateY(-1px);
}

.qr-target--active {
  border-color: color-mix(in srgb, var(--ui-primary) 62%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-primary) 9%, var(--ui-bg));
}

.qr-menu-group {
  display: grid;
  gap: 0.65rem;
  padding: 0.75rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--ui-bg) 82%, var(--ui-bg-muted));
}

.qr-menu-group__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.qr-menu-group__header span {
  display: grid;
  gap: 0.16rem;
  min-width: 0;
}

.qr-menu-group__header strong {
  color: var(--ui-text-highlighted);
  font-size: 0.95rem;
  font-weight: 850;
}

.qr-menu-group__header small {
  color: var(--ui-text-muted);
  font-size: 0.8rem;
}

.qr-target__copy {
  display: grid;
  gap: 0.15rem;
}

.qr-target__copy strong {
  color: var(--ui-text-highlighted);
  font-size: 0.92rem;
  font-weight: 800;
}

.qr-target__copy small {
  color: var(--ui-text-muted);
  font-size: 0.8rem;
}

.qr-target code {
  width: fit-content;
  max-width: 100%;
  overflow-wrap: anywhere;
  border-radius: 0.45rem;
  background: var(--ui-bg-muted);
  color: var(--ui-text-highlighted);
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.25rem 0.45rem;
}
</style>
