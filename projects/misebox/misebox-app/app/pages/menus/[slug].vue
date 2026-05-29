<template>
  <main class="grid min-h-screen grid-rows-[auto_auto_1fr] bg-white text-default">
    <header class="flex min-h-14 items-center justify-between gap-3 border-b border-default bg-default px-3 sm:px-4">
      <div class="min-w-0">
        <NuxtLink to="/" class="text-xs font-semibold uppercase tracking-wide text-primary">
          Misebox
        </NuxtLink>
        <h1 class="truncate text-sm font-semibold text-highlighted sm:text-base">
          {{ documentLabel }}
        </h1>
      </div>

      <div class="flex shrink-0 items-center gap-1.5">
        <UButton
          :to="documentRecord.doc_url"
          target="_blank"
          icon="i-lucide-external-link"
          variant="ghost"
          color="neutral"
          aria-label="Open original"
        />
        <a
          :href="documentRecord.doc_url"
          :download="documentRecord.doc_name"
          class="inline-grid size-8 place-items-center rounded-md text-muted hover:bg-elevated hover:text-highlighted"
          aria-label="Download menu"
        >
          <UIcon name="i-lucide-download" class="size-4" />
        </a>
        <UButton
          :to="`/menus/${encodeURIComponent(documentRecord.slug)}/qr`"
          icon="i-lucide-qr-code"
          variant="ghost"
          color="neutral"
          aria-label="Printable QR"
        />
      </div>
    </header>

    <section class="border-b border-amber-200 bg-amber-50 px-3 py-3 text-amber-950 sm:px-4">
      <div class="mx-auto flex max-w-4xl gap-3">
        <UIcon name="i-lucide-triangle-alert" class="mt-0.5 size-5 shrink-0 text-amber-700" />
        <p class="text-sm leading-6">
          If you have a food allergy or intolerance, please speak to a member of the team before ordering.
        </p>
      </div>
    </section>

    <section class="min-h-0 overflow-auto bg-white" aria-label="Menu">
      <ClientOnly v-if="isPdf">
        <MenuPdfViewer
          :url="viewerUrl"
          :title="documentLabel"
        />

        <template #fallback>
          <div class="grid h-[calc(100vh-3.5rem)] place-items-center text-sm text-muted">
            Loading menu...
          </div>
        </template>
      </ClientOnly>

      <iframe
        v-else
        :src="viewerUrl"
        :title="documentLabel"
        class="h-full min-h-[calc(100vh-8.5rem)] w-full border-0"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  createError,
  useAsyncData,
  useRoute,
  useSeoMeta,
} from '#imports'
import { computed } from 'vue'

type PublicMenuRecord = {
  slug: string
  doc_url: string
  doc_type: string
  doc_name: string
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
  `misebox-menu-qr-${slug}`,
  () => $fetch<PublicMenuRecord>(`/api/menus/${encodeURIComponent(slug)}`)
)

if (!documentData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Menu not found',
  })
}

const documentRecord = computed(() => documentData.value as PublicMenuRecord)
const documentLabel = computed(() => documentRecord.value.display_label || documentRecord.value.slug)
const isPdf = computed(() => documentRecord.value.doc_type === 'application/pdf')
const viewerUrl = computed(() => `/api/menus/${encodeURIComponent(documentRecord.value.slug)}/file`)

useSeoMeta({
  title: computed(() => `${documentLabel.value} · Misebox`),
  description: computed(() => `Misebox menu ${documentLabel.value}`),
  robots: 'noindex, nofollow',
})
</script>
