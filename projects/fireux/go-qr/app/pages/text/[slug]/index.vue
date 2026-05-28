<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="grid min-h-screen place-items-center py-8">
      <UCard class="w-full max-w-xl" variant="subtle">
        <template #header>
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-primary">
              Go QR
            </p>
            <h1 class="text-2xl font-semibold text-highlighted">
              {{ qrLabel }}
            </h1>
          </div>
        </template>

        <p class="whitespace-pre-wrap text-base leading-7 text-highlighted">
          {{ qrRecord.text }}
        </p>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton
              :to="`/text/${encodeURIComponent(qrRecord.slug)}/qr`"
              icon="i-lucide-qr-code"
              variant="soft"
            >
              Open QR
            </UButton>
            <UButton
              to="/"
              color="neutral"
              variant="ghost"
            >
              Go QR
            </UButton>
          </div>
        </template>
      </UCard>
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
