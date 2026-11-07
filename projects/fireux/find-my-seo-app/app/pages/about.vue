<template>
  <UPage>
    <UButton to="/" variant="link"> Find My SEO </UButton>
    <UPageHeader
      title="About"
      description="Find My SEO helps people discover SEO professionals."
    />
    <UPageBody>
      <section class="pagebody">
        <p class="fx-type-body">
          Find My SEO is a FireUX standalone app for public SEO profiles,
          services, and discovery surfaces.
        </p>

        <p class="fx-type-body">
          The first version focuses on profile and directory pages before adding
          heavier marketplace mechanics.
        </p>
      </section>

      <div class="fx-card__actions">
        <UButton to="/get-started" icon="i-lucide-users" size="lg">
          Browse professionals
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    order: 25,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'About - Find My SEO',
  description: 'Find My SEO helps people discover SEO professionals.',
})
</script>
