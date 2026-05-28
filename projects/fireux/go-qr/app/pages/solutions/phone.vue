<template>
  <PublicSimplePage
    title="Phone"
    description="Create a QR code that starts a phone call."
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-8">
      <section class="space-y-4">
        <UBadge color="primary" variant="soft">
          Typed helper
        </UBadge>
        <p class="max-w-xl text-base leading-7 text-muted">
          Phone creates a QR code for a call action. It is useful for signs, counters, rooms,
          support cards, delivery notices, and places where typing a number is annoying.
        </p>

        <ClientOnly>
          <GoQrInstantPanel
            type="phone"
            title="Phone"
            input-label="Phone number"
            placeholder="+41790000000"
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
          Best for direct contact
        </h2>
        <p class="mt-2 text-sm leading-6 text-muted">
          Use Phone when scanning should start a call. Use URL when the scan should open a booking
          form, WhatsApp link, help page, or another richer destination.
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <UButton to="/solutions/url" color="neutral" variant="soft" size="sm">
            URL
          </UButton>
          <UButton to="/solutions/qr" color="neutral" variant="soft" size="sm">
            Text
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
    title: 'Enter a number',
    icon: 'i-lucide-phone',
    body: 'Use an international phone number where possible, including the country code.',
  },
  {
    title: 'Call link',
    icon: 'i-lucide-phone-call',
    body: 'Go QR generates a tel: link so most phones offer a call action after scanning.',
  },
  {
    title: 'Print ready',
    icon: 'i-lucide-printer',
    body: 'Download the QR for reception desks, room cards, delivery notes, or support signs.',
  },
]

useSeoMeta({
  title: 'Phone - Go QR',
  ogTitle: 'Phone - Go QR',
  twitterTitle: 'Phone - Go QR',
  description: 'Create a QR code that starts a phone call with Go QR.',
  ogDescription: 'Create a QR code that starts a phone call with Go QR.',
  twitterDescription: 'Create a QR code that starts a phone call with Go QR.',
})
</script>
