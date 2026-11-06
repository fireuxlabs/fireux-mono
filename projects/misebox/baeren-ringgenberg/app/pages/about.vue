<template>
  <UPage>
    <UPageHeader :title="page.title" :description="page.subtitle" />

    <UPageBody>
      <UCard>
        <div class="max-w-3xl space-y-3">
          <h2 class="fx-type-section-title">Hotel Bären Ringgenberg</h2>
          <p>
            The Bären brings hotel rooms, regional hospitality, a restaurant, a
            bar and event spaces together in the centre of Ringgenberg.
          </p>
          <p>
            It is close to Lake Brienz, Interlaken and the mountain landscape of
            the Bernese Oberland.
          </p>
        </div>
      </UCard>

      <section id="contact" class="scroll-mt-24 space-y-4">
        <div>
          <h2 class="fx-type-section-title">Contact</h2>
          <p class="mt-1 fx-type-body">
            {{ baerenRinggenbergContent.brand.address }}
          </p>
        </div>

        <UPageGrid>
          <UCard v-for="contact in contacts" :key="contact.email">
            <div class="fx-card-body-stack">
              <h3 class="fx-type-card-heading">{{ contact.label }}</h3>
              <div class="flex flex-col items-start gap-2">
                <UButton
                  :to="`mailto:${contact.email}`"
                  :label="contact.email"
                  color="neutral"
                  variant="link"
                  icon="i-lucide-mail"
                />
                <UButton
                  :to="`tel:${contact.phone.replace(/\s/g, '')}`"
                  :label="contact.phone"
                  color="neutral"
                  variant="link"
                  icon="i-lucide-phone"
                />
              </div>
            </div>
          </UCard>
        </UPageGrid>

        <div class="flex flex-wrap gap-3">
          <UButton
            to="/location"
            label="Map and directions"
            icon="i-lucide-map-pin"
          />
          <UButton
            :to="baerenRinggenbergContent.links.booking"
            target="_blank"
            label="Book a room"
            color="neutral"
            variant="outline"
            icon="i-lucide-calendar-check"
          />
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../config/content.config'

const page = baerenRinggenbergContent.pages.about
const contacts = Object.values(baerenRinggenbergContent.contacts)

definePageMeta({
  layout: 'default',
  nav: {
    key: 'about',
    label: 'About & Contact',
    icon: 'i-lucide-circle-user-round',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>
