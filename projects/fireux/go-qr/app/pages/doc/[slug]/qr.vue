<template>
  <main class="min-h-screen bg-white text-slate-950">
    <div
      class="mx-auto flex min-h-screen flex-col items-center justify-center gap-2 p-2 text-center"
    >
      <div class="space-y-0.5">
        <p
          class="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
        >
          Go QR
        </p>
        <h1 class="max-w-[92vw] truncate text-lg font-bold leading-tight">
          {{ documentLabel }}
        </h1>
      </div>

      <div
        v-if="qrDataUrl"
        class="relative max-w-[96vw]"
        style="
          width: min(96vw, calc(100vh - 4.75rem), 44rem);
          height: min(96vw, calc(100vh - 4.75rem), 44rem);
        "
      >
        <img
          :src="qrDataUrl"
          :alt="`QR code for ${documentLabel}`"
          class="size-full"
        />
        <div
          class="absolute left-1/2 top-1/2 grid size-[18%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[22%] border-[0.45rem] border-white bg-[#4f2df4] px-1 text-center text-[clamp(0.45rem,3.25vw,1.45rem)] font-black uppercase leading-none text-white shadow-sm"
          aria-hidden="true"
        >
          {{ qrCentreLabel }}
        </div>
      </div>
      <div
        v-else
        class="grid max-w-[96vw] place-items-center border border-slate-200 text-sm text-slate-500"
        style="
          width: min(96vw, calc(100vh - 4.75rem), 44rem);
          height: min(96vw, calc(100vh - 4.75rem), 44rem);
        "
      >
        Creating QR
      </div>

      <p class="max-w-[92vw] break-all text-[10px] text-slate-600">
        {{ publicUrl }}
      </p>

      <a
        href="https://go-qr.web.app"
        class="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900"
      >
        <span>Powered by</span>
        <img src="/img/app/logo.svg" alt="Go QR" class="size-4" />
        <span>Go QR</span>
      </a>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'

import { createError, useRuntimeConfig } from 'nuxt/app'
import { computed, onMounted, ref } from 'vue'
import { toDataURL } from 'qrcode'
import { readRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

type PublicGoQrRecord = {
  slug: string
  type: string
  file_name: string
  display_label?: string
  qr_centre_label?: string
}

const route = useRoute()
const runtime = useRuntimeConfig()
const slug = readRouteParam(route.params.slug)
const qrDataUrl = ref('')

definePageMeta({
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const { data: documentData } = await useLiveAsyncData(
  `go-qr-doc-qr-${slug}`,
  (liveFetch) =>
    liveFetch<PublicGoQrRecord>(`/api/docs/${encodeURIComponent(slug)}`)
)

if (!documentData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Go QR document not found',
  })
}

const documentRecord = computed(() => documentData.value as PublicGoQrRecord)
const documentLabel = computed(
  () => documentRecord.value.display_label || documentRecord.value.slug
)
const qrCentreLabel = computed(
  () => documentRecord.value.qr_centre_label || 'Q'
)
const fireuxConfig = computed(
  () => runtime.public?.fireux as { siteUrl?: string } | undefined
)
const publicBaseUrl = computed(() =>
  String(fireuxConfig.value?.siteUrl || 'https://go-qr.web.app').replace(
    /\/$/,
    ''
  )
)
const publicUrl = computed(
  () => `${publicBaseUrl.value}/doc/${documentRecord.value.slug}`
)

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
  title: computed(() => `${documentLabel.value} QR · Go QR`),
  description: computed(() => `Printable QR for ${documentLabel.value}`),
  robots: 'noindex, nofollow',
})
</script>
