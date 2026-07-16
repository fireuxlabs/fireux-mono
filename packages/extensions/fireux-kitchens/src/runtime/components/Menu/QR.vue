<template>
  <section
    class="menu-qr"
    data-menu-projection="qr"
    :data-menu-state="qrState"
    :data-menu-id="hasMenu ? menuId : undefined"
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

    <div v-else-if="failure" class="menu-qr__failure" role="alert">
      <p class="menu-qr__eyebrow">Menu</p>
      <h1 id="menu-qr-failure-title" class="menu-qr__failure-title">
        {{ failure.title }}
      </h1>
      <p class="menu-qr__failure-copy">
        {{ failure.description }}
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
import { useMenu } from '../../composables/fireux/menu/useMenu'
import type { MenuRouteScope } from '../../utils/kitchen-menu-route'

const props = defineProps<{
  menuId: string
  menuRouteScope: MenuRouteScope
}>()

const requestUrl = useRequestURL()
const qrDataUrl = ref('')
const qrError = ref(false)
let qrGeneration = 0

const menuId = computed(() => String(props.menuId || '').trim())
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
} = useMenu(menuId, { routeScope: menuRouteScope })
const menuIndexPath = computed(() => indexPath.value || '/menus')
const menuUrl = computed(() =>
  menuPath.value ? new URL(menuPath.value, requestUrl.origin).toString() : ''
)

await ready

if (import.meta.server && failure.value) {
  setResponseStatus(failure.value.statusCode)
}

const menuName = computed(() =>
  manifestMenu.value?.content.name || documentMenu.value?.name || 'Menu'
)
const kitchenName = computed(() =>
  manifestMenu.value?.presentation.kitchenName ||
  documentMenu.value?.kitchenName ||
  ''
)
const hasMenu = computed(() => renderKind.value !== 'unavailable')
const qrState = computed(() => {
  if (pending.value) return 'loading'
  if (failure.value) return 'unavailable'
  return qrError.value ? 'error' : 'ready'
})
const headingId = computed(() => {
  if (pending.value) return 'menu-qr-loading-title'
  return failure.value ? 'menu-qr-failure-title' : 'menu-qr-title'
})

onMounted(() => generateQr(menuUrl.value))
watch([menuUrl, failure, pending], ([url, menuFailure, isPending]) => {
  if (isPending || menuFailure) {
    qrGeneration += 1
    qrDataUrl.value = ''
    qrError.value = false
    return
  }

  generateQr(url)
})

async function generateQr(url: string) {
  const generation = ++qrGeneration
  qrDataUrl.value = ''
  qrError.value = false

  if (!url || failure.value) return

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
    failure.value ? failure.value.title : `${menuName.value} QR`
  ),
  description: computed(() =>
    failure.value?.description || `Printable QR for ${menuName.value}`
  ),
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
.menu-qr {
  box-sizing: border-box;
  display: grid;
  min-height: 100vh;
  min-height: 100svh;
  place-items: center;
  padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
  color: #0f172a;
  background: #fff;
}

.menu-qr__content,
.menu-qr__failure {
  display: grid;
  justify-items: center;
  width: min(100%, 48rem);
  text-align: center;
}

.menu-qr__content {
  gap: 0.75rem;
}

.menu-qr__failure {
  gap: 1rem;
}

.menu-qr__header {
  display: grid;
  gap: 0.25rem;
  max-width: 42rem;
}

.menu-qr__eyebrow {
  margin: 0;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.25;
  text-transform: uppercase;
}

.menu-qr__title,
.menu-qr__failure-title {
  margin: 0;
  font-weight: 800;
  line-height: 1.1;
  text-wrap: balance;
}

.menu-qr__title {
  font-size: clamp(1.25rem, 4vw, 2rem);
}

.menu-qr__failure-title {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}

.menu-qr__failure-copy {
  max-width: 32rem;
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.menu-qr__code {
  display: grid;
  width: min(88vw, 64svh, 40rem);
  overflow: hidden;
  aspect-ratio: 1;
  place-items: center;
  background: #fff;
}

.menu-qr__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.menu-qr__code-state {
  display: grid;
  width: 100%;
  height: 100%;
  margin: 0;
  border: 1px solid #cbd5e1;
  place-items: center;
  padding: 1rem;
  color: #475569;
  font-size: 0.875rem;
}

.menu-qr__destination {
  max-width: min(100%, 42rem);
  margin: 0;
  overflow-wrap: anywhere;
  color: #475569;
  font-size: 0.75rem;
  line-height: 1.4;
}

.menu-qr__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.menu-qr__action {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  padding: 0.625rem 1rem;
  color: #0f172a;
  background: #fff;
  font: inherit;
  font-weight: 700;
  line-height: 1.25;
  text-decoration: none;
  cursor: pointer;
}

.menu-qr__action:hover {
  border-color: #64748b;
  background: #f8fafc;
}

.menu-qr__action:disabled {
  border-color: #e2e8f0;
  color: #94a3b8;
  background: #f8fafc;
  cursor: not-allowed;
}

.menu-qr__action:focus-visible {
  outline: 3px solid #7c3aed;
  outline-offset: 3px;
}

@media (max-height: 36rem) {
  .menu-qr {
    padding: max(0.5rem, env(safe-area-inset-top)) max(0.5rem, env(safe-area-inset-right)) max(0.5rem, env(safe-area-inset-bottom)) max(0.5rem, env(safe-area-inset-left));
  }

  .menu-qr__content {
    gap: 0.375rem;
  }

  .menu-qr__code {
    width: min(88vw, 48svh, 40rem);
  }
}

@page {
  margin: 12mm;
}

@media print {
  .menu-qr {
    min-height: auto;
    padding: 0;
    print-color-adjust: exact;
  }

  .menu-qr__content {
    gap: 4mm;
  }

  .menu-qr__code {
    width: min(70vw, 170mm);
  }

  .menu-qr__actions {
    display: none;
  }
}
</style>
