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
          Menu
        </div>
      </div>

      <p class="max-w-[92vw] break-all text-[10px] text-slate-600">
        {{ publicUrl }}
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { createError } from '#imports'
import { toDataURL } from 'qrcode'

type PublicMenu = {
  id: string
  name: string
}

const route = useRoute()
const slug = String(route.params.slug || '').trim()
const qrDataUrl = ref('')

definePageMeta({
  layout: false,
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const { data } = await useAsyncData(
  `misebox-menu-qr-${slug}`,
  () => $fetch<PublicMenu>(`/api/menus/${encodeURIComponent(slug)}`)
)

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Menu not found.',
  })
}

const menu = computed(() => data.value as PublicMenu)
const publicUrl = computed(() => {
  const origin = import.meta.client ? window.location.origin : 'https://misebox.app'
  return `${origin}/menus/${encodeURIComponent(slug)}`
})

onMounted(async () => {
  qrDataUrl.value = await toDataURL(publicUrl.value, {
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
