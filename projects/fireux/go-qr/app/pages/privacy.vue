<template>
  <PublicSimplePage
    title="Privacy"
    description="Go QR is for public docs, not private storage."
    back-label="Go QR"
  >
    <section class="space-y-4 text-muted">
      <p>
        When you create a QR doc, we store the uploaded file, the public path, and basic metadata needed to display the doc and QR page.
      </p>
      <p>
        Public docs can be opened by anyone with the link or QR code. Do not upload private, sensitive, or confidential information.
      </p>
      <p>
        If you sign in, Go QR may use your account identity to manage admin-only actions such as removing a doc.
      </p>
      <p>
        Go QR runs inside the FireUX ecosystem and uses Firebase services for authentication, storage, and database records.
      </p>
      <p>
        We keep the MVP small: doc hosting, public links, and QR pages. More privacy controls may come later as paid owner tools.
      </p>
    </section>
  </PublicSimplePage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'privacy',
    label: 'Privacy',
    icon: 'i-lucide-shield',
    order: 50,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Privacy - Go QR',
  ogTitle: 'Privacy - Go QR',
  twitterTitle: 'Privacy - Go QR',
  description: 'Go QR privacy notes for public docs, account identity, and Firebase-backed storage.',
  ogDescription: 'Go QR privacy notes for public docs, account identity, and Firebase-backed storage.',
  twitterDescription: 'Go QR privacy notes for public docs, account identity, and Firebase-backed storage.',
})
</script>
