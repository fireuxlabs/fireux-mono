<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
definePageMeta({ layout: 'landing' })
useAppLandingSeo({ title: 'FireUX Patterns', description: 'Practical software patterns, explained through real FireUX implementation.', path: '/patterns' })
</script>

<template>
  <UContainer class="max-w-3xl space-y-8 py-12">
    <NuxtLink to="/product" class="text-primary hover:underline">← FireUX product</NuxtLink>
    <header class="space-y-4">
      <p class="fx-type-headline">How we build</p>
      <h1 class="fx-type-page-title text-3xl font-bold text-highlighted sm:text-4xl">FireUX Patterns</h1>
      <p class="text-lg text-muted">Practical software patterns, explained through real implementation: the problem, our approach, and its limits.</p>
    </header>
    <UCard>
      <div class="space-y-3">
        <h2 class="text-xl font-semibold"><NuxtLink to="/patterns/one-action-many-interfaces" class="hover:underline">One action, many interfaces</NuxtLink></h2>
        <p class="text-muted">Keep business decisions with the action that owns them, wherever the request begins.</p>
        <UButton to="/patterns/one-action-many-interfaces" variant="soft" trailing-icon="i-lucide-arrow-right">Read the pattern</UButton>
      </div>
    </UCard>
    <p class="text-sm text-muted">These articles explain our approach. Current source, tests and repository guidance remain the implementation reference. We credit the original authors of the patterns we apply and distinguish their work from our adaptations.</p>
  </UContainer>
</template>
