<template>
  <main class="min-h-screen bg-[#f7f3eb] px-4 py-6 text-[#201711] sm:px-6 lg:px-8">
    <section class="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
      <div class="space-y-5 text-center lg:text-left">
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#5e3b21] hover:text-[#201711]"
        >
          <img src="/img/app/logo.png" alt="" class="size-7">
          <span>Misebox</span>
        </NuxtLink>

        <div class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6b51]">
            QR menu
          </p>
          <h1 class="text-balance text-4xl font-bold leading-tight sm:text-5xl">
            {{ label }}
          </h1>
          <p class="mx-auto max-w-xl text-base leading-7 text-[#6b5646] lg:mx-0">
            Scan to open the menu on your phone.
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-2 lg:justify-start print:hidden">
          <UButton
            :to="targetPath"
            icon="i-lucide-external-link"
            color="neutral"
            variant="solid"
          >
            Open menu
          </UButton>
          <UButton
            icon="i-lucide-printer"
            color="neutral"
            variant="soft"
            @click="printPage"
          >
            Print QR
          </UButton>
        </div>
      </div>

      <aside class="rounded-[1.75rem] bg-white p-4 shadow-xl shadow-[#7a5630]/15 ring-1 ring-black/5 print:shadow-none print:ring-0">
        <div class="rounded-[1.25rem] border border-[#eadfce] p-4">
          <div
            v-if="qrDataUrl"
            class="relative mx-auto aspect-square w-full max-w-[24rem]"
          >
            <img
              :src="qrDataUrl"
              :alt="`QR code for ${label}`"
              class="size-full"
            >
            <div
              class="absolute left-1/2 top-1/2 grid size-[18%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[24%] border-[0.35rem] border-white bg-[#1f7a5a] px-1 text-center text-[clamp(0.55rem,2.6vw,1.1rem)] font-black uppercase leading-none text-white shadow-sm"
              aria-hidden="true"
            >
              {{ centreLabel }}
            </div>
          </div>
          <div
            v-else
            class="mx-auto grid aspect-square w-full max-w-[24rem] place-items-center rounded-lg bg-[#f4eee4] text-sm text-[#8a6b51]"
          >
            Creating QR
          </div>

          <div class="mt-4 space-y-2 text-center">
            <p class="text-sm font-semibold text-[#201711]">
              {{ label }}
            </p>
            <p class="break-all text-xs leading-5 text-[#6b5646]">
              {{ targetUrl }}
            </p>
          </div>
        </div>

        <a
          href="https://go-qr.web.app"
          class="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a6b51] hover:text-[#201711] print:hidden"
        >
          <span>Powered by</span>
          <img
            src="https://go-qr.web.app/img/app/logo.svg"
            alt="Go QR"
            class="size-4"
          >
          <span>Go QR</span>
        </a>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { toDataURL } from 'qrcode'

type PublicMenuQrRecord = {
  slug: string
  display_label?: string
  qr_centre_label?: string
  public_url: string
}

const props = defineProps<{
  menu: PublicMenuQrRecord
  origin: string
}>()

const qrDataUrl = ref('')
const label = computed(() => props.menu.display_label || props.menu.slug)
const centreLabel = computed(() => props.menu.qr_centre_label || 'Menu')
const targetPath = computed(() => `/menus/${encodeURIComponent(props.menu.slug)}`)
const targetUrl = computed(() => {
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(props.origin)) {
    return `${props.origin}${targetPath.value}`
  }

  return props.menu.public_url
})

async function renderQr() {
  qrDataUrl.value = await toDataURL(targetUrl.value, {
    errorCorrectionLevel: 'H',
    width: 1024,
    margin: 2,
    color: {
      dark: '#1f3d32',
      light: '#ffffff',
    },
  })
}

function printPage() {
  if (import.meta.client) window.print()
}

onMounted(renderQr)
watch(targetUrl, renderQr)
</script>
