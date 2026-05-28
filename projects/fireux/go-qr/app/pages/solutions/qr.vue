<template>
  <PublicSimplePage
    title="Text"
    description="Send any message as a QR code."
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-8">
      <section class="space-y-4">
        <UBadge
          label="Free text QR"
          color="primary"
          variant="soft"
        />
        <p class="max-w-xl text-base leading-7 text-muted">
          Write a short message, note, or bit of text and turn it into a downloadable QR code.
          Nothing is uploaded or saved.
        </p>

        <ClientOnly>
          <GoQrInstantPanel
            class="max-w-xl"
            type="qr"
            title="Create a text QR"
            description="Enter the message people should see after they scan."
            input-label="Message"
            placeholder="See you at table 4"
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
          Need something more specific?
        </h2>
        <p class="mt-2 text-sm leading-6 text-muted">
          Use Text for quick messages. Use URL, Phone, Wi-Fi, and other tools when Go QR should
          format or validate the scan action for you. Use Public doc when Go QR should host a file.
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <UButton to="/solutions/url" color="neutral" variant="soft" size="sm">
            URL
          </UButton>
          <UButton to="/solutions/phone" color="neutral" variant="soft" size="sm">
            Phone
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
    title: 'Text in',
    icon: 'i-lucide-type',
    body: 'Encode a note, message, or short piece of text exactly as entered.',
  },
  {
    title: 'QR out',
    icon: 'i-lucide-qr-code',
    body: 'Generate the QR image immediately in the browser and download it as a PNG.',
  },
  {
    title: 'No storage',
    icon: 'i-lucide-hard-drive',
    body: 'Nothing is hosted or saved by this primitive, so it can stay free and generous.',
  },
]

useSeoMeta({
  title: 'Text - Go QR',
  ogTitle: 'Text - Go QR',
  twitterTitle: 'Text - Go QR',
  description: 'Send any message as a QR code with Go QR.',
  ogDescription: 'Send any message as a QR code with Go QR.',
  twitterDescription: 'Send any message as a QR code with Go QR.',
})
</script>
