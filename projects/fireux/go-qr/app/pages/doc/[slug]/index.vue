<template>
  <main class="grid min-h-screen grid-rows-[auto_1fr] bg-white text-default">
    <header class="flex min-h-14 items-center justify-between gap-3 border-b border-default bg-default px-3 sm:px-4">
      <div class="min-w-0">
        <NuxtLink to="/" class="text-xs font-semibold uppercase tracking-wide text-primary">
          Go QR
        </NuxtLink>
        <h1 class="truncate text-sm font-semibold text-highlighted sm:text-base">
          {{ documentLabel }}
        </h1>
      </div>

      <div class="flex shrink-0 items-center gap-1.5">
        <UButton
          :to="documentRecord.file_url"
          target="_blank"
          icon="i-lucide-external-link"
          variant="ghost"
          color="neutral"
          aria-label="Open original"
        />
        <a
          :href="documentRecord.file_url"
          :download="documentRecord.file_name"
          class="inline-grid size-8 place-items-center rounded-md text-muted hover:bg-elevated hover:text-highlighted"
          aria-label="Download document"
        >
          <UIcon name="i-lucide-download" class="size-4" />
        </a>
        <UButton
          :to="`/doc/${encodeURIComponent(documentRecord.slug)}/qr`"
          icon="i-lucide-qr-code"
          variant="ghost"
          color="neutral"
          aria-label="Printable QR"
        />
      </div>
    </header>

    <section class="min-h-0 overflow-auto bg-white" aria-label="Document">
      <img
        v-if="isImage"
        :src="documentRecord.file_url"
        :alt="documentLabel"
        class="mx-auto block max-w-full"
      >
      <iframe
        v-else
        :src="documentRecord.file_url"
        :title="documentLabel"
        class="h-[calc(100vh-3.5rem)] w-full border-0"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { createError } from 'nuxt/app'
import { computed } from 'vue'

type PublicGoQrRecord = {
  slug: string
  file_url: string
  file_type: string
  file_name: string
  display_label?: string
}

const route = useRoute()
const slug = String(route.params.slug || '').trim()

definePageMeta({
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const { data: documentData } = await useAsyncData(
  `go-qr-doc-${slug}`,
  () => $fetch<PublicGoQrRecord>(`/api/docs/${encodeURIComponent(slug)}`)
)

if (!documentData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Go QR document not found',
  })
}

const documentRecord = computed(() => documentData.value as PublicGoQrRecord)
const isImage = computed(() => documentRecord.value.file_type.startsWith('image/'))
const documentLabel = computed(() => documentRecord.value.display_label || documentRecord.value.slug)

useSeoMeta({
  title: computed(() => `${documentLabel.value} · Go QR`),
  description: computed(() => `Go QR document ${documentLabel.value}`),
  robots: 'noindex, nofollow',
})
</script>
