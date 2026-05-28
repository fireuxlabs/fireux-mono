<template>
  <main class="min-h-screen bg-slate-50 text-slate-950">
    <UContainer class="flex min-h-screen items-center justify-center px-4 py-10">
      <article class="w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <header class="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <NuxtLink to="/" class="flex min-w-0 items-center gap-2">
            <img
              src="/img/app/logo.svg"
              alt="Go QR"
              class="size-7 shrink-0 rounded-md"
            >
            <span class="truncate text-sm font-semibold text-slate-700">
              Go QR
            </span>
          </NuxtLink>

          <UBadge
            :label="`/text/${qrRecord.slug}`"
            color="neutral"
            variant="soft"
            class="max-w-48 truncate"
          />
        </header>

        <section class="space-y-5 px-5 py-7 sm:px-7 sm:py-8">
          <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Scanned note
          </p>

          <h1 class="break-words text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
            {{ qrLabel }}
          </h1>

          <p class="whitespace-pre-wrap break-words text-lg leading-8 text-slate-800">
            {{ qrRecord.text }}
          </p>
        </section>

        <footer class="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <p class="truncate text-xs text-slate-500">
            Shared with Go QR
          </p>
          <div class="flex shrink-0 items-center gap-1.5">
            <UButton
              :to="`/text/${encodeURIComponent(qrRecord.slug)}/qr`"
              icon="i-lucide-qr-code"
              variant="ghost"
              color="neutral"
              aria-label="Open QR"
            />
            <UButton
              to="/solutions/text"
              icon="i-lucide-plus"
              variant="soft"
              color="primary"
              aria-label="Create a text QR"
            />
          </div>
        </footer>
      </article>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { createError } from 'nuxt/app'
import { computed } from 'vue'

type PublicGoQrTextRecord = {
  slug: string
  text: string
  display_label?: string
}

const route = useRoute()
const slug = String(route.params.slug || '').trim()

definePageMeta({
  layout: false,
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const { data: qrData } = await useAsyncData(
  `go-qr-text-${slug}`,
  () => $fetch<PublicGoQrTextRecord>(`/api/text/${encodeURIComponent(slug)}`)
)

if (!qrData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Go QR text record not found',
  })
}

const qrRecord = computed(() => qrData.value as PublicGoQrTextRecord)
const qrLabel = computed(() => qrRecord.value.display_label || qrRecord.value.slug)

useSeoMeta({
  title: computed(() => `${qrLabel.value} · Go QR`),
  description: computed(() => `Go QR text ${qrLabel.value}`),
  robots: 'noindex, nofollow',
})
</script>
