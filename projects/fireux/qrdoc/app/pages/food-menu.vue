<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <header class="mx-auto mb-6 max-w-xl space-y-3">
        <NuxtLink to="/" class="text-sm text-primary hover:underline">
          QRdocs
        </NuxtLink>
        <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
          Need a QR code<br />
          for a food menu?
        </h1>
        <p class="text-base text-muted sm:text-lg">
          Upload a food menu doc and get a QR page.
        </p>
        <p class="text-sm text-muted">
          Same QRdocs flow. This page just flags the doc as a food menu.
        </p>
      </header>

      <ClientOnly>
        <QrdocUploadPanel
          type="food-menu"
          upload-label="Drop your menu doc here"
          cta-label="Upload menu doc with QRdocs"
          safety-copy="QRdocs can host a public menu file. Anyone with the link or QR code can view it."
          class="mx-auto max-w-xl"
        />
      </ClientOnly>

      <div class="mx-auto my-8 flex max-w-xl items-center gap-4 text-xs uppercase tracking-wide text-muted">
        <div class="h-px flex-1 bg-muted" />
        <span>or</span>
        <div class="h-px flex-1 bg-muted" />
      </div>

      <section class="mx-auto max-w-xl rounded-lg border border-default bg-muted/20 p-5">
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-highlighted">
            Need an editable menu instead?
          </h2>
          <p class="text-sm text-muted">
            QRdocs is perfect for hosting a menu file. Misebox is for turning a menu into structured dishes, sections, prices, allergens, translations, and ordering.
          </p>
          <UButton
            to="https://misebox.app"
            target="_blank"
            icon="i-lucide-external-link"
            color="neutral"
            variant="soft"
          >
            Explore Misebox Menus
          </UButton>
        </div>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

useSeoMeta({
  title: 'Food menu QR code - QRdocs',
  ogTitle: 'Food menu QR code - QRdocs',
  twitterTitle: 'Food menu QR code - QRdocs',
  description: 'Upload a food menu doc and get a QR page, or use Misebox to turn a menu into dishes, sections, prices, allergens, translations, and ordering.',
  ogDescription: 'Upload a food menu doc and get a QR page, or use Misebox to turn a menu into dishes, sections, prices, allergens, translations, and ordering.',
  twitterDescription: 'Upload a food menu doc and get a QR page, or use Misebox to turn a menu into dishes, sections, prices, allergens, translations, and ordering.',
})
</script>
