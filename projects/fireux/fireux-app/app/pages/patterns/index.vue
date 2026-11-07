<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
definePageMeta({ layout: 'landing' })
useAppLandingSeo({
  title: 'FireUX Patterns',
  description:
    'Practical software patterns, explained through real FireUX implementation.',
  path: '/patterns',
})
</script>

<template>
  <UContainer>
    <ULink to="/product">← FireUX product</ULink>
    <header class="pagebody">
      <p class="fx-type-headline">How we build</p>
      <h1 class="fx-type-page-title">FireUX Patterns</h1>
      <p class="fx-type-description">
        Practical software patterns, explained through real implementation: the
        problem, our approach, and its limits.
      </p>
    </header>
    <UPageCard
      title="Page composition"
      description="Put a page together with Nuxt UI and FireUX components."
      to="/patterns/page-composition"
    />
    <UCard>
      <div class="fx-card-body-stack">
        <h2 class="fx-type-section-title">
          <ULink to="/patterns/one-action-many-interfaces"
            >One action, many interfaces</ULink
          >
        </h2>
        <p class="fx-type-body">
          Keep business decisions with the action that owns them, wherever the
          request begins.
        </p>
        <UButton
          to="/patterns/one-action-many-interfaces"
          variant="soft"
          trailing-icon="i-lucide-arrow-right"
          >Read the pattern</UButton
        >
      </div>
    </UCard>
    <p class="fx-type-caption">
      These articles explain our approach. Current source, tests and repository
      guidance remain the implementation reference. We credit the original
      authors of the patterns we apply and distinguish their work from our
      adaptations.
    </p>
  </UContainer>
</template>
