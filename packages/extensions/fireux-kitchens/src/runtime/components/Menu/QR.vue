<template>
  <main class="min-h-screen bg-white text-slate-950">
    <div class="mx-auto flex min-h-screen flex-col items-center justify-center gap-2 p-2 text-center">
      <div class="space-y-0.5">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Misebox
        </p>
        <h1 class="max-w-[92vw] truncate text-lg font-bold leading-tight">
          {{ menu.name }}
        </h1>
      </div>

      <div
        v-if="qrDataUrl"
        class="relative max-w-[96vw]"
        style="width: min(96vw, calc(100vh - 4.75rem), 44rem); height: min(96vw, calc(100vh - 4.75rem), 44rem);"
      >
        <img
          :src="qrDataUrl"
          :alt="`QR code for ${menu.name}`"
          class="size-full"
        >
        <div
          class="absolute left-1/2 top-1/2 grid size-[18%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[22%] border-[0.45rem] border-white bg-[#4f2df4] px-1 text-center text-[clamp(0.45rem,3.25vw,1.45rem)] font-black uppercase leading-none text-white shadow-sm"
          aria-hidden="true"
        >
          {{ qrCentreLabel }}
        </div>
      </div>

      <p class="max-w-[92vw] break-all text-[10px] text-slate-600">
        {{ menuUrl }}
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { createError } from '#imports'
import { toDataURL } from 'qrcode'
import { computed, onMounted, ref } from 'vue'
import type { MenuDetailPayload } from '../../models/kitchen/menu/menu-detail.model'
import {
  menuRoutePath,
  type MenuRouteScope,
} from '../../utils/kitchen-menu-route'

type WaitingMenu = {
  id: string
  name: string
}

const props = defineProps<{
  menuId: string
  menuRouteScope: MenuRouteScope
}>()
const qrDataUrl = ref('')
const kitchenSlug = computed(() =>
  props.menuRouteScope.kind === 'directory'
    ? props.menuRouteScope.kitchenSlug
    : ''
)
const query = computed(() =>
  kitchenSlug.value ? { kitchenSlug: kitchenSlug.value } : undefined
)
const { data } = await useAsyncData(
  () => `menu-qr-${kitchenSlug.value || 'root'}-${props.menuId}`,
  () => $fetch<MenuDetailPayload>(`/api/menus/${encodeURIComponent(props.menuId)}`, {
    query: query.value,
  })
)

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Menu not found.',
  })
}

const menu = computed<WaitingMenu>(() => {
  const payload = data.value
  if (!payload) return { id: props.menuId, name: props.menuId }

  return payload.kind === 'manifest'
    ? {
        id: payload.manifest.content.id,
        name: payload.manifest.content.name,
      }
    : {
        id: payload.document.id,
        name: payload.document.name,
      }
})
const titleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')

const qrCentreLabel = computed(() => titleCase(menu.value.name || props.menuId))
const menuUrl = computed(() => {
  const origin = import.meta.client ? window.location.origin : ''
  const path = menuRoutePath({
    scope: props.menuRouteScope,
    menuId: props.menuId,
  })

  return `${origin}${path}`
})

onMounted(async () => {
  qrDataUrl.value = await toDataURL(menuUrl.value, {
    errorCorrectionLevel: 'H',
    width: 1024,
    margin: 2,
    color: {
      dark: '#24134f',
      light: '#ffffff',
    },
  })
})

useSeoMeta({
  title: computed(() => `${menu.value.name} QR`),
  description: computed(() => `Printable QR for ${menu.value.name}`),
  robots: 'noindex, nofollow',
})
</script>
