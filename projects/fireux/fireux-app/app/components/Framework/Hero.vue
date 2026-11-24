<template>
  <section class="framework-hero" aria-labelledby="framework-heading">
    <UContainer class="framework-hero__grid">
      <div class="framework-hero__intro">
        <p class="framework-hero__category fx-type-label">
          {{ fireuxOffer.category }}
        </p>
        <h1
          id="framework-heading"
          class="framework-hero__title fx-type-display-title"
        >
          {{ fireuxOffer.headline }}
        </h1>
        <p class="framework-hero__description fx-type-description">
          {{ fireuxOffer.heroDescription }}
        </p>
        <div class="framework-hero__actions">
          <UButton
            to="/#offering"
            label="Explore your options"
            color="neutral"
            variant="ghost"
            size="xl"
          />
        </div>
      </div>
      <div class="framework-hero__brief">
        <FrameworkIgnitionPrompt />
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { fireuxOffer } from '../../content/meta/source'

</script>

<style scoped>
.framework-hero {
  border-bottom: 1px solid var(--ui-border);
  background:
    radial-gradient(
      ellipse at 82% 26%,
      color-mix(in srgb, var(--ui-primary) 21%, transparent),
      transparent 57%
    ),
    var(--ui-bg);
}

.framework-hero__grid {
  display: grid;
  align-items: center;
  gap: clamp(2rem, 6vw, 6rem);
  padding-block: clamp(3.5rem, 9vw, 9rem);
}

.framework-hero__intro {
  display: grid;
  gap: 1.25rem;
  justify-items: start;
}

.framework-hero__category {
  color: var(--ui-text-toned);
}

.framework-hero__title {
  max-width: 13ch;
  font-size: clamp(2.75rem, 6vw, 5.5rem);
  line-height: 1.02;
  text-wrap: balance;
}

.framework-hero__description {
  max-width: 44ch;
}

.framework-hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.framework-hero__brief {
  min-width: 0;
}

@media (min-width: 64rem) {
  .framework-hero__grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  }
}
</style>
