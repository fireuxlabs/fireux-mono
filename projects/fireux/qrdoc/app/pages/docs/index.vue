<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-6 sm:py-8">
      <div class="mx-auto max-w-3xl space-y-5">
        <header class="flex items-center justify-between gap-3 border-b border-default pb-4">
          <div>
            <NuxtLink to="/" class="text-xs font-semibold uppercase tracking-wide text-primary">
              QRdocs
            </NuxtLink>
            <h1 class="text-2xl font-semibold text-highlighted">
              Documents
            </h1>
          </div>

          <UButton
            to="/"
            icon="i-lucide-upload"
            size="sm"
          >
            New
          </UButton>
        </header>

        <div
          v-if="!documents.length"
          class="rounded-md border border-dashed border-default p-8 text-center text-sm text-muted"
        >
          No public documents yet.
        </div>

        <div v-else class="divide-y divide-default rounded-md border border-default bg-default">
          <article
            v-for="document in documents"
            :key="document.id"
            class="flex items-center justify-between gap-4 p-4"
          >
            <NuxtLink
              :to="`/docs/${encodeURIComponent(document.slug)}`"
              class="min-w-0"
            >
              <h2 class="truncate font-medium text-highlighted">
                {{ document.slug }}
              </h2>
            </NuxtLink>

            <div class="flex shrink-0 items-center gap-1">
              <UButton
                :to="`/docs/${encodeURIComponent(document.slug)}`"
                icon="i-lucide-file-text"
                variant="ghost"
                color="neutral"
                aria-label="Open document"
              />
              <UButton
                :to="`/docs/${encodeURIComponent(document.slug)}/qr`"
                icon="i-lucide-qr-code"
                variant="ghost"
                color="neutral"
                aria-label="Open QR"
              />
            </div>
          </article>
        </div>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import {
  createError,
  useAsyncData,
  useSeoMeta,
} from '#imports'
import { computed } from 'vue'

type PublicQrdocDocument = {
  id: string
  slug: string
  file_type: string
  file_name: string
}

const { data } = await useAsyncData(
  'qrdocs-documents-index',
  () => $fetch<{ documents: PublicQrdocDocument[] }>('/api/docs')
)

if (!data.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Could not load QRdocs documents',
  })
}

const documents = computed(() => data.value?.documents || [])

useSeoMeta({
  title: 'Documents · QRdocs',
  description: 'Public QRdocs document index.',
})
</script>
