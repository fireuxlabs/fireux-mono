<template>
  <section class="mx-auto max-w-3xl space-y-6 py-8">
    <NuxtLink to="/services">Services</NuxtLink>
    <h1 class="fx-type-page-title">Ordering</h1>
    <p class="fx-type-description">
      Let customers order from your Kitchen through your website.
    </p>
    <p>
      Choose your Kitchen and Menu, configure ordering, then test the customer
      journey before adding your website snippet.
    </p>
    <UButton
      to="/services/ordering/setup"
      label="Set up ordering"
      icon="i-lucide-arrow-right"
    />
    <p class="fx-type-caption">
      Use your existing Kitchen and Menus, or create them during setup. Ongoing
      management stays in your Workspace.
    </p>
  </section>
</template>
<script setup lang="ts">
import { useSeoMeta } from '#imports'
definePageMeta({ layout: 'landing', requiresAuth: false })
useSeoMeta({ title: 'Ordering | Misebox' })
</script>
