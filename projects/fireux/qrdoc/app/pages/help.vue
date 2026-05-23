<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <article class="mx-auto max-w-2xl space-y-6">
        <header class="space-y-3">
          <NuxtLink to="/" class="text-sm font-semibold text-primary hover:underline">
            QRdocs
          </NuxtLink>
          <h1 class="text-4xl font-semibold tracking-normal text-highlighted">
            Help
          </h1>
          <p class="text-lg text-muted">
            Upload a public doc and get a QR code.
          </p>
        </header>

        <section class="space-y-4">
          <div>
            <h2 class="text-xl font-semibold text-highlighted">
              How it works
            </h2>
            <p class="mt-2 text-muted">
              Upload a doc, choose a short public path, then QRdocs creates a public doc page and a printable QR page.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-highlighted">
              Public by design
            </h2>
            <p class="mt-2 text-muted">
              QRdocs are for public information. Anyone with the link or QR code can view your doc.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-semibold text-highlighted">
              What to upload
            </h2>
            <p class="mt-2 text-muted">
              Use QRdocs for information people need to scan and read. Do not upload private, sensitive, or confidential information.
            </p>
          </div>
        </section>

        <UButton to="/" icon="i-lucide-upload" size="lg">
          Create your first QRdoc free
        </UButton>
      </article>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

useSeoMeta({
  title: 'Help - QRdocs',
  ogTitle: 'Help - QRdocs',
  twitterTitle: 'Help - QRdocs',
  description: 'How QRdocs works: upload a public doc, get a public page and QR code.',
  ogDescription: 'How QRdocs works: upload a public doc, get a public page and QR code.',
  twitterDescription: 'How QRdocs works: upload a public doc, get a public page and QR code.',
})
</script>
