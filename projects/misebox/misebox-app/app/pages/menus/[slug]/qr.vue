<template>
  <MenuPublicQr :menu="documentRecord" :origin="requestUrl.origin" />
</template>

<script setup lang="ts">
import {
  createError,
  useAsyncData,
  useRequestURL,
  useRoute,
  useSeoMeta,
} from '#imports'
import { computed } from 'vue'

type PublicMenuQrRecord = {
  slug: string
  display_label?: string
  qr_centre_label?: string
  public_url: string
}

const route = useRoute()
const requestUrl = useRequestURL()
const slug = String(route.params.slug || '').trim()

definePageMeta({
  layout: 'menu',
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const { data: documentData } = await useAsyncData(
  `misebox-menu-qr-code-${slug}`,
  () => $fetch<PublicMenuQrRecord>(`/api/menus/${encodeURIComponent(slug)}`)
)

if (!documentData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Menu not found',
  })
}

const documentRecord = computed(() => documentData.value as PublicMenuQrRecord)
const documentLabel = computed(() =>
  documentRecord.value.display_label || documentRecord.value.slug
)

useSeoMeta({
  title: computed(() => `${documentLabel.value} QR · Misebox`),
  description: computed(() => `Printable QR for ${documentLabel.value}`),
  robots: 'noindex, nofollow',
})
</script>
