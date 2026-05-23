<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <article class="mx-auto max-w-2xl space-y-6">
        <header class="space-y-3">
          <NuxtLink to="/" class="text-sm font-semibold text-primary hover:underline">
            QRdocs
          </NuxtLink>
          <h1 class="text-4xl font-semibold tracking-normal text-highlighted">
            Privacy
          </h1>
          <p class="text-lg text-muted">
            QRdocs is for public docs, not private storage.
          </p>
        </header>

        <section class="space-y-4 text-muted">
          <p>
            When you create a QRdoc, we store the uploaded file, the public path, and basic metadata needed to display the doc and QR page.
          </p>
          <p>
            Public docs can be opened by anyone with the link or QR code. Do not upload private, sensitive, or confidential information.
          </p>
          <p>
            If you sign in, QRdocs may use your account identity to manage admin-only actions such as removing a doc.
          </p>
          <p>
            QRdocs runs inside the FireUX ecosystem and uses Firebase services for authentication, storage, and database records.
          </p>
          <p>
            We keep the MVP small: doc hosting, public links, and QR pages. More privacy controls may come later as paid owner tools.
          </p>
        </section>
      </article>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

useSeoMeta({
  title: 'Privacy - QRdocs',
  ogTitle: 'Privacy - QRdocs',
  twitterTitle: 'Privacy - QRdocs',
  description: 'QRdocs privacy notes for public docs, account identity, and Firebase-backed storage.',
  ogDescription: 'QRdocs privacy notes for public docs, account identity, and Firebase-backed storage.',
  twitterDescription: 'QRdocs privacy notes for public docs, account identity, and Firebase-backed storage.',
})
</script>
