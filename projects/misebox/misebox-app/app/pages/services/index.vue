<template>
  <section class="mx-auto max-w-3xl space-y-6 py-8">
    <h1 class="fx-type-page-title">Services</h1>
    <UCard>
      <h2 class="fx-type-section-title">Ordering</h2>
      <p class="mt-2 fx-type-body">
        Take customer orders through your website.
      </p>
      <UButton to="/services/ordering" label="Explore ordering" />
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { useSeoMeta } from '#imports'
definePageMeta({ layout: 'landing', requiresAuth: false })
useSeoMeta({ title: 'Services | Misebox' })
</script>
