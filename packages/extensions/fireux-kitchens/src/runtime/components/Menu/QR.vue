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
        <p class="menu-qr__eyebrow">
          {{ kitchenName || 'Menu' }}
        </p>
        <h1 id="menu-qr-title" class="menu-qr__title">
          {{ menuName }}
        </h1>
      </header>

      <div
        class="menu-qr__code"
        :aria-busy="!qrDataUrl && !qrError"
      >
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          :alt="`QR code linking to ${menuName}`"
          class="menu-qr__image"
          data-menu-qr-image
        >

        <p v-else-if="qrError" class="menu-qr__code-state" role="alert">
          QR code unavailable. Use the menu link below.
        </p>

        <p v-else class="menu-qr__code-state" role="status">
          Creating QR code...
        </p>
      </div>

      <p class="menu-qr__destination">
        {{ menuUrl }}
      </p>

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
          :disabled="!qrDataUrl"
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
import { toDataURL } from 'qrcode'
import { computed, onMounted, ref, watch } from 'vue'
import { useMenu, type MenuLoadFailure } from '../../composables/fireux/menu/useMenu'
import type { MenuRouteContext } from '../../models/kitchen/menu/menu-context.model'
import type { MenuRouteScope } from '../../utils/kitchen-menu-route'
import { menuManifestSupportsContext } from '../../utils/menu-context'

type QrWatchState = readonly [string, MenuLoadFailure | null, boolean]

const props = withDefaults(defineProps<{
  menuId: string
  menuContext?: MenuRouteContext
  menuRouteScope: MenuRouteScope
}>(), {
  menuContext: 'generic',
})

const requestUrl = useRequestURL()
const qrDataUrl = ref('')
const qrError = ref(false)
let qrGeneration = 0

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

const menuName = computed(() =>
  manifestMenu.value?.content.name || documentMenu.value?.name || 'Menu'
)
const kitchenName = computed(() =>
  manifestMenu.value?.presentation.kitchenName ||
  documentMenu.value?.kitchenName ||
  ''
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
const hasMenu = computed(() =>
  renderKind.value !== 'unavailable' && !qrFailure.value
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
watch(
  () => [menuUrl.value, qrFailure.value, pending.value] as const,
  ([url, menuFailure, isPending]: QrWatchState) => {
    if (isPending || menuFailure) {
      qrGeneration += 1
      qrDataUrl.value = ''
      qrError.value = false
      return
    }

    generateQr(url)
  }
)

async function generateQr(url: string) {
  const generation = ++qrGeneration
  qrDataUrl.value = ''
  qrError.value = false

  if (!url || qrFailure.value) return

  try {
    const dataUrl = await toDataURL(url, {
      errorCorrectionLevel: 'H',
      width: 1024,
      margin: 4,
      color: {
        dark: '#24134f',
        light: '#ffffff',
      },
    })

    if (generation === qrGeneration) qrDataUrl.value = dataUrl
  } catch {
    if (generation === qrGeneration) qrError.value = true
  }
}

function printQr() {
  if (import.meta.client) window.print()
}

useSeoMeta({
  title: computed(() =>
    qrFailure.value ? qrFailure.value.title : `${menuName.value} QR`
  ),
  description: computed(() =>
    qrFailure.value?.description || `Printable QR for ${menuName.value}`
  ),
  robots: 'noindex, nofollow',
})
</script>

<style scoped src="../../assets/styles/menu-qr.css"></style>
