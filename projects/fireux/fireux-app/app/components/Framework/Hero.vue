<template>
  <section class="ignition-hero" aria-labelledby="ignition-heading">
    <UContainer class="relative">
      <div class="mx-auto max-w-3xl">
        <UBadge color="neutral" variant="subtle" size="lg">{{
          fireuxOffer.category
        }}</UBadge>
        <h1 id="ignition-heading" class="mt-6 fx-type-page-title">
          {{ fireuxOffer.headline }}
        </h1>
        <p class="mx-auto mt-6 max-w-xl fx-type-description">
          {{ fireuxOffer.heroDescription }}
        </p>
        <FrameworkIgnitionPrompt class="mt-10" />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { fireuxOffer } from '../../content/meta/source'
</script>

<style scoped>
.ignition-hero {
  position: relative;
  isolation: isolate;
  background:
    radial-gradient(
      ellipse at 20% 80%,
      color-mix(in srgb, var(--ui-primary) 16%, transparent),
      transparent 55%
    ),
    radial-gradient(
      ellipse at 85% 15%,
      color-mix(in srgb, var(--ui-primary) 8%, transparent),
      transparent 50%
    );
}
</style>
