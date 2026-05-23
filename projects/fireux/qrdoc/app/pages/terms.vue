<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <article class="mx-auto max-w-2xl space-y-6">
        <header class="space-y-3">
          <NuxtLink to="/" class="text-sm font-semibold text-primary hover:underline">
            QRdocs
          </NuxtLink>
          <h1 class="text-4xl font-semibold tracking-normal text-highlighted">
            Terms
          </h1>
          <p class="text-lg text-muted">
            QRdocs hosts public docs and QR pages.
          </p>
        </header>

        <section class="space-y-4 text-muted">
          <p>
            QRdocs lets you upload a doc, publish it at a public link, and create a QR code for that link.
          </p>
          <p>
            You are responsible for the doc you upload. Only upload content you have the right to publish.
          </p>
          <p>
            QRdocs are public. Anyone with the link or QR code can view the doc. Do not upload private, sensitive, confidential, illegal, or harmful content.
          </p>
          <p>
            We may remove docs that are reported, unsafe, unlawful, abusive, or outside the purpose of the product.
          </p>
          <p>
            QRdocs is provided as a simple public doc hosting and QR tool. Availability may change while the product is in MVP.
          </p>
        </section>
      </article>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

useSeoMeta({
  title: 'Terms - QRdocs',
  ogTitle: 'Terms - QRdocs',
  twitterTitle: 'Terms - QRdocs',
  description: 'QRdocs terms for public doc hosting and QR pages.',
  ogDescription: 'QRdocs terms for public doc hosting and QR pages.',
  twitterDescription: 'QRdocs terms for public doc hosting and QR pages.',
})
</script>
