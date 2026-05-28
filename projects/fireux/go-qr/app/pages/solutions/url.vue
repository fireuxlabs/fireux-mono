<template>
  <PublicSimplePage
    title="URL"
    description="Turn a URL into a scannable QR code."
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-8">
      <section class="space-y-4">
        <UBadge color="primary" variant="soft">
          Typed helper
        </UBadge>
        <p class="max-w-xl text-base leading-7 text-muted">
          Use URL when the destination already exists somewhere else. Go QR normalizes the address,
          generates the QR, and stays out of the business workflow behind that link.
        </p>

        <ClientOnly>
          <GoQrInstantPanel
            type="url"
            title="URL"
            input-label="URL"
            placeholder="https://example.com"
          />
        </ClientOnly>
      </section>

      <section class="grid gap-3 md:grid-cols-3">
        <div
          v-for="item in guide"
          :key="item.title"
          class="rounded-md border border-default bg-default p-4"
        >
          <UIcon :name="item.icon" class="mb-3 size-5 text-primary" />
          <h2 class="text-sm font-semibold text-highlighted">
            {{ item.title }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-muted">
            {{ item.body }}
          </p>
        </div>
      </section>

      <section class="rounded-md border border-default bg-muted/20 p-4">
        <h2 class="text-sm font-semibold text-highlighted">
          When URL is enough
        </h2>
        <p class="mt-2 text-sm leading-6 text-muted">
          Use this for booking links, review pages, feedback forms, map links, public pages, and any
          destination owned by another app or service. If Go QR should host the file itself, use public-doc.
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <UButton to="/solutions/qr" color="neutral" variant="soft" size="sm">
            Text
          </UButton>
          <UButton to="/solutions/public-doc" color="neutral" variant="soft" size="sm">
            Public doc
          </UButton>
        </div>
      </section>
    </div>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
})

const guide = [
  {
    title: 'Paste a destination',
    icon: 'i-lucide-link',
    body: 'Use an existing website, form, booking page, menu page, or public app route.',
  },
  {
    title: 'Normalize',
    icon: 'i-lucide-check-circle-2',
    body: 'Go QR adds a missing scheme and only accepts normal web links.',
  },
  {
    title: 'No hosting',
    icon: 'i-lucide-route',
    body: 'The QR points to the external destination. Go QR does not copy or own that content.',
  },
]

useSeoMeta({
  title: 'URL - Go QR',
  ogTitle: 'URL - Go QR',
  twitterTitle: 'URL - Go QR',
  description: 'Create a QR code for a URL with Go QR.',
  ogDescription: 'Create a QR code for a URL with Go QR.',
  twitterDescription: 'Create a QR code for a URL with Go QR.',
})
</script>
