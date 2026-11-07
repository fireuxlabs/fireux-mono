<template>
  <div class="bg-white text-slate-950">
    <div class="p-2">
      <div class="pagebody">
        <p>Go QR</p>
        <h1 class="fx-truncate">
          {{ documentLabel }}
        </h1>
      </div>

      <div
        v-if="qrDataUrl"
        class="relative"
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
        <UBadge
          class="absolute left-1/2 top-1/2 size-[18%] -translate-x-1/2 -translate-y-1/2 border-[0.45rem] border-white"
          aria-hidden="true"
        >
          {{ qrCentreLabel }}
        </UBadge>
      </div>
      <div
        v-else
        style="
          width: min(96vw, calc(100vh - 4.75rem), 44rem);
          height: min(96vw, calc(100vh - 4.75rem), 44rem);
        "
      >
        Creating QR
      </div>

      <p class="break-all">
        {{ publicUrl }}
      </p>

      <ULink to="https://go-qr.web.app">
        <span>Powered by</span>
        <UAvatar src="/img/app/logo.svg" alt="Go QR" size="xs" />
        <span>Go QR</span>
      </ULink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAsyncData, createError, useRuntimeConfig } from 'nuxt/app'

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

const { data: documentData } = await useAsyncData(
  `go-qr-doc-qr-${slug}`,
  async (_nuxtApp, { signal }) => {
    const fetchRead = $fetch.create({ signal, cache: 'no-store' })
    return fetchRead<PublicGoQrRecord>(`/api/docs/${encodeURIComponent(slug)}`)
  }
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
