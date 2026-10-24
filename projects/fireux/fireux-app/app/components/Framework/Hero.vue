<template>
  <section class="ignition-hero" aria-labelledby="ignition-heading">
    <UContainer class="relative py-20 sm:py-28">
      <div class="mx-auto max-w-3xl text-center">
        <UBadge color="neutral" variant="subtle" size="lg">{{
          fireuxOffer.category
        }}</UBadge>
        <h1
          id="ignition-heading"
          class="mt-6 text-4xl font-semibold tracking-tight text-highlighted sm:text-6xl"
        >
          {{ fireuxOffer.headline }}
        </h1>
        <p class="mx-auto mt-6 max-w-xl text-lg text-muted">
          {{ fireuxOffer.heroDescription }}
        </p>
        <FrameworkIgnitionPrompt class="mt-10 text-left" />
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
