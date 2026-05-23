<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <article class="mx-auto max-w-2xl space-y-6">
        <header class="space-y-3">
          <NuxtLink to="/" class="text-sm font-semibold text-primary hover:underline">
            QRdocs
          </NuxtLink>
          <h1 class="text-4xl font-semibold tracking-normal text-highlighted">
            Pricing
          </h1>
          <p class="text-lg text-muted">
            Create your first QRdoc free.
          </p>
        </header>

        <section class="rounded-md border border-default bg-default p-5">
          <p class="text-sm font-semibold uppercase tracking-wide text-muted">
            Current MVP
          </p>
          <h2 class="mt-2 text-2xl font-semibold text-highlighted">
            One public doc, one QR code
          </h2>
          <p class="mt-3 text-muted">
            Upload one doc, choose a public path, and get a shareable QR page.
          </p>
          <p class="mt-3 text-sm text-muted">
            More docs, private access, custom domains, and owner tools can come later. Today the product is intentionally simple.
          </p>
        </section>

        <UButton to="/" icon="i-lucide-qr-code" size="lg">
          Create your first QRdoc free
        </UButton>
      </article>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

useSeoMeta({
  title: 'Pricing - QRdocs',
  ogTitle: 'Pricing - QRdocs',
  twitterTitle: 'Pricing - QRdocs',
  description: 'Create your first QRdoc free. Upload one public doc and get a QR code.',
  ogDescription: 'Create your first QRdoc free. Upload one public doc and get a QR code.',
  twitterDescription: 'Create your first QRdoc free. Upload one public doc and get a QR code.',
})
</script>
