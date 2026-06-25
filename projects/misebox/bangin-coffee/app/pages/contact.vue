<template>
  <UPage class="bangin-page">
    <main class="bangin-shell">
      <UPageHeader
        class="pageheader"
        title="Contact Bangin Coffee"
        description="Book the mobile coffee bar or follow Bangin Coffee online."
      />

      <UPageBody class="pagebody">
        <div class="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <UPageCard
            title="Book the bar"
            description="Use the public booking form to enquire about weddings, corporate events, festivals, and private parties."
            variant="subtle"
          >
            <template #footer>
              <UButton
                :to="links.contactForm"
                target="_blank"
                color="primary"
                icon="i-lucide-calendar-check"
              >
                Open booking form
              </UButton>
            </template>
          </UPageCard>

          <UPageCard title="Online" variant="subtle">
            <div class="bangin-contact-list">
              <UButton
                :to="links.website"
                target="_blank"
                color="neutral"
                variant="soft"
                icon="i-lucide-globe"
              >
                Website
              </UButton>
              <UButton
                :to="links.instagram"
                target="_blank"
                color="neutral"
                variant="soft"
                icon="i-lucide-instagram"
              >
                Instagram
              </UButton>
              <UButton
                :to="links.facebook"
                target="_blank"
                color="neutral"
                variant="soft"
                icon="i-lucide-facebook"
              >
                Facebook
              </UButton>
            </div>
          </UPageCard>
        </div>
      </UPageBody>
    </main>
  </UPage>
</template>

<script setup lang="ts">
import { banginCoffeeLinks as links } from '../config/content.config'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'contact',
    label: 'Contact',
    icon: 'i-lucide-message-circle',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Contact Bangin Coffee',
  description: 'Book Bangin Coffee or follow the mobile coffee bar online.',
})
</script>
