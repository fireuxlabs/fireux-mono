<template>
  <UPage>
    <UPageHeader :title="page.title" :description="page.subtitle">
      <template #links>
        <UButton
          :to="`mailto:${eventsContact.email}`"
          label="Plan an event"
          icon="i-lucide-mail"
        />
        <UButton
          :to="`tel:${eventsContact.phone.replace(/\s/g, '')}`"
          :label="eventsContact.phone"
          color="neutral"
          variant="outline"
          icon="i-lucide-phone"
        />
      </template>
    </UPageHeader>

    <UPageBody class="space-y-8">
      <div class="grid gap-4 md:grid-cols-3">
        <UPageCard title="Weddings" description="Celebrate, dine and accommodate guests in one place." icon="i-lucide-heart" />
        <UPageCard title="Celebrations" description="Flexible spaces for family occasions and group gatherings." icon="i-lucide-party-popper" />
        <UPageCard title="Live events" description="A long-standing venue for concerts and community events." icon="i-lucide-music" />
      </div>

      <UAlert
        color="neutral"
        variant="subtle"
        title="Planning something?"
        description="Tell the Bären team about your date, group size and the kind of event you have in mind."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { baerenRinggenbergContent } from '../config/content.config'

const page = baerenRinggenbergContent.pages.events
const eventsContact = baerenRinggenbergContent.contacts.events

definePageMeta({
  layout: 'default',
  nav: {
    key: 'events',
    label: 'Events',
    icon: 'i-lucide-calendar-days',
    order: 40,
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
