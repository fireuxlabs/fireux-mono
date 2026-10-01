<template>
  <section class="mx-auto max-w-3xl space-y-6 py-8">
    <h1 class="text-3xl font-semibold">Services</h1>
    <UCard>
      <h2 class="text-xl font-semibold">Ordering</h2>
      <p class="mt-2 text-muted">Take customer orders through your website.</p>
      <UButton class="mt-4" to="/services/ordering" label="Explore ordering" />
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { useSeoMeta } from '#imports'
definePageMeta({ layout: 'landing', requiresAuth: false })
useSeoMeta({ title: 'Services | Misebox' })
</script>
