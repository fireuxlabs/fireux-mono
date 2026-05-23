<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <header class="mx-auto mb-6 max-w-xl space-y-3">
        <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
          Upload a doc.<br />
          Get a QR code.
        </h1>
        <p class="text-base text-muted sm:text-lg">
          Turn a public doc into a shareable QR page.
        </p>
        <p class="text-sm text-muted">
          Made for information people need to scan and read.
        </p>
        <nav class="flex flex-wrap gap-3 text-sm">
          <NuxtLink to="/food-menu" class="text-primary hover:underline">
            Food menu
          </NuxtLink>
          <NuxtLink to="/pricing" class="text-primary hover:underline">
            Pricing
          </NuxtLink>
          <NuxtLink to="/help" class="text-primary hover:underline">
            Help
          </NuxtLink>
          <NuxtLink to="/terms" class="text-primary hover:underline">
            Terms
          </NuxtLink>
          <NuxtLink to="/privacy" class="text-primary hover:underline">
            Privacy
          </NuxtLink>
        </nav>
      </header>

      <ClientOnly>
        <QrdocUploadPanel class="mx-auto max-w-xl" />
      </ClientOnly>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

useSeoMeta({
  title: 'QRdocs - Upload a doc. Get a QR code.',
  ogTitle: 'QRdocs - Upload a doc. Get a QR code.',
  twitterTitle: 'QRdocs - Upload a doc. Get a QR code.',
  description: 'Turn a public doc into a shareable QR page. Create your first QRdoc free.',
  ogDescription: 'Turn a public doc into a shareable QR page. Create your first QRdoc free.',
  twitterDescription: 'Turn a public doc into a shareable QR page. Create your first QRdoc free.',
})
</script>
