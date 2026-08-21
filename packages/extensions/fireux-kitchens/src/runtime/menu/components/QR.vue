<template>
  <section
    class="menu-qr"
    data-menu-projection="qr"
    :data-menu-state="qrState"
    :data-menu-id="hasMenu ? menuId : undefined"
    :data-menu-context="hasMenu ? menuContext : undefined"
    :data-menu-render-kind="hasMenu ? renderKind : undefined"
    :data-menu-target-path="hasMenu ? menuPath : undefined"
    :data-menu-scope="menuRouteScope.kind"
    :data-kitchen-slug="kitchenSlug || undefined"
    :aria-labelledby="headingId"
  >
    <div class="menu-qr__glow menu-qr__glow--one" aria-hidden="true" />
    <div class="menu-qr__glow menu-qr__glow--two" aria-hidden="true" />

    <div v-if="pending" class="menu-qr__failure" role="status">
      <p class="menu-qr__eyebrow">Menu</p>
      <h1 id="menu-qr-loading-title" class="menu-qr__failure-title">
        Loading menu
      </h1>
    </div>

    <div v-else-if="qrFailure" class="menu-qr__failure" role="alert">
      <p class="menu-qr__eyebrow">Menu</p>
      <h1 id="menu-qr-failure-title" class="menu-qr__failure-title">
        {{ qrFailure.title }}
      </h1>
      <p class="menu-qr__failure-copy">
        {{ qrFailure.description }}
      </p>
      <NuxtLink
        class="menu-qr__action"
        :to="menuIndexPath"
        data-menu-action="index"
      >
        Back to menus
      </NuxtLink>
    </div>

    <div v-else class="menu-qr__content">
      <header class="menu-qr__header">
        <div v-if="kitchenLogoImageUrl" class="menu-qr__brand">
          <img
            :src="kitchenLogoImageUrl"
            :alt="kitchenName ? `${kitchenName} logo` : 'Kitchen logo'"
          />
        </div>
        <p class="menu-qr__eyebrow">{{ kitchenName || 'Menu' }}</p>
        <h1 id="menu-qr-title" class="menu-qr__title">
          {{ menuName }}
        </h1>
        <p class="menu-qr__instruction">Scan to explore the menu</p>
      </header>

      <div class="menu-qr__frame">
        <div class="menu-qr__code" :aria-busy="!qrReady && !qrError">
          <div
            v-show="qrReady"
            ref="qrContainer"
            class="menu-qr__canvas"
            :aria-label="`QR code linking to ${menuName}`"
            data-menu-qr-image
            role="img"
          />
          <div
            v-if="qrReady && kitchenLogoImageUrl"
            class="menu-qr__code-brand"
            aria-hidden="true"
          >
            <img :src="kitchenLogoImageUrl" alt="" />
          </div>

          <p v-if="qrError" class="menu-qr__code-state" role="alert">
            QR code unavailable. Use the menu link below.
          </p>

          <p v-else-if="!qrReady" class="menu-qr__code-state" role="status">
            Creating QR code...
          </p>
        </div>

        <div class="menu-qr__scan-label" aria-hidden="true">
          <span class="menu-qr__scan-icon" />
          Point your camera here
        </div>
      </div>

      <a class="menu-qr__destination" :href="menuUrl">
        {{ menuUrl }}
      </a>

      <div class="menu-qr__actions">
        <NuxtLink
          class="menu-qr__action"
          :to="menuIndexPath"
          data-menu-action="index"
        >
          Back to menus
        </NuxtLink>
        <NuxtLink
          class="menu-qr__action"
          :to="menuPath"
          data-menu-action="menu"
        >
          Open menu
        </NuxtLink>
        <button
          class="menu-qr__action"
          type="button"
          :disabled="!qrReady"
          data-menu-action="print"
          @click="printQr"
        >
          Print QR
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { setResponseStatus, useRequestURL, useSeoMeta } from '#imports'
import type QRCodeStyling from 'qr-code-styling'
import type { Options as QRCodeStylingOptions } from 'qr-code-styling'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMenu, type MenuLoadFailure } from '../composables/useMenu'
import type { MenuRouteContext } from '../models/menu-context.model.ts'
import type { MenuRouteScope } from '../../kitchen/utils/kitchen-menu-route'
import { menuManifestSupportsContext } from '../utils/menu-context'

type QrWatchState = readonly [string, MenuLoadFailure | null, boolean]

const props = withDefaults(
  defineProps<{
    menuId: string
    menuContext?: MenuRouteContext
    menuRouteScope: MenuRouteScope
  }>(),
  {
    menuContext: 'generic',
  }
)

