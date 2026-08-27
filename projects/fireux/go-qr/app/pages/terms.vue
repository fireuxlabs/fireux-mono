<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> Go QR </UButton>
        <UPageHeader
          title="Terms"
          description="Go QR hosts public docs and QR pages."
        />
        <UPageBody class="space-y-4">
          <section class="space-y-4 text-muted">
            <p>
              Go QR lets you upload a doc, publish it at a public link, and
              create a QR code for that link.
            </p>
            <p>
              You are responsible for the doc you upload. Only upload content
              you have the right to publish.
            </p>
            <p>
              QR docs are public. Anyone with the link or QR code can view the
              doc. Do not upload private, sensitive, confidential, illegal, or
              harmful content.
            </p>
            <p>
              We may remove docs that are reported, unsafe, unlawful, abusive,
              or outside the purpose of the product.
            </p>
            <p>
              Go QR is provided as a simple public doc hosting and QR tool.
              Availability may change while the product is in MVP.
            </p>
          </section>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'terms',
    label: 'Terms',
    icon: 'i-lucide-file-text',
    order: 40,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Terms - Go QR',
  ogTitle: 'Terms - Go QR',
  twitterTitle: 'Terms - Go QR',
  description: 'Go QR terms for public doc hosting and QR pages.',
  ogDescription: 'Go QR terms for public doc hosting and QR pages.',
  twitterDescription: 'Go QR terms for public doc hosting and QR pages.',
})
</script>
