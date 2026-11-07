<template>
  <UPage>
    <UPageHeader :title="documentLabel">
      <template #headline><ULink to="/">Go QR</ULink></template>
      <template #links>
        <UButton
          :to="documentRecord.file_url"
          target="_blank"
          icon="i-lucide-external-link"
          variant="ghost"
          color="neutral"
          aria-label="Open original"
        />
        <UButton
          :to="documentRecord.file_url"
          :download="documentRecord.file_name"
          icon="i-lucide-download"
          variant="ghost"
          color="neutral"
          aria-label="Download document"
        />
        <UButton
          :to="`/doc/${encodeURIComponent(documentRecord.slug)}/qr`"
          icon="i-lucide-qr-code"
          variant="ghost"
          color="neutral"
          aria-label="Printable QR"
        />
      </template>
    </UPageHeader>
    <UPageBody>
      <section class="bg-white" aria-label="Document">
        <img
          v-if="isImage"
          :src="documentRecord.file_url"
          :alt="documentLabel"
        />
        <iframe
          v-else
          :src="documentRecord.file_url"
          :title="documentLabel"
          class="h-[calc(100vh-3.5rem)] w-full"
        />
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useAsyncData, createError } from 'nuxt/app'

import { computed } from 'vue'
import { readRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

type PublicGoQrRecord = {
  slug: string
  file_url: string
  file_type: string
  file_name: string
  display_label?: string
}

const route = useRoute()
const slug = readRouteParam(route.params.slug)

definePageMeta({
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const { data: documentData } = await useAsyncData(
  `go-qr-doc-${slug}`,
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
const isImage = computed(() =>
  documentRecord.value.file_type.startsWith('image/')
)
const documentLabel = computed(
  () => documentRecord.value.display_label || documentRecord.value.slug
)

useSeoMeta({
  title: computed(() => `${documentLabel.value} · Go QR`),
  description: computed(() => `Go QR document ${documentLabel.value}`),
  robots: 'noindex, nofollow',
})
</script>