const requestUrl = useRequestURL()
const qrContainer = ref<HTMLElement | null>(null)
const qrReady = ref(false)
const qrError = ref(false)
let qrGeneration = 0
let currentQr: Pick<QRCodeStyling, 'append' | 'update'> | null = null

const menuId = computed(() => String(props.menuId || '').trim())
const menuContext = computed(() => props.menuContext)
const menuRouteScope = computed(() => props.menuRouteScope)
const {
  kitchenSlug,
  indexPath,
  menuPath,
  renderKind,
  document: documentMenu,
  manifest: manifestMenu,
  failure,
  pending,
  ready,
} = useMenu(menuId, {
  routeScope: menuRouteScope,
  menuContext,
})
const menuIndexPath = computed(() => indexPath.value || '/menus')
const menuUrl = computed(() =>
  menuPath.value ? new URL(menuPath.value, requestUrl.origin).toString() : ''
)

await ready

const menuName = computed(
  () => manifestMenu.value?.content.name || documentMenu.value?.name || 'Menu'
)
const kitchenName = computed(
  () =>
    manifestMenu.value?.presentation.kitchenName ||
    documentMenu.value?.kitchenName ||
    ''
)
const kitchenLogoImageUrl = computed(() =>
  String(
    manifestMenu.value?.presentation.kitchenLogoImageUrl ||
      (documentMenu.value as Record<string, unknown> | null)
        ?.kitchenLogoImageUrl ||
      (documentMenu.value as Record<string, unknown> | null)?.logo_image_url ||
      ''
  ).trim()
)
const contextAvailable = computed(() => {
  if (renderKind.value === 'document') return menuContext.value === 'generic'
  if (renderKind.value !== 'structured') return false

  return menuManifestSupportsContext(
    manifestMenu.value?.behaviour,
    menuContext.value
  )
})
const qrFailure = computed<MenuLoadFailure | null>(() => {
  if (failure.value || pending.value) return failure.value
  if (contextAvailable.value) return null

  return {
    statusCode: 404,
    title: 'Menu not found',
    description: 'This menu is not available for the requested entry context.',
  }
})
const hasMenu = computed(
  () => renderKind.value !== 'unavailable' && !qrFailure.value
)

if (import.meta.server && qrFailure.value) {
  setResponseStatus(qrFailure.value.statusCode)
}

const qrState = computed(() => {
  if (pending.value) return 'loading'
  if (qrFailure.value) return 'unavailable'
  return qrError.value ? 'error' : 'ready'
})
const headingId = computed(() => {
  if (pending.value) return 'menu-qr-loading-title'
  return qrFailure.value ? 'menu-qr-failure-title' : 'menu-qr-title'
})

onMounted(() => generateQr(menuUrl.value))
onBeforeUnmount(() => {
  currentQr = null
})
watch(
  () => [menuUrl.value, qrFailure.value, pending.value] as const,
  ([url, menuFailure, isPending]: QrWatchState) => {
    if (isPending || menuFailure) {
      qrGeneration += 1
      qrReady.value = false
      qrError.value = false
      return
    }

    generateQr(url)
  }
)

async function generateQr(url: string) {
  const generation = ++qrGeneration
  qrReady.value = false
  qrError.value = false

  if (!url || qrFailure.value) return

  try {
    await nextTick()
    if (!qrContainer.value || generation !== qrGeneration) return

    const options = qrOptions(url)
    if (currentQr) {
      currentQr.update(options)
    } else {
      const QRCodeStyling = (await import('qr-code-styling')).default
      if (generation !== qrGeneration || !qrContainer.value) return
      currentQr = new QRCodeStyling(options)
      qrContainer.value.replaceChildren()
      currentQr.append(qrContainer.value)
    }

    if (generation === qrGeneration) qrReady.value = true
  } catch {
    if (generation === qrGeneration) qrError.value = true
  }
}

function qrOptions(data: string): Partial<QRCodeStylingOptions> {
  return {
    width: 1024,
    height: 1024,
    type: 'svg',
    data,
    margin: 28,
    qrOptions: {
      errorCorrectionLevel: 'H',
    },
    dotsOptions: {
      color: '#111827',
      type: 'rounded',
      roundSize: true,
    },
    cornersSquareOptions: {
      color: '#111827',
      type: 'extra-rounded',
    },
    cornersDotOptions: {
      color: '#111827',
      type: 'dot',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
  }
}

function printQr() {
  if (import.meta.client) window.print()
}

useSeoMeta({
  title: computed(() =>
    qrFailure.value ? qrFailure.value.title : `${menuName.value} QR`
  ),
  description: computed(
    () => qrFailure.value?.description || `Printable QR for ${menuName.value}`
  ),
  robots: 'noindex, nofollow',
})
</script>

<style scoped src="./styles/menu-qr.css"></style>
